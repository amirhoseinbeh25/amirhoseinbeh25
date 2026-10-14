const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signCustomerToken, requireCustomer } = require("../middleware/auth");

const router = express.Router();

function normalizePhone(phone) {
  return String(phone || "").trim();
}

router.post("/register", (req, res) => {
  const { name, phone, email, password } = req.body || {};
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "نام، شماره موبایل و رمز عبور الزامی است." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد." });
  }
  const phoneNorm = normalizePhone(phone);
  const exists = db.prepare("SELECT 1 FROM users WHERE phone = ?").get(phoneNorm);
  if (exists) return res.status(409).json({ error: "حسابی با این شماره موبایل قبلاً ثبت شده است." });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (name, phone, email, password_hash) VALUES (?, ?, ?, ?)")
    .run(name.trim(), phoneNorm, email ? email.trim() : null, hash);

  const user = db.prepare("SELECT id, name, phone, email, points FROM users WHERE id = ?").get(info.lastInsertRowid);
  const token = signCustomerToken(user);
  res.status(201).json({ token, user });
});

router.post("/login", (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password) return res.status(400).json({ error: "شماره موبایل و رمز عبور الزامی است." });

  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(normalizePhone(phone));
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "شماره موبایل یا رمز عبور اشتباه است." });
  }
  const token = signCustomerToken(user);
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, points: user.points } });
});

router.get("/me", requireCustomer, (req, res) => {
  const user = db.prepare("SELECT id, name, phone, email, points FROM users WHERE id = ?").get(req.customer.sub);
  if (!user) return res.status(404).json({ error: "کاربر پیدا نشد." });
  res.json(user);
});

module.exports = router;
