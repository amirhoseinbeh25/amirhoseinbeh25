const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../middleware/auth");

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

// ثبت سفارش از صفحه سبد خرید (بدون نیاز به ورود)
router.post("/", (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "سبد خرید خالی است." });
  }
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: "نام و شماره تماس الزامی است." });
  }

  const resolved = [];
  for (const it of items) {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(it.id);
    if (!product) return res.status(400).json({ error: `کتابی با شناسه ${it.id} پیدا نشد.` });
    const qty = Math.max(1, Number(it.qty) || 1);
    if (product.stock < qty) {
      return res.status(409).json({ error: `موجودی «${product.title}» کافی نیست.` });
    }
    resolved.push({ product, qty });
  }

  const subtotal = resolved.reduce((sum, r) => sum + r.product.price * r.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const orderInfo = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, subtotal, shipping, total, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(customer.name, customer.phone, customer.address || "", subtotal, shipping, total);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, title, price, qty) VALUES (?, ?, ?, ?, ?)
  `);
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

  for (const r of resolved) {
    insertItem.run(orderInfo.lastInsertRowid, r.product.id, r.product.title, r.product.price, r.qty);
    updateStock.run(r.qty, r.product.id);
  }

  res.status(201).json(orderWithItems(orderInfo.lastInsertRowid));
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
  res.json(order);
});

router.put("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "وضعیت نامعتبر است." });
  }
  const existing = db.prepare("SELECT 1 FROM orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد." });

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json(orderWithItems(req.params.id));
});

module.exports = router;
