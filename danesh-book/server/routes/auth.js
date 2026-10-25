const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken, requireAdmin } = require("../middleware/auth");
const { createLoginGuard } = require("../middleware/rateLimit");
const v = require("../lib/validate");

const router = express.Router();
const loginGuard = createLoginGuard();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "ایمیل و رمز عبور الزامی است." });
  }
  const account = String(email).trim().toLowerCase();
  if (loginGuard.blocked(req, account)) return res.status(429).json({ error: loginGuard.message });

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(account);
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    loginGuard.fail(req, account);
    return res.status(401).json({ error: "ایمیل یا رمز عبور اشتباه است." });
  }
  loginGuard.success(req, account);

  const token = signToken(admin);
  res.json({ token, admin: { email: admin.email, name: admin.name } });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// تغییر نام، ایمیل ورود یا رمز عبور مدیر (با تایید رمز فعلی)
router.put("/account", requireAdmin, (req, res) => {
  const b = req.body || {};
  const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.admin.sub);
  if (!admin) return res.status(404).json({ error: "حساب مدیر پیدا نشد." });
  if (!b.currentPassword || !bcrypt.compareSync(String(b.currentPassword), admin.password_hash)) {
    return res.status(400).json({ error: "رمز عبور فعلی اشتباه است." });
  }

  const name = b.name !== undefined ? v.text(b.name, { required: true, max: 80, label: "نام" }) : admin.name;
  let email = admin.email;
  if (b.email !== undefined) {
    email = v.text(b.email, { required: true, max: 120, label: "ایمیل" }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "ایمیل وارد‌شده معتبر نیست." });
    const taken = db.prepare("SELECT 1 FROM admins WHERE email = ? AND id != ?").get(email, admin.id);
    if (taken) return res.status(409).json({ error: "این ایمیل برای حساب دیگری استفاده شده است." });
  }
  let hash = admin.password_hash;
  if (b.newPassword) {
    if (String(b.newPassword).length < 8) return res.status(400).json({ error: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد." });
    hash = bcrypt.hashSync(String(b.newPassword), 10);
  }

  db.prepare("UPDATE admins SET name = ?, email = ?, password_hash = ? WHERE id = ?").run(name, email, hash, admin.id);
  const updated = db.prepare("SELECT * FROM admins WHERE id = ?").get(admin.id);
  res.json({ token: signToken(updated), admin: { email: updated.email, name: updated.name } });
});

module.exports = router;
