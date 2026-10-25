const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");
const v = require("../lib/validate");

const router = express.Router();

function parseGallery(value) {
  try {
    const list = JSON.parse(value || "[]");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    translator: row.translator,
    category: row.category_id,
    grade: row.grade,
    track: row.track,
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
    desc: row.description,
    samplePdfUrl: row.sample_pdf_url,
    imageUrl: row.image_url,
    gallery: parseGallery(row.gallery)
  };
}

function cleanGallery(list) {
  if (!Array.isArray(list)) return "[]";
  return JSON.stringify(list.slice(0, 8).map(u => v.imageUrl(u, "تصویر گالری")).filter(Boolean));
}

function checkTaxonomy(b) {
  if (b.category !== undefined && !db.prepare("SELECT 1 FROM categories WHERE id = ?").get(b.category)) {
    return "دسته‌بندی انتخاب‌شده معتبر نیست.";
  }
  if (b.grade && !db.prepare("SELECT 1 FROM grades WHERE id = ?").get(b.grade)) return "پایه انتخاب‌شده معتبر نیست.";
  if (b.track && !db.prepare("SELECT 1 FROM tracks WHERE id = ?").get(b.track)) return "رشته انتخاب‌شده معتبر نیست.";
  return null;
}

router.get("/", (req, res) => {
  const { cat, grade, track, publisher, q, minPrice, maxPrice, onlyDiscount, sort } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (cat) { sql += " AND category_id = ?"; params.push(cat); }
  if (grade) { sql += " AND grade = ?"; params.push(grade); }
  if (track) { sql += " AND (track = ? OR track = 'moshtarek')"; params.push(track); }
  if (publisher) { sql += " AND publisher = ?"; params.push(publisher); }
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
    return res.status(400).json({ error: "عنوان، مؤلف، دسته‌بندی و قیمت الزامی هستند." });
  }
  const taxonomyError = checkTaxonomy(b);
  if (taxonomyError) return res.status(400).json({ error: taxonomyError });

  const info = db.prepare(`
    INSERT INTO products
      (title, author, translator, category_id, grade, track, price, old_price, badge, rating, reviews, publisher, pages, year, color, stock, description, sample_pdf_url, image_url, gallery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    v.text(b.title, { required: true, max: 200, label: "عنوان" }),
    v.text(b.author, { required: true, max: 150, label: "مؤلف" }),
    v.text(b.translator, { max: 150, label: "مترجم" }) || null,
    b.category,
    b.grade || null, b.track || null,
    v.int(b.price, { min: 0, label: "قیمت" }), b.oldPrice ? v.int(b.oldPrice, { min: 0, label: "قیمت قبلی" }) : null,
    v.text(b.badge, { max: 40, label: "برچسب" }) || null,
    v.num(b.rating, { min: 0, max: 5, fallback: 4.5 }), v.int(b.reviews, { min: 0, fallback: 0 }),
    v.text(b.publisher, { max: 120, label: "ناشر" }) || null,
    v.int(b.pages, { min: 0 }), v.int(b.year, { min: 0, max: 3000 }),
    v.color(b.color, "#6d93ac", "رنگ جلد"), v.int(b.stock, { min: 0, fallback: 0 }),
    v.text(b.desc, { max: 20000, label: "توضیحات" }),
    v.link(b.samplePdfUrl, "لینک نمونه سوال") || null,
    v.imageUrl(b.imageUrl, "تصویر کتاب"),
    cleanGallery(b.gallery)
  );

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(mapRow(row));
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "کتاب پیدا نشد." });

  const b = req.body || {};
  const taxonomyError = checkTaxonomy({ ...b, category: b.category || undefined });
  if (taxonomyError) return res.status(400).json({ error: taxonomyError });
  const has = (key) => b[key] !== undefined;

  db.prepare(`
    UPDATE products SET
      title = ?, author = ?, translator = ?, category_id = ?, grade = ?, track = ?, price = ?, old_price = ?,
      badge = ?, rating = ?, reviews = ?, publisher = ?, pages = ?, year = ?, color = ?, stock = ?, description = ?,
      sample_pdf_url = ?, image_url = ?, gallery = ?
    WHERE id = ?
  `).run(
    has("title") ? v.text(b.title, { required: true, max: 200, label: "عنوان" }) : existing.title,
    has("author") ? v.text(b.author, { required: true, max: 150, label: "مؤلف" }) : existing.author,
    has("translator") ? (v.text(b.translator, { max: 150, label: "مترجم" }) || null) : existing.translator,
    b.category || existing.category_id,
    has("grade") ? (b.grade || null) : existing.grade,
    has("track") ? (b.track || null) : existing.track,
    b.price != null ? v.int(b.price, { min: 0, label: "قیمت" }) : existing.price,
    has("oldPrice") ? (b.oldPrice ? v.int(b.oldPrice, { min: 0, label: "قیمت قبلی" }) : null) : existing.old_price,
    has("badge") ? (v.text(b.badge, { max: 40, label: "برچسب" }) || null) : existing.badge,
    b.rating != null ? v.num(b.rating, { min: 0, max: 5, fallback: existing.rating }) : existing.rating,
    b.reviews != null ? v.int(b.reviews, { min: 0, fallback: existing.reviews }) : existing.reviews,
    has("publisher") ? (v.text(b.publisher, { max: 120, label: "ناشر" }) || null) : existing.publisher,
    has("pages") ? v.int(b.pages, { min: 0 }) : existing.pages,
    has("year") ? v.int(b.year, { min: 0, max: 3000 }) : existing.year,
    has("color") ? v.color(b.color, existing.color, "رنگ جلد") : existing.color,
    b.stock != null ? v.int(b.stock, { min: 0, fallback: existing.stock }) : existing.stock,
    has("desc") ? v.text(b.desc, { max: 20000, label: "توضیحات" }) : existing.description,
    has("samplePdfUrl") ? (v.link(b.samplePdfUrl, "لینک نمونه سوال") || null) : existing.sample_pdf_url,
    has("imageUrl") ? v.imageUrl(b.imageUrl, "تصویر کتاب") : existing.image_url,
    has("gallery") ? cleanGallery(b.gallery) : (existing.gallery || "[]"),
    req.params.id
  );

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(mapRow(row));
});

router.delete("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "کتاب پیدا نشد." });
  const inBundles = db.prepare("SELECT COUNT(*) AS n FROM bundle_items WHERE product_id = ?").get(existing.id).n;
  if (inBundles > 0) {
    return res.status(409).json({ error: `این کتاب در ${inBundles} پک آموزشی استفاده شده؛ ابتدا آن را از پک‌ها حذف کنید.` });
  }
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
