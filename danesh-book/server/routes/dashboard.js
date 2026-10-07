const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAdmin, (req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  const totalCategories = db.prepare("SELECT COUNT(*) AS n FROM categories").get().n;
  const totalOrders = db.prepare("SELECT COUNT(*) AS n FROM orders").get().n;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE status != 'cancelled'").get().s;
  const pendingOrders = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").get().n;
  const lowStock = db.prepare("SELECT id, title, stock FROM products WHERE stock <= 5 ORDER BY stock ASC").all();
  const recentOrders = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 5").all();

  res.json({ totalProducts, totalCategories, totalOrders, totalRevenue, pendingOrders, lowStock, recentOrders });
});

module.exports = router;
