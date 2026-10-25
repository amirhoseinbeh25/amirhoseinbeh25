const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

function mapPage(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    icon: row.icon,
    subtitle: row.subtitle,
    bannerImage: row.banner_image,
    content: row.content,
    isSystem: !!row.is_system,
    active: !!row.active,
    updatedAt: row.updated_at
  };
}

function readPage(b, current = {}) {
  const pick = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);
  return {
    title: v.text(pick("title", current.title), { required: true, max: 150, label: "عنوان صفحه" }),
    icon: v.text(pick("icon", current.icon), { max: 16, label: "آیکون" }),
    subtitle: v.text(pick("subtitle", current.subtitle), { max: 300, label: "زیرعنوان" }),
    banner_image: v.imageUrl(pick("bannerImage", current.banner_image), "تصویر بنر"),
    content: v.text(pick("content", current.content), { max: 60000, label: "متن صفحه" }),
    active: v.bool(pick("active", current.active), true) ? 1 : 0
  };
}

// فهرست عمومی صفحات فعال (برای لینک‌دادن در منوها)
router.get("/", (req, res) => {
  res.json(db.prepare("SELECT id, slug, title, icon, is_system FROM pages WHERE active = 1 ORDER BY is_system DESC, id")
    .all().map(r => ({ id: r.id, slug: r.slug, title: r.title, icon: r.icon, isSystem: !!r.is_system })));
});

router.get("/admin/all", requireAdmin, (req, res) => {
  res.json(db.prepare("SELECT * FROM pages ORDER BY is_system DESC, id").all().map(mapPage));
});

router.get("/:slug", (req, res) => {
  const row = db.prepare("SELECT * FROM pages WHERE slug = ? AND active = 1").get(req.params.slug);
  if (!row) return res.status(404).json({ error: "صفحه پیدا نشد." });
  res.json(mapPage(row));
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  const slug = v.text(b.slug, { required: true, max: 60, label: "نامک (slug)" }).toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(slug)) {
    return res.status(400).json({ error: "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد." });
  }
  if (db.prepare("SELECT 1 FROM pages WHERE slug = ?").get(slug)) {
    return res.status(409).json({ error: "صفحه‌ای با این نامک از قبل وجود دارد." });
  }
  const p = readPage(b);
  const info = db.prepare(`
    INSERT INTO pages (slug, title, icon, subtitle, banner_image, content, active) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(slug, p.title, p.icon, p.subtitle, p.banner_image, p.content, p.active);
  res.status(201).json(mapPage(db.prepare("SELECT * FROM pages WHERE id = ?").get(info.lastInsertRowid)));
});

router.put("/:id", requireAdmin, (req, res) => {
  const current = db.prepare("SELECT * FROM pages WHERE id = ?").get(req.params.id);
  if (!current) return res.status(404).json({ error: "صفحه پیدا نشد." });
  const p = readPage(req.body || {}, current);
  db.prepare(`
    UPDATE pages SET title = ?, icon = ?, subtitle = ?, banner_image = ?, content = ?, active = ?, updated_at = datetime('now') WHERE id = ?
  `).run(p.title, p.icon, p.subtitle, p.banner_image, p.content, current.is_system ? 1 : p.active, current.id);
  res.json(mapPage(db.prepare("SELECT * FROM pages WHERE id = ?").get(current.id)));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const current = db.prepare("SELECT * FROM pages WHERE id = ?").get(req.params.id);
  if (!current) return res.status(404).json({ error: "صفحه پیدا نشد." });
  if (current.is_system) return res.status(409).json({ error: "صفحات اصلی سایت قابل حذف نیستند؛ فقط می‌توانید متن آن‌ها را ویرایش کنید." });
  db.prepare("DELETE FROM pages WHERE id = ?").run(current.id);
  res.status(204).end();
});

module.exports = router;
