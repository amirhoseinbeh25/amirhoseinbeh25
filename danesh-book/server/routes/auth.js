const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "ایمیل و رمز عبور الزامی است." });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(String(email).trim().toLowerCase());
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "ایمیل یا رمز عبور اشتباه است." });
  }

  const token = signToken(admin);
  res.json({ token, admin: { email: admin.email, name: admin.name } });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
