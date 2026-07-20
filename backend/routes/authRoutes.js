import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sequelize from "../src/config/db.js";
import RegistrationOtp from "../models/RegistrationOtp.js";
import authMiddleware from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { createCaptchaChallenge, verifyCaptchaChallenge } from "../utils/captcha.js";
import { clearActiveSession, setActiveSession } from "../utils/sessionStore.js";
import { sendPasswordResetEmail, sendRegistrationOtpEmail } from "../src/services/emailService.js";
import {
  generateRegistrationOtp,
  generateRegistrationVerificationToken,
  hashRegistrationOtp,
  hashRegistrationVerificationToken,
  isRegistrationVerificationValid,
  REGISTRATION_OTP_MAX_ATTEMPTS,
  REGISTRATION_OTP_RESEND_SECONDS,
  REGISTRATION_OTP_TTL_MINUTES,
  REGISTRATION_OTP_TTL_MS,
  safeHashEquals,
} from "../utils/registrationOtp.js";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "../utils/passwordReset.js";
import { getPublicKeyPem, decryptPasswordField } from "../utils/passwordCrypto.js";
import { validateRequestPayload } from "../middleware/security.js";

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

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "password-reset",
  message: "Too many password reset attempts. Please try again after 15 minutes.",
});

const registrationOtpSendLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  keyPrefix: "registration-otp-send",
  message: "Too many OTP requests. Please try again after 30 minutes.",
});

const registrationOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "registration-otp-verify",
  message: "Too many OTP verification attempts. Please try again after 15 minutes.",
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;
const pincodeRegex = /^\d{6}$/;

const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "rediffmail.com", "ymail.com", "aol.com", "icloud.com", "protonmail.com",
  "proton.me", "msn.com", "yahoo.in", "yahoo.co.in", "hotmail.co.in",
  "zohomail.com", "mail.com", "gmx.com", "inbox.com", "yandex.com",
];

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isOfficialEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const domain = normalizedEmail.split("@")[1];
  return emailRegex.test(normalizedEmail) && domain && !BLOCKED_DOMAINS.includes(domain);
};

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

// Public RSA key used by the frontend to encrypt password fields before
// transmission (see utils/passwordCrypto.js for why this exists on top of
// TLS). Safe to expose — that's the point of public-key cryptography.
router.get("/public-key", (req, res) => {
  return res.json({ success: true, publicKey: getPublicKeyPem() });
});

router.post("/registration-otp/send", registrationOtpSendLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isOfficialEmail(email)) {
    return res.status(400).json({
      success: false,
      msg: "Please use a valid official organization email address.",
    });
  }

  try {
    const [existingUser] = await sequelize.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      { replacements: [email] }
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, msg: "This email is already registered" });
    }

    const existingOtp = await RegistrationOtp.findOne({ where: { email } });
    const now = Date.now();
    const resendAt = existingOtp?.resend_available_at
      ? new Date(existingOtp.resend_available_at).getTime()
      : 0;

    if (resendAt > now) {
      const retryAfterSeconds = Math.ceil((resendAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        msg: `Please wait ${retryAfterSeconds} seconds before requesting another OTP.`,
        retryAfterSeconds,
      });
    }

    const otp = generateRegistrationOtp(email, existingOtp?.otp_hash);
    const otpHash = hashRegistrationOtp(email, otp);

    await RegistrationOtp.upsert({
      email,
      otp_hash: otpHash,
      expires_at: new Date(now + REGISTRATION_OTP_TTL_MS),
      resend_available_at: new Date(now + REGISTRATION_OTP_RESEND_SECONDS * 1000),
      failed_attempts: 0,
      verified_at: null,
      verification_token_hash: null,
      verification_expires_at: null,
      consumed_at: null,
    });

    const emailSent = await sendRegistrationOtpEmail({
      email,
      otp,
      expiresMinutes: REGISTRATION_OTP_TTL_MINUTES,
    });

    if (!emailSent) {
      await RegistrationOtp.update(
        { expires_at: new Date(), resend_available_at: new Date() },
        { where: { email } }
      );
      return res.status(503).json({
        success: false,
        msg: "Unable to send verification email right now. Please try again shortly.",
      });
    }

    return res.json({
      success: true,
      msg: "Verification OTP sent to your email address.",
      expiresInMinutes: REGISTRATION_OTP_TTL_MINUTES,
      resendAfterSeconds: REGISTRATION_OTP_RESEND_SECONDS,
    });
  } catch (err) {
    console.error("Registration OTP send error:", err);
    return res.status(500).json({ success: false, msg: "Unable to send verification OTP" });
  }
});

router.post("/registration-otp/verify", registrationOtpVerifyLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || "").trim();

  if (!isOfficialEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, msg: "Enter a valid 6 digit OTP" });
  }

  try {
    const record = await RegistrationOtp.findOne({ where: { email } });
    const now = Date.now();
    const isExpired = !record?.otp_hash || new Date(record?.expires_at).getTime() <= now;

    if (!record || isExpired || record.failed_attempts >= REGISTRATION_OTP_MAX_ATTEMPTS) {
      return res.status(400).json({ success: false, msg: "OTP is invalid or expired. Request a new OTP." });
    }

    const submittedHash = hashRegistrationOtp(email, otp);
    if (!safeHashEquals(record.otp_hash, submittedHash)) {
      record.failed_attempts += 1;
      if (record.failed_attempts >= REGISTRATION_OTP_MAX_ATTEMPTS) {
        record.expires_at = new Date();
      }
      await record.save();
      const attemptsRemaining = Math.max(0, REGISTRATION_OTP_MAX_ATTEMPTS - record.failed_attempts);
      return res.status(400).json({
        success: false,
        msg: attemptsRemaining
          ? `Incorrect OTP. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Request a new OTP.",
      });
    }

    const verificationToken = generateRegistrationVerificationToken();
    record.expires_at = new Date();
    record.verified_at = new Date(now);
    record.verification_token_hash = hashRegistrationVerificationToken(verificationToken);
    record.verification_expires_at = new Date(now + REGISTRATION_OTP_TTL_MS);
    record.consumed_at = null;
    record.failed_attempts = 0;
    await record.save();

    return res.json({
      success: true,
      msg: "Email address verified successfully.",
      verificationToken,
      expiresInMinutes: REGISTRATION_OTP_TTL_MINUTES,
    });
  } catch (err) {
    console.error("Registration OTP verify error:", err);
    return res.status(500).json({ success: false, msg: "Unable to verify OTP" });
  }
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
  const { email } = req.body;
  const password = decryptPasswordField(req.body.password);

  try {
    if (password === null) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }
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
//
// The app-wide validateRequestPayload sanitizer (index.js) runs before
// express.json()/urlencoded() have anything to check for a multipart/
// form-data request — multer is what actually parses this body, and it
// only runs here, per-route. So the same check is re-applied immediately
// after multer populates req.body, otherwise `<`, `>`, `{`, `}`, `"` etc.
// in registration fields would silently bypass the global sanitizer.
router.post("/register", uploadLimiter, upload.single("identity_certificate"), validateRequestPayload, async (req, res) => {
  const {
    name,
    email,
    phone,
    company,
    address,
    city,
    state,
    pincode,
    id_proof_type,
    id_proof_number,
    email_verification_token,
  } = req.body;
  const password = decryptPasswordField(req.body.password);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = String(phone || "").replace(/\D/g, "");

  if (password === null) {
    return res.status(400).json({ success: false, msg: "Invalid request" });
  }
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Name, email and password are required",
    });
  }

  if (!isOfficialEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, msg: "Please use a valid official organization email address" });
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

  if (!/^[a-f0-9]{64}$/i.test(String(email_verification_token || ""))) {
    return res.status(400).json({ success: false, msg: "Please verify your email address before registering" });
  }

  let certificatePath = null;
  let transaction = null;

  const removeSavedCertificate = () => {
    if (!certificatePath) return;
    try {
      const resolvedPath = path.resolve(certificatePath);
      const certificateRoot = path.resolve(uploadDir);
      if (resolvedPath.startsWith(`${certificateRoot}${path.sep}`) && fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
      }
    } catch (cleanupError) {
      console.error("Registration certificate cleanup error:", cleanupError);
    }
  };

  try {
    const verificationTokenHash = hashRegistrationVerificationToken(email_verification_token);
    const verification = await RegistrationOtp.findOne({ where: { email: normalizedEmail } });
    if (!isRegistrationVerificationValid(verification, verificationTokenHash)) {
      return res.status(400).json({
        success: false,
        msg: "Email verification is invalid or expired. Please verify your email again.",
      });
    }

    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      { replacements: [normalizedEmail] }
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    certificatePath = saveCertificate(req.file);
    transaction = await sequelize.transaction();

    // Lock the verification row so the token cannot be consumed by two
    // simultaneous registration requests.
    const lockedVerification = await RegistrationOtp.findOne({
      where: { email: normalizedEmail },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!isRegistrationVerificationValid(lockedVerification, verificationTokenHash)) {
      await transaction.rollback();
      transaction = null;
      removeSavedCertificate();
      return res.status(400).json({
        success: false,
        msg: "Email verification has already been used or has expired.",
      });
    }

    const [duplicateInsideTransaction] = await sequelize.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1 FOR UPDATE",
      { replacements: [normalizedEmail], transaction }
    );
    if (duplicateInsideTransaction.length > 0) {
      await transaction.rollback();
      transaction = null;
      removeSavedCertificate();
      return res.status(400).json({ success: false, msg: "This email is already registered" });
    }

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
        transaction,
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
        transaction,
      }
    );

    lockedVerification.consumed_at = new Date();
    lockedVerification.verification_token_hash = null;
    lockedVerification.verification_expires_at = new Date();
    await lockedVerification.save({ transaction });
    await transaction.commit();
    transaction = null;

    return res.status(201).json({
      success: true,
      msg: "Registration submitted successfully. Your account is pending admin approval. You will be able to login once approved.",
    });
  } catch (err) {
    if (transaction && !transaction.finished) await transaction.rollback();
    removeSavedCertificate();
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
  const { email } = req.body;
  const password = decryptPasswordField(req.body.password);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (password === null) {
    return res.status(400).json({ success: false, msg: "Invalid email or password" });
  }
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

router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
  const genericMessage = "If an active account exists for this email, a password reset link has been sent.";

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ success: false, msg: "Please enter a valid email address." });
  }

  try {
    const [rows] = await sequelize.query(
      "SELECT id, name, email FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
      { replacements: [normalizedEmail] }
    );

    if (rows.length === 0) {
      return res.json({ success: true, msg: genericMessage });
    }

    const user = rows[0];
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    await sequelize.query(
      `UPDATE users
       SET password_reset_token_hash = ?,
           password_reset_expires_at = DATE_ADD(NOW(), INTERVAL ${PASSWORD_RESET_TTL_MINUTES} MINUTE),
           password_reset_requested_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      { replacements: [tokenHash, user.id] }
    );

    const frontendUrl = String(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl: `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`,
      expiresMinutes: PASSWORD_RESET_TTL_MINUTES,
    });

    return res.json({ success: true, msg: genericMessage });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, msg: "Unable to process the request right now. Please try again." });
  }
});

router.get("/reset-password/validate", passwordResetLimiter, async (req, res) => {
  const token = String(req.query?.token || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ success: false, msg: "This password reset link is invalid or has expired." });
  }

  try {
    const [rows] = await sequelize.query(
      `SELECT id FROM users
       WHERE password_reset_token_hash = ? AND password_reset_expires_at > NOW()
         AND is_active = 1 LIMIT 1`,
      { replacements: [hashPasswordResetToken(token)] }
    );
    if (rows.length === 0) {
      return res.status(400).json({ success: false, msg: "This password reset link is invalid or has expired." });
    }
    return res.json({ success: true, msg: "Password reset link is valid." });
  } catch (err) {
    console.error("Reset token validation error:", err);
    return res.status(500).json({ success: false, msg: "Unable to validate the reset link right now." });
  }
});

router.post("/reset-password", passwordResetLimiter, async (req, res) => {
  const token = String(req.body?.token || "");
  const decryptedNewPassword = decryptPasswordField(req.body?.newPassword);
  if (decryptedNewPassword === null) {
    return res.status(400).json({ success: false, msg: "Invalid request" });
  }
  const newPassword = String(decryptedNewPassword || "");

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ success: false, msg: "This password reset link is invalid or has expired." });
  }
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      msg: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const [rows] = await sequelize.query(
      `SELECT id, password, role FROM users
       WHERE password_reset_token_hash = ? AND password_reset_expires_at > NOW()
         AND is_active = 1 LIMIT 1 FOR UPDATE`,
      { replacements: [hashPasswordResetToken(token)], transaction }
    );
    if (rows.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, msg: "This password reset link is invalid or has expired." });
    }

    const user = rows[0];
    if (await bcrypt.compare(newPassword, user.password)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, msg: "Please choose a password different from your current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await sequelize.query(
      `UPDATE users SET password = ?, password_reset_token_hash = NULL,
       password_reset_expires_at = NULL, password_reset_requested_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [hashedPassword, user.id], transaction }
    );
    await transaction.commit();

    clearActiveSession(user.id, user.role || "USER");
    clearAuthCookie(res);
    return res.json({ success: true, msg: "Password reset successfully. Please sign in with your new password." });
  } catch (err) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, msg: "Unable to reset the password right now. Please try again." });
  }
});

// ── Multer error handler ──────────────────────────────
router.post("/change-password", authMiddleware, async (req, res) => {
  const currentPassword = decryptPasswordField(req.body.currentPassword);
  const newPassword = decryptPasswordField(req.body.newPassword);

  if (currentPassword === null || newPassword === null) {
    return res.status(400).json({ success: false, msg: "Invalid request" });
  }
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
