/*
 * مسیرهای مشترک برای طبقه‌بندی‌های کتاب: درس (دسته‌بندی)، پایه تحصیلی و رشته.
 * هر سه قابل افزودن، ویرایش، حذف و مرتب‌سازی از پنل ادمین هستند.
 */
const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

function createTaxonomyRouter({ table, idPrefix, productColumn, noun, withMedia = false }) {
  const router = express.Router();

  function mapRow(row) {
    const out = { id: row.id, title: row.title, sortOrder: row.sort_order, productCount: row.product_count };
    if (withMedia) {
      out.icon = row.icon;
      out.imageUrl = row.image_url;
    }
    return out;
  }

  function listAll() {
    return db.prepare(`
      SELECT t.*, (SELECT COUNT(*) FROM products p WHERE p.${productColumn} = t.id) AS product_count
      FROM ${table} t ORDER BY t.sort_order, t.rowid
    `).all().map(mapRow);
  }

  function getOne(id) {
    const row = db.prepare(`
      SELECT t.*, (SELECT COUNT(*) FROM products p WHERE p.${productColumn} = t.id) AS product_count
      FROM ${table} t WHERE t.id = ?
    `).get(id);
    return row ? mapRow(row) : null;
  }

  router.get("/", (req, res) => res.json(listAll()));

  router.post("/", requireAdmin, (req, res) => {
    const b = req.body || {};
    const id = v.slugId(b.id, idPrefix);
    const title = v.text(b.title, { required: true, max: 80, label: "عنوان" });
    if (db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id)) {
      return res.status(409).json({ error: `${noun} با این شناسه از قبل وجود دارد.` });
    }
    const nextOrder = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ${table}`).get().n;
    if (withMedia) {
      db.prepare(`INSERT INTO ${table} (id, title, icon, image_url, sort_order) VALUES (?, ?, ?, ?, ?)`)
        .run(id, title, v.text(b.icon, { max: 16, label: "آیکون" }) || "📚", v.imageUrl(b.imageUrl), nextOrder);
    } else {
      db.prepare(`INSERT INTO ${table} (id, title, sort_order) VALUES (?, ?, ?)`).run(id, title, nextOrder);
    }
    res.status(201).json(getOne(id));
  });

  // ترتیب نمایش: فهرست شناسه‌ها به همان ترتیبی که باید نمایش داده شوند
  router.put("/reorder", requireAdmin, (req, res) => {
    const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids.map(String) : null;
    if (!ids) return res.status(400).json({ error: "فهرست ترتیب ارسال نشده است." });
    const update = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
    ids.forEach((id, i) => update.run(i, id));
    res.json(listAll());
  });

  router.put("/:id", requireAdmin, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `${noun} پیدا نشد.` });
    const b = req.body || {};
    const title = b.title !== undefined ? v.text(b.title, { required: true, max: 80, label: "عنوان" }) : row.title;
    if (withMedia) {
      db.prepare(`UPDATE ${table} SET title = ?, icon = ?, image_url = ? WHERE id = ?`).run(
        title,
        b.icon !== undefined ? (v.text(b.icon, { max: 16, label: "آیکون" }) || "📚") : row.icon,
        b.imageUrl !== undefined ? v.imageUrl(b.imageUrl) : row.image_url,
        row.id
      );
    } else {
      db.prepare(`UPDATE ${table} SET title = ? WHERE id = ?`).run(title, row.id);
    }
    res.json(getOne(row.id));
  });

  router.delete("/:id", requireAdmin, (req, res) => {
    const row = db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `${noun} پیدا نشد.` });
    const inUse = db.prepare(`SELECT COUNT(*) AS n FROM products WHERE ${productColumn} = ?`).get(req.params.id).n;
    if (inUse > 0) {
      return res.status(409).json({ error: `این ${noun} به ${inUse} کتاب متصل است؛ ابتدا ${noun} آن کتاب‌ها را تغییر دهید.` });
    }
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.status(204).end();
  });

  return router;
}

module.exports = {
  categoryRoutes: createTaxonomyRouter({ table: "categories", idPrefix: "cat", productColumn: "category_id", noun: "دسته‌بندی", withMedia: true }),
  gradeRoutes: createTaxonomyRouter({ table: "grades", idPrefix: "grade", productColumn: "grade", noun: "پایه" }),
  trackRoutes: createTaxonomyRouter({ table: "tracks", idPrefix: "track", productColumn: "track", noun: "رشته" })
};
