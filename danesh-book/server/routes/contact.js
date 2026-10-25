const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { rateLimit } = require("../middleware/rateLimit");
const v = require("../lib/validate");

const router = express.Router();

router.post("/", rateLimit({ windowMs: 10 * 60 * 1000, max: 5 }), (req, res) => {
  const b = req.body || {};
  const name = v.text(b.name, { required: true, max: 80, label: "نام" });
  const email = v.text(b.email, { max: 120, label: "ایمیل" });
  const phone = v.text(b.phone, { max: 20, label: "شماره تماس" });
  const subject = v.text(b.subject, { max: 150, label: "موضوع" });
  const message = v.text(b.message, { required: true, max: 3000, label: "متن پیام" });
  if (!email && !phone) return res.status(400).json({ error: "برای پاسخ‌گویی، ایمیل یا شماره تماس خود را وارد کنید." });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "ایمیل وارد‌شده معتبر نیست." });

  db.prepare("INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)")
    .run(name, email || null, phone || null, subject || null, message);
  res.status(201).json({ ok: true });
});

router.get("/", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM contact_messages ORDER BY id DESC").all());
});

router.put("/:id/read", requireAdmin, (req, res) => {
  const isRead = !(req.body && req.body.read === false);
  const info = db.prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?").run(isRead ? 1 : 0, req.params.id);
  if (!info.changes) return res.status(404).json({ error: "پیام پیدا نشد." });
  res.json(db.prepare("SELECT * FROM contact_messages WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM contact_messages WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "پیام پیدا نشد." });
  res.status(204).end();
});

module.exports = router;
