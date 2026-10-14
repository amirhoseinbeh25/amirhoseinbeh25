const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const VALID_STATUSES = ["pending", "approved", "rejected"];

router.get("/", requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT rr.*, o.customer_name, o.phone, o.total
    FROM return_requests rr JOIN orders o ON o.id = rr.order_id
    ORDER BY rr.id DESC
  `).all();
  res.json(rows);
});

router.put("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر است." });
  const existing = db.prepare("SELECT 1 FROM return_requests WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "درخواست پیدا نشد." });
  db.prepare("UPDATE return_requests SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json(db.prepare("SELECT * FROM return_requests WHERE id = ?").get(req.params.id));
});

module.exports = router;
