import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ msg: err.message });

      const user = result[0];
      if (!user) return res.status(400).json({ msg: "User not found" });

      if (user.role !== "admin")
        return res.status(403).json({ msg: "Not an admin" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ msg: "Invalid password" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      res.json({
        token,
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }
  );
};
