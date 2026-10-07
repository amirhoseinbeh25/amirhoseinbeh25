const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    translator: row.translator,
    category: row.category_id,
    price: row.price,
    oldPrice: row.old_price,
    badge: row.badge,
    rating: row.rating,
    reviews: row.reviews,
    publisher: row.publisher,
    pages: row.pages,
    year: row.year,
    color: row.color,
    stock: row.stock,
    desc: row.description
  };
}

router.get("/", (req, res) => {
  const { cat, q, minPrice, maxPrice, onlyDiscount, sort } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (cat) { sql += " AND category_id = ?"; params.push(cat); }
  if (minPrice) { sql += " AND price >= ?"; params.push(Number(minPrice)); }
  if (maxPrice) { sql += " AND price <= ?"; params.push(Number(maxPrice)); }
  if (onlyDiscount === "true") { sql += " AND old_price IS NOT NULL"; }
  if (q) {
    sql += " AND (title LIKE ? OR author LIKE ? OR publisher LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const sortMap = {
    cheap: " ORDER BY price ASC",
    expensive: " ORDER BY price DESC",
    rating: " ORDER BY rating DESC",
    newest: " ORDER BY year DESC"
  };
  sql += sortMap[sort] || " ORDER BY id DESC";

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapRow));
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "کتاب پیدا نشد." });
  res.json(mapRow(row));
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.author || !b.category || !b.price) {
    return res.status(400).json({ error: "عنوان، نویسنده، دسته‌بندی و قیمت الزامی هستند." });
  }
  const cat = db.prepare("SELECT 1 FROM categories WHERE id = ?").get(b.category);
  if (!cat) return res.status(400).json({ error: "دسته‌بندی انتخاب‌شده معتبر نیست." });

  const info = db.prepare(`
    INSERT INTO products
      (title, author, translator, category_id, price, old_price, badge, rating, reviews, publisher, pages, year, color, stock, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    b.title, b.author, b.translator || null, b.category,
    Number(b.price), b.oldPrice ? Number(b.oldPrice) : null, b.badge || null,
    b.rating ? Number(b.rating) : 4.5, b.reviews ? Number(b.reviews) : 0,
    b.publisher || null, b.pages ? Number(b.pages) : null, b.year ? Number(b.year) : null,
    b.color || "#1f5d50", b.stock ? Number(b.stock) : 0, b.desc || ""
  );

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(mapRow(row));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "کتاب پیدا نشد." });

  const b = req.body || {};
  if (b.category) {
    const cat = db.prepare("SELECT 1 FROM categories WHERE id = ?").get(b.category);
    if (!cat) return res.status(400).json({ error: "دسته‌بندی انتخاب‌شده معتبر نیست." });
  }

  db.prepare(`
    UPDATE products SET
      title = ?, author = ?, translator = ?, category_id = ?, price = ?, old_price = ?,
      badge = ?, rating = ?, reviews = ?, publisher = ?, pages = ?, year = ?, color = ?, stock = ?, description = ?
    WHERE id = ?
  `).run(
    b.title ?? existing.title,
    b.author ?? existing.author,
    b.translator ?? existing.translator,
    b.category ?? existing.category_id,
    b.price != null ? Number(b.price) : existing.price,
    b.oldPrice !== undefined ? (b.oldPrice ? Number(b.oldPrice) : null) : existing.old_price,
    b.badge !== undefined ? b.badge : existing.badge,
    b.rating != null ? Number(b.rating) : existing.rating,
    b.reviews != null ? Number(b.reviews) : existing.reviews,
    b.publisher ?? existing.publisher,
    b.pages != null ? Number(b.pages) : existing.pages,
    b.year != null ? Number(b.year) : existing.year,
    b.color ?? existing.color,
    b.stock != null ? Number(b.stock) : existing.stock,
    b.desc ?? existing.description,
    req.params.id
  );

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(mapRow(row));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "کتاب پیدا نشد." });
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
