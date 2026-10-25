const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT id, slug, title, excerpt, cover_color, cover_image, published_at FROM posts ORDER BY id DESC").all());
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
  const slug = v.text(b.slug, { required: true, max: 80, label: "نامک" }).toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) {
    return res.status(400).json({ error: "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد." });
  }
  const exists = db.prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug);
  if (exists) return res.status(409).json({ error: "این نامک (slug) قبلاً استفاده شده است." });

  const info = db.prepare("INSERT INTO posts (slug, title, excerpt, content, cover_color, cover_image) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      slug,
      v.text(b.title, { required: true, max: 200, label: "عنوان" }),
      v.text(b.excerpt, { max: 500, label: "خلاصه" }),
      v.text(b.content, { required: true, max: 60000, label: "متن مطلب" }),
      v.color(b.coverColor, "#6d93ac"),
      v.imageUrl(b.coverImage, "تصویر کاور")
    );
  res.status(201).json(db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "مطلب پیدا نشد." });
  const b = req.body || {};
  db.prepare("UPDATE posts SET title = ?, excerpt = ?, content = ?, cover_color = ?, cover_image = ? WHERE id = ?")
    .run(
      b.title !== undefined ? v.text(b.title, { required: true, max: 200, label: "عنوان" }) : existing.title,
      b.excerpt !== undefined ? v.text(b.excerpt, { max: 500, label: "خلاصه" }) : existing.excerpt,
      b.content !== undefined ? v.text(b.content, { required: true, max: 60000, label: "متن مطلب" }) : existing.content,
      b.coverColor !== undefined ? v.color(b.coverColor, existing.cover_color) : existing.cover_color,
      b.coverImage !== undefined ? v.imageUrl(b.coverImage, "تصویر کاور") : existing.cover_image,
      req.params.id
    );
  res.json(db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT 1 FROM posts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "مطلب پیدا نشد." });
  db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
