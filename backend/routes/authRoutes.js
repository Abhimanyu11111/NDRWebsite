import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "../src/config/db.js";

const router = express.Router();

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
      return res.status(400).json({ msg: "User not found or blocked" });
    }

    const user = rows[0];

    if (user.role !== "ADMIN") {
      return res.status(403).json({ msg: "Not an admin" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   USER REGISTER
===================================================== */
router.post("/register", async (req, res) => {
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
    return res.status(400).json({ msg: "Required fields missing" });
  }

  try {
    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = ?",
      { replacements: [email] }
    );

    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      `INSERT INTO users
      (name, email, phone, password, address, city, state, pincode,
       id_proof_type, id_proof_number, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USER', 1)`,
      {
        replacements: [
          name,
          email,
          phone,
          hashedPassword,
          address,
          city,
          state,
          pincode,
          id_proof_type,
          id_proof_number,
        ],
      }
    );

    res.json({
      success: true,
      msg: "User registered successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   USER LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      { replacements: [email] }
    );

    if (rows.length === 0) {
      return res.status(400).json({ msg: "User not found or blocked" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
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
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;