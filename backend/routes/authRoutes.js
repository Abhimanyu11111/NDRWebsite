import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sequelize from "../src/config/db.js";
import authMiddleware from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { createCaptchaChallenge, verifyCaptchaChallenge } from "../utils/captcha.js";
import { clearActiveSession, setActiveSession } from "../utils/sessionStore.js";

const router = express.Router();
const JWT_OPTIONS = {
  issuer: process.env.JWT_ISSUER || "ndr-portal",
  audience: process.env.JWT_AUDIENCE || "ndr-users",
};
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "ndr_auth";

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.AUTH_COOKIE_SAMESITE || "lax",
  maxAge: 30 * 60 * 1000,
  path: "/",
});

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: undefined,
  });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "login",
  message: "Too many login attempts. Please try again after 15 minutes.",
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "register-upload",
  message: "Too many registration attempts. Please try again after 15 minutes.",
});

const captchaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: "captcha",
  includeEmail: false,
  message: "Too many captcha requests. Please slow down.",
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;
const pincodeRegex = /^\d{6}$/;

const cleanText = (value, maxLength = 255) => {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
};

const requireJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
  return process.env.JWT_SECRET;
};

const requireCaptcha = (req, res, next) => {
  const captchaToken = req.body?.captchaToken;
  const captchaAnswer = req.body?.captchaAnswer;
  if (!verifyCaptchaChallenge({ token: captchaToken, answer: captchaAnswer })) {
    return res.status(400).json({ success: false, msg: "Captcha verification failed" });
  }
  next();
};

router.get("/captcha", captchaLimiter, (req, res) => {
  return res.json({ success: true, captcha: createCaptchaChallenge() });
});

// ── Multer setup for identity certificate upload ──────
// Saves files to /uploads/identity_certificates/
const uploadDir = "uploads/identity_certificates";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_UPLOADS = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".pdf": ["application/pdf"],
};

const hasValidMagicBytes = (buffer, ext) => {
  if ([".jpg", ".jpeg"].includes(ext)) return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (ext === ".png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  return false;
};

const validateUploadedCertificate = (file) => {
  if (!file) return null;

  const original = path.basename(file.originalname || "");
  if (!original || original.includes("\0") || /%00/i.test(original)) {
    throw new Error("Invalid file name");
  }

  if ((original.match(/\./g) || []).length !== 1) {
    throw new Error("Multiple file extensions are not allowed");
  }

  const ext = path.extname(original).toLowerCase();
  if (!ALLOWED_UPLOADS[ext]?.includes(file.mimetype)) {
    throw new Error("Only JPG, PNG, and PDF files are allowed");
  }

  if (!hasValidMagicBytes(file.buffer, ext)) {
    throw new Error("Uploaded file content does not match the file type");
  }

  return ext;
};

const saveCertificate = (file) => {
  const ext = validateUploadedCertificate(file);
  if (!ext) return null;

  const filename = `identity_${Date.now()}_${crypto.randomBytes(12).toString("hex")}${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, file.buffer, { flag: "wx" });
  return filePath.replace(/\\/g, "/");
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const original = file.originalname || "";
    const ext = path.extname(path.basename(original)).toLowerCase();
    if (original.includes("\0") || /%00/i.test(original)) {
      return cb(new Error("Invalid file name"));
    }
    if (!ALLOWED_UPLOADS[ext]?.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and PDF files are allowed"));
    }
    return cb(null, true);
  },
});

/* =====================================================
   ADMIN LOGIN
===================================================== */
router.post("/admin-login", loginLimiter, requireCaptcha, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!emailRegex.test(String(email || "")) || !password) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const [rows] = await sequelize.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      { replacements: [String(email).trim().toLowerCase()] }
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const user = rows[0];

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        msg: "Access denied. Admin privileges required.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      requireJwtSecret(),
      { ...JWT_OPTIONS, expiresIn: "30m" }
    );
    setActiveSession(user.id, user.role, token);
    setAuthCookie(res, token);

    res.json({
      success: true,
      admin: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

/* =====================================================
   USER REGISTER — Now with approval_status = PENDING
   Flow:
     1. User submits registration form
     2. Row inserted with approval_status = 'PENDING', is_active = 0
     3. Admin notification created
     4. Admin reviews → approves/rejects from dashboard
     5. On approve: is_active = 1, approval_status = 'APPROVED'
     6. Only then can user login
===================================================== */
// upload.single("identity_certificate") handles the file field
// All other text fields still come through req.body (multer parses multipart/form-data)
router.post("/register", uploadLimiter, upload.single("identity_certificate"), async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    company,
    address,
    city,
    state,
    pincode,
    id_proof_type,
    id_proof_number,
  } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Name, email and password are required",
    });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ success: false, msg: "Please enter a valid email address" });
  }

  if (phone && !phoneRegex.test(normalizedPhone)) {
    return res.status(400).json({ success: false, msg: "Please enter a valid 10 digit Indian mobile number" });
  }

  if (pincode && !pincodeRegex.test(String(pincode).trim())) {
    return res.status(400).json({ success: false, msg: "Please enter a valid 6 digit pincode" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      msg: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const BLOCKED_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
    "rediffmail.com", "ymail.com", "aol.com", "icloud.com", "protonmail.com",
    "proton.me", "msn.com", "yahoo.in", "yahoo.co.in", "hotmail.co.in",
    "zohomail.com", "mail.com", "gmx.com", "inbox.com", "yandex.com"
  ];
  const emailDomain = normalizedEmail.split("@")[1]?.toLowerCase();
  if (!emailDomain || BLOCKED_DOMAINS.includes(emailDomain)) {
    return res.status(400).json({
      success: false,
      msg: "Personal email addresses (Gmail, Outlook, Hotmail, Yahoo, etc.) are not allowed. Please use your official organization email.",
    });
  }

  try {
    // Check duplicate email
    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = ?",
      { replacements: [normalizedEmail] }
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //  File path if uploaded
    const certificatePath = saveCertificate(req.file);

    //  Insert user with approval_status = PENDING, is_active = 0
    // User cannot login until admin approves
    const [result] = await sequelize.query(
      `INSERT INTO users
        (name, email, phone, password, address, city, state, pincode,
         id_proof_type, id_proof_number, identity_certificate, company, role, is_active, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USER', 0, 'PENDING', NOW(), NOW())`,
      {
        replacements: [
          cleanText(name, 100),
          normalizedEmail,
          normalizedPhone || null,
          hashedPassword,
          cleanText(address, 255),
          cleanText(city, 100),
          cleanText(state, 100),
          cleanText(pincode, 6),
          cleanText(id_proof_type, 100),
          cleanText(id_proof_number, 100),
          certificatePath,
          cleanText(company, 255),
        ],
      }
    );

    const newUserId = result?.insertId || result;

    //  Create admin notification with full user details
    await sequelize.query(
      `INSERT INTO notifications
        (user_id, message, type, is_read, is_active, created_at)
       VALUES (?, ?, 'REGISTRATION', 0, 1, NOW())`,
      {
        replacements: [
          newUserId,
          `New registration request: ${name} (${normalizedEmail})${normalizedPhone ? ` | Phone: ${normalizedPhone}` : ""}${id_proof_type ? ` | ID: ${id_proof_type} - ${id_proof_number}` : ""}. Pending admin approval.`,
        ],
      }
    );

    return res.status(201).json({
      success: true,
      msg: "Registration submitted successfully. Your account is pending admin approval. You will be able to login once approved.",
    });
  } catch (err) {
    console.error("Register error:", err);
    if (
      err.message?.includes("Invalid file") ||
      err.message?.includes("Multiple file") ||
      err.message?.includes("Uploaded file content") ||
      err.message?.includes("Only JPG")
    ) {
      return res.status(400).json({ success: false, msg: err.message });
    }
    res.status(500).json({ success: false, msg: "Server error during registration" });
  }
});

/* =====================================================
   USER LOGIN — Blocks PENDING / REJECTED users
===================================================== */
router.post("/login", loginLimiter, requireCaptcha, async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ success: false, msg: "Email and password are required" });
  }

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ success: false, msg: "Invalid email or password" });
  }

  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM users WHERE email = ?",
      { replacements: [normalizedEmail] }
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    const user = rows[0];

    //  Check approval status FIRST
    if (user.approval_status === "PENDING") {
      return res.status(403).json({
        success: false,
        msg: "Your account is pending admin approval. Please wait for approval before logging in.",
        approval_status: "PENDING",
      });
    }

    if (user.approval_status === "REJECTED") {
      return res.status(403).json({
        success: false,
        msg: "Your registration has been rejected. Please contact support for assistance.",
        approval_status: "REJECTED",
      });
    }

    //  Check is_active (blocked by admin after approval)
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been deactivated. Please contact support.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "USER" },
      requireJwtSecret(),
      { ...JWT_OPTIONS, expiresIn: "30m" }
    );
    setActiveSession(user.id, user.role || "USER", token);
    setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

// ── Multer error handler ──────────────────────────────
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, msg: "Current and new password are required" });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      msg: "New password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const [rows] = await sequelize.query(
      "SELECT id, password, role FROM users WHERE id = ? AND is_active = 1",
      { replacements: [req.user.id] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, msg: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await sequelize.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      { replacements: [hashedPassword, user.id] }
    );

    clearActiveSession(user.id, user.role || "USER");
    return res.json({ success: true, msg: "Password changed successfully. Please login again." });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, msg: "Server error while changing password" });
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  clearActiveSession(req.user.id, req.user.role || "USER");
  clearAuthCookie(res);
  return res.json({ success: true, msg: "Logged out successfully" });
});

router.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message?.includes("Only JPG") ||
    err.message?.includes("Invalid file") ||
    err.message?.includes("Multiple file") ||
    err.message?.includes("Uploaded file content")
  ) {
    return res.status(400).json({ success: false, msg: err.message });
  }
  next(err);
});

export default router;
