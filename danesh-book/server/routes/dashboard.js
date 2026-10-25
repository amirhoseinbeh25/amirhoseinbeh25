const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAdmin, (req, res) => {
  const totalProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  const totalCategories = db.prepare("SELECT COUNT(*) AS n FROM categories").get().n;
  const totalOrders = db.prepare("SELECT COUNT(*) AS n FROM orders").get().n;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) AS s FROM orders WHERE payment_status = 'paid'").get().s;
  const pendingOrders = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").get().n;
  const lowStock = db.prepare("SELECT id, title, stock FROM products WHERE stock <= 5 ORDER BY stock ASC").all();
  const recentOrders = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 5").all();
  const totalCustomers = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  const pendingBulkOrders = db.prepare("SELECT COUNT(*) AS n FROM bulk_orders WHERE status = 'new'").get().n;
  const pendingReturns = db.prepare("SELECT COUNT(*) AS n FROM return_requests WHERE status = 'pending'").get().n;
  const unreadMessages = db.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE is_read = 0").get().n;
  const newsletterCount = db.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers").get().n;
  const admin = db.prepare("SELECT password_hash FROM admins WHERE id = ?").get(req.admin.sub);
  const usingDefaultPassword = !!admin && bcrypt.compareSync("admin123", admin.password_hash);

  res.json({
    totalProducts, totalCategories, totalOrders, totalRevenue, pendingOrders, lowStock, recentOrders,
    totalCustomers, pendingBulkOrders, pendingReturns, unreadMessages, newsletterCount, usingDefaultPassword
  });
});

// شمارنده‌های سبک برای نمایش کنار منوهای پنل ادمین
router.get("/badges", requireAdmin, (req, res) => {
  res.json({
    pendingOrders: db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").get().n,
    pendingReturns: db.prepare("SELECT COUNT(*) AS n FROM return_requests WHERE status = 'pending'").get().n,
    pendingBulkOrders: db.prepare("SELECT COUNT(*) AS n FROM bulk_orders WHERE status = 'new'").get().n,
    unreadMessages: db.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE is_read = 0").get().n
  });
});

module.exports = router;
