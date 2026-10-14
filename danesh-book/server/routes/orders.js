const express = require("express");
const db = require("../db");
const { requireAdmin, requireCustomer, optionalCustomer } = require("../middleware/auth");
const { notifyOrderCreated, notifyOrderStatusChanged } = require("../services/notify");

const router = express.Router();

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_COST = 35000;

function orderWithItems(orderId) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  return { ...order, items };
}

// ثبت سفارش از صفحه سبد خرید (مهمان یا کاربر واردشده)
router.post("/", optionalCustomer, (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "سبد خرید خالی است." });
  }
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: "نام و شماره تماس الزامی است." });
  }

  const resolvedProducts = [];
  const resolvedBundles = [];

  for (const it of items) {
    const qty = Math.max(1, Number(it.qty) || 1);
    if (it.type === "bundle") {
      const bundle = db.prepare("SELECT * FROM bundles WHERE id = ? AND active = 1").get(it.id);
      if (!bundle) return res.status(400).json({ error: `پک آموزشی با شناسه ${it.id} پیدا نشد.` });
      const bundleItems = db.prepare(`
        SELECT bi.qty, p.* FROM bundle_items bi JOIN products p ON p.id = bi.product_id WHERE bi.bundle_id = ?
      `).all(it.id);
      for (const bi of bundleItems) {
        if (bi.stock < bi.qty * qty) {
          return res.status(409).json({ error: `موجودی «${bi.title}» برای این پک کافی نیست.` });
        }
      }
      resolvedBundles.push({ bundle, qty, bundleItems });
    } else {
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(it.id);
      if (!product) return res.status(400).json({ error: `کتابی با شناسه ${it.id} پیدا نشد.` });
      if (product.stock < qty) {
        return res.status(409).json({ error: `موجودی «${product.title}» کافی نیست.` });
      }
      resolvedProducts.push({ product, qty });
    }
  }

  const subtotal =
    resolvedProducts.reduce((sum, r) => sum + r.product.price * r.qty, 0) +
    resolvedBundles.reduce((sum, r) => sum + r.bundle.price * r.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const orderInfo = db.prepare(`
    INSERT INTO orders (user_id, customer_name, phone, address, subtotal, shipping, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(req.customer ? req.customer.sub : null, customer.name, customer.phone, customer.address || "", subtotal, shipping, total);

  const insertProductItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, title, price, qty) VALUES (?, ?, ?, ?, ?)
  `);
  const insertBundleItem = db.prepare(`
    INSERT INTO order_items (order_id, bundle_id, title, price, qty) VALUES (?, ?, ?, ?, ?)
  `);
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

  for (const r of resolvedProducts) {
    insertProductItem.run(orderInfo.lastInsertRowid, r.product.id, r.product.title, r.product.price, r.qty);
    updateStock.run(r.qty, r.product.id);
  }
  for (const r of resolvedBundles) {
    insertBundleItem.run(orderInfo.lastInsertRowid, r.bundle.id, r.bundle.title, r.bundle.price, r.qty);
    for (const bi of r.bundleItems) {
      updateStock.run(bi.qty * r.qty, bi.id);
    }
  }

  const order = orderWithItems(orderInfo.lastInsertRowid);
  notifyOrderCreated(order);
  res.status(201).json(order);
});

// سفارش‌های کاربر واردشده
router.get("/mine", requireCustomer, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.customer.sub);
  res.json(orders.map(o => ({ ...o, items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id) })));
});

router.get("/mine/:id", requireCustomer, (req, res) => {
  const order = orderWithItems(req.params.id);
  if (!order || order.user_id !== req.customer.sub) return res.status(404).json({ error: "سفارش پیدا نشد." });
  res.json(order);
});

router.post("/mine/:id/return", requireCustomer, (req, res) => {
  const { reason } = req.body || {};
  if (!reason || !reason.trim()) return res.status(400).json({ error: "دلیل مرجوعی را وارد کنید." });
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order || order.user_id !== req.customer.sub) return res.status(404).json({ error: "سفارش پیدا نشد." });
  if (order.status !== "delivered") return res.status(409).json({ error: "فقط سفارش‌های تحویل‌شده قابل مرجوعی هستند." });

  const info = db.prepare("INSERT INTO return_requests (order_id, user_id, reason) VALUES (?, ?, ?)")
    .run(order.id, req.customer.sub, reason.trim());
  res.status(201).json(db.prepare("SELECT * FROM return_requests WHERE id = ?").get(info.lastInsertRowid));
});

// فهرست سفارش‌ها — فقط ادمین
router.get("/", requireAdmin, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  const withCounts = orders.map(o => {
    const count = db.prepare("SELECT COALESCE(SUM(qty),0) AS n FROM order_items WHERE order_id = ?").get(o.id).n;
    return { ...o, itemCount: count };
  });
  res.json(withCounts);
});

router.get("/:id", requireAdmin, (req, res) => {
  const order = orderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد." });
  const notifications = db.prepare("SELECT * FROM notifications WHERE order_id = ? ORDER BY id DESC").all(order.id);
  res.json({ ...order, notifications });
});

router.put("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "وضعیت نامعتبر است." });
  }
  const existing = db.prepare("SELECT 1 FROM orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد." });

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  const updated = orderWithItems(req.params.id);
  notifyOrderStatusChanged(updated);
  res.json(updated);
});

module.exports = router;
