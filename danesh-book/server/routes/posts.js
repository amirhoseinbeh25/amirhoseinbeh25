const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT id, slug, title, excerpt, cover_color, published_at FROM posts ORDER BY id DESC").all());
});

router.get("/admin/all", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM posts ORDER BY id DESC").all());
});

router.get("/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM posts WHERE slug = ?").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "مطلب پیدا نشد." });
  res.json(row);
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.slug || !b.title || !b.content) {
    return res.status(400).json({ error: "شناسه، عنوان و متن مطلب الزامی است." });
  }
  const exists = db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(b.slug);
  if (exists) return res.status(409).json({ error: "این نامک (slug) قبلاً استفاده شده است." });

  const info = db.prepare("INSERT INTO posts (slug, title, excerpt, content, cover_color) VALUES (?, ?, ?, ?, ?)")
    .run(b.slug, b.title, b.excerpt || "", b.content, b.coverColor || "#6d93ac");
  res.status(201).json(db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "مطلب پیدا نشد." });
  const b = req.body || {};
  db.prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, cover_color = ? WHERE id = ?")
    .run(b.title ?? existing.title, b.excerpt ?? existing.excerpt, b.content ?? existing.content, b.coverColor ?? existing.cover_color, req.params.id);
  res.json(db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT 1 FROM posts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "مطلب پیدا نشد." });
  db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
