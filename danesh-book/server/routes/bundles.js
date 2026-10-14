const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function mapBundle(row) {
  const items = db.prepare(`
    SELECT bi.qty, p.id, p.title, p.price, p.color FROM bundle_items bi
    JOIN products p ON p.id = bi.product_id WHERE bi.bundle_id = ?
  `).all(row.id);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    color: row.color,
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
  const info = db.prepare("INSERT INTO bundles (title, description, price, old_price, color) VALUES (?, ?, ?, ?, ?)")
    .run(b.title, b.description || "", Number(b.price), b.oldPrice ? Number(b.oldPrice) : null, b.color || "#6d93ac");

  const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, qty) VALUES (?, ?, 1)");
  for (const pid of b.productIds) insertItem.run(info.lastInsertRowid, pid);

  res.status(201).json(mapBundle(db.prepare("SELECT * FROM bundles WHERE id = ?").get(info.lastInsertRowid)));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM bundles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "پک آموزشی پیدا نشد." });
  const b = req.body || {};

  db.prepare("UPDATE bundles SET title = ?, description = ?, price = ?, old_price = ?, color = ?, active = ? WHERE id = ?")
    .run(
      b.title ?? existing.title,
      b.description ?? existing.description,
      b.price != null ? Number(b.price) : existing.price,
      b.oldPrice !== undefined ? (b.oldPrice ? Number(b.oldPrice) : null) : existing.old_price,
      b.color ?? existing.color,
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
