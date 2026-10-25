const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

function mapBundle(row) {
  const items = db.prepare(`
    SELECT bi.qty, p.id, p.title, p.price, p.color, p.image_url AS imageUrl FROM bundle_items bi
    JOIN products p ON p.id = bi.product_id WHERE bi.bundle_id = ?
  `).all(row.id);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    color: row.color,
    imageUrl: row.image_url,
    active: !!row.active,
    items
  };
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM bundles WHERE active = 1 ORDER BY id DESC").all();
  res.json(rows.map(mapBundle));
});

router.get("/admin/all", requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM bundles ORDER BY id DESC").all();
  res.json(rows.map(mapBundle));
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM bundles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "پک آموزشی پیدا نشد." });
  res.json(mapBundle(row));
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.price || !Array.isArray(b.productIds) || b.productIds.length === 0) {
    return res.status(400).json({ error: "عنوان، قیمت و حداقل یک کتاب برای پک الزامی است." });
  }
  const info = db.prepare("INSERT INTO bundles (title, description, price, old_price, color, image_url, active) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(
      v.text(b.title, { required: true, max: 200, label: "عنوان پک" }),
      v.text(b.description, { max: 2000, label: "توضیحات" }),
      v.int(b.price, { min: 0, label: "قیمت" }),
      b.oldPrice ? v.int(b.oldPrice, { min: 0, label: "قیمت قبلی" }) : null,
      v.color(b.color, "#6d93ac"),
      v.imageUrl(b.imageUrl, "تصویر پک"),
      v.bool(b.active, true) ? 1 : 0
    );

  const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, qty) VALUES (?, ?, 1)");
  for (const pid of b.productIds) insertItem.run(info.lastInsertRowid, pid);

  res.status(201).json(mapBundle(db.prepare("SELECT * FROM bundles WHERE id = ?").get(info.lastInsertRowid)));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM bundles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "پک آموزشی پیدا نشد." });
  const b = req.body || {};

  db.prepare("UPDATE bundles SET title = ?, description = ?, price = ?, old_price = ?, color = ?, image_url = ?, active = ? WHERE id = ?")
    .run(
      b.title !== undefined ? v.text(b.title, { required: true, max: 200, label: "عنوان پک" }) : existing.title,
      b.description !== undefined ? v.text(b.description, { max: 2000, label: "توضیحات" }) : existing.description,
      b.price != null ? v.int(b.price, { min: 0, label: "قیمت" }) : existing.price,
      b.oldPrice !== undefined ? (b.oldPrice ? v.int(b.oldPrice, { min: 0, label: "قیمت قبلی" }) : null) : existing.old_price,
      b.color !== undefined ? v.color(b.color, existing.color) : existing.color,
      b.imageUrl !== undefined ? v.imageUrl(b.imageUrl, "تصویر پک") : existing.image_url,
      b.active != null ? (b.active ? 1 : 0) : existing.active,
      req.params.id
    );

  if (Array.isArray(b.productIds)) {
    db.prepare("DELETE FROM bundle_items WHERE bundle_id = ?").run(req.params.id);
    const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, qty) VALUES (?, ?, 1)");
    for (const pid of b.productIds) insertItem.run(req.params.id, pid);
  }

  res.json(mapBundle(db.prepare("SELECT * FROM bundles WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM bundles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "پک آموزشی پیدا نشد." });
  db.prepare("DELETE FROM bundle_items WHERE bundle_id = ?").run(req.params.id);
  db.prepare("DELETE FROM bundles WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
