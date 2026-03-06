import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import sequelize from "../src/config/db.js";

const router = express.Router();

// ── Multer setup for identity certificate upload ──────
// Saves files to /uploads/identity_certificates/
const uploadDir = "uploads/identity_certificates";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    // e.g. identity_1717000000000_originalname.jpg
    const unique = `identity_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only JPG, PNG, PDF files are allowed"));
  },
});

/* =====================================================
   ADMIN LOGIN
===================================================== */
router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      { replacements: [email] }
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "User not found or account is blocked",
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
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
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
router.post("/register", upload.single("identity_certificate"), async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    address,
    city,
    state,
    pincode,
    id_proof_type,
    id_proof_number,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Name, email and password are required",
    });
  }

  try {
    // Check duplicate email
    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = ?",
      { replacements: [email] }
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ File path if uploaded
    const certificatePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // ✅ Insert user with approval_status = PENDING, is_active = 0
    // User cannot login until admin approves
    const [result] = await sequelize.query(
      `INSERT INTO users
        (name, email, phone, password, address, city, state, pincode,
         id_proof_type, id_proof_number, identity_certificate, role, is_active, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USER', 0, 'PENDING', NOW(), NOW())`,
      {
        replacements: [
          name,
          email,
          phone || null,
          hashedPassword,
          address || null,
          city || null,
          state || null,
          pincode || null,
          id_proof_type || null,
          id_proof_number || null,
          certificatePath,
        ],
      }
    );

    const newUserId = result; // insertId from MySQL

    // ✅ Create admin notification with full user details
    await sequelize.query(
      `INSERT INTO notifications
        (user_id, message, type, is_read, is_active, created_at)
       VALUES (?, ?, 'REGISTRATION', 0, 1, NOW())`,
      {
        replacements: [
          newUserId,
          `New registration request: ${name} (${email})${phone ? ` | Phone: ${phone}` : ""}${id_proof_type ? ` | ID: ${id_proof_type} - ${id_proof_number}` : ""}. Pending admin approval.`,
        ],
      }
    );

    return res.status(201).json({
      success: true,
      msg: "Registration submitted successfully. Your account is pending admin approval. You will be able to login once approved.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, msg: "Server error during registration" });
  }
});

/* =====================================================
   USER LOGIN — Blocks PENDING / REJECTED users
===================================================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM users WHERE email = ?",
      { replacements: [email] }
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No account found with this email",
      });
    }

    const user = rows[0];

    // ✅ Check approval status FIRST
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

    // ✅ Check is_active (blocked by admin after approval)
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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

// ── Multer error handler ──────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("Only JPG")) {
    return res.status(400).json({ success: false, msg: err.message });
  }
  next(err);
});

export default router;