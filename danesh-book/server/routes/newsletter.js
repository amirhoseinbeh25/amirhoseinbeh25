const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { rateLimit } = require("../middleware/rateLimit");
const v = require("../lib/validate");

const router = express.Router();

router.post("/", rateLimit({ windowMs: 10 * 60 * 1000, max: 10 }), (req, res) => {
  const email = v.text(req.body && req.body.email, { required: true, max: 120, label: "ایمیل" }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "ایمیل وارد‌شده معتبر نیست." });
  db.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").run(email);
  res.status(201).json({ ok: true });
});

router.get("/", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM newsletter_subscribers ORDER BY id DESC").all());
});

router.delete("/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM newsletter_subscribers WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "مشترک پیدا نشد." });
  res.status(204).end();
});

module.exports = router;
