const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY title").all();
  res.json(rows);
});

router.post("/", requireAdmin, (req, res) => {
  const { id, title, icon } = req.body || {};
  if (!id || !title) return res.status(400).json({ error: "شناسه و عنوان دسته‌بندی الزامی است." });

  const exists = db.prepare("SELECT 1 FROM categories WHERE id = ?").get(id);
  if (exists) return res.status(409).json({ error: "دسته‌بندی با این شناسه از قبل وجود دارد." });

  db.prepare("INSERT INTO categories (id, title, icon) VALUES (?, ?, ?)").run(id, title, icon || "📚");
  res.status(201).json({ id, title, icon: icon || "📚" });
});

router.put("/:id", requireAdmin, (req, res) => {
  const { title, icon } = req.body || {};
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "دسته‌بندی پیدا نشد." });

  db.prepare("UPDATE categories SET title = ?, icon = ? WHERE id = ?")
    .run(title ?? row.title, icon ?? row.icon, req.params.id);
  res.json(db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const inUse = db.prepare("SELECT COUNT(*) AS n FROM products WHERE category_id = ?").get(req.params.id).n;
  if (inUse > 0) {
    return res.status(409).json({ error: `این دسته‌بندی به ${inUse} محصول متصل است و قابل حذف نیست.` });
  }
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
