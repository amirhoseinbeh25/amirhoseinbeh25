/* همه اطلاعات لازم برای ساخت هدر و فوتر هر صفحه، در یک درخواست */
const express = require("express");
const db = require("../db");
const { publicSiteConfig } = require("../lib/settings");
const { grouped } = require("./menus");

const router = express.Router();

router.get("/", (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c ORDER BY c.sort_order, c.rowid
  `).all().map(c => ({ id: c.id, title: c.title, icon: c.icon, imageUrl: c.image_url, productCount: c.product_count }));
  const grades = db.prepare("SELECT id, title FROM grades ORDER BY sort_order, rowid").all();
  const tracks = db.prepare("SELECT id, title FROM tracks ORDER BY sort_order, rowid").all();

  res.set("Cache-Control", "no-cache");
  res.json({ ...publicSiteConfig(), menus: grouped(true), categories, grades, tracks });
});

module.exports = router;
