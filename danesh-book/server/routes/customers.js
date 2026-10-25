const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signCustomerToken, requireCustomer, requireAdmin } = require("../middleware/auth");
const { createLoginGuard, rateLimit } = require("../middleware/rateLimit");

const router = express.Router();
const loginGuard = createLoginGuard();

function normalizePhone(phone) {
  return String(phone || "").trim();
}

router.post("/register", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), (req, res) => {
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

  const account = normalizePhone(phone);
  if (loginGuard.blocked(req, account)) return res.status(429).json({ error: loginGuard.message });

  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(account);
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    loginGuard.fail(req, account);
    return res.status(401).json({ error: "شماره موبایل یا رمز عبور اشتباه است." });
  }
  loginGuard.success(req, account);
  const token = signCustomerToken(user);
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, points: user.points } });
});

router.get("/me", requireCustomer, (req, res) => {
  const user = db.prepare("SELECT id, name, phone, email, points FROM users WHERE id = ?").get(req.customer.sub);
  if (!user) return res.status(404).json({ error: "کاربر پیدا نشد." });
  res.json(user);
});

// فهرست مشتریان برای پنل ادمین
router.get("/", requireAdmin, (req, res) => {
  res.json(db.prepare(`
    SELECT u.id, u.name, u.phone, u.email, u.points, u.created_at,
      (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
      (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'paid') AS total_paid
    FROM users u ORDER BY u.id DESC
  `).all());
});

module.exports = router;
