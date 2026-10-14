const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM settings").all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

router.put("/", requireAdmin, (req, res) => {
  const updates = req.body || {};
  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  for (const [key, value] of Object.entries(updates)) {
    upsert.run(key, String(value));
  }
  const rows = db.prepare("SELECT * FROM settings").all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

module.exports = router;
