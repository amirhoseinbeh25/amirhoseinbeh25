const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const VALID_STATUSES = ["new", "contacted", "closed"];

router.post("/", (req, res) => {
  const { schoolName, contactName, phone, grade, track, itemsNote } = req.body || {};
  if (!schoolName || !contactName || !phone) {
    return res.status(400).json({ error: "نام مدرسه، نام مسئول و شماره تماس الزامی است." });
  }
  const info = db.prepare(`
    INSERT INTO bulk_orders (school_name, contact_name, phone, grade, track, items_note)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(schoolName.trim(), contactName.trim(), phone.trim(), grade || null, track || null, itemsNote || "");
  res.status(201).json(db.prepare("SELECT * FROM bulk_orders WHERE id = ?").get(info.lastInsertRowid));
});

router.get("/", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM bulk_orders ORDER BY id DESC").all());
});

router.put("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر است." });
  const existing = db.prepare("SELECT 1 FROM bulk_orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "درخواست پیدا نشد." });
  db.prepare("UPDATE bulk_orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json(db.prepare("SELECT * FROM bulk_orders WHERE id = ?").get(req.params.id));
});

module.exports = router;
