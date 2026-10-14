const express = require("express");
const db = require("../db");
const { requestPayment, verifyPayment, MOCK_MODE } = require("../services/payment");
const { notifyOrderStatusChanged } = require("../services/notify");

const router = express.Router();

function awardLoyaltyPoints(order) {
  if (!order.user_id) return;
  const points = Math.floor(order.total / 10000); // هر ۱۰ هزار تومان خرید = ۱ امتیاز
  db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(points, order.user_id);
}

function finalizePaid(order) {
  db.prepare("UPDATE orders SET payment_status = 'paid', status = 'processing' WHERE id = ?").run(order.id);
  awardLoyaltyPoints(order);
  const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id);
  notifyOrderStatusChanged(updated);
  return updated;
}

router.post("/request", async (req, res) => {
  const { orderId } = req.body || {};
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد." });
  if (order.payment_status === "paid") return res.status(409).json({ error: "این سفارش قبلاً پرداخت شده است." });

  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const { authority, paymentUrl } = await requestPayment({
      amount: order.total,
      description: `پرداخت سفارش #${order.id} — دانش بوک`,
      callbackUrl: `${origin}/api/payment/callback?orderId=${order.id}`,
      mobile: order.phone
    });
    db.prepare("UPDATE orders SET payment_authority = ? WHERE id = ?").run(authority, order.id);
    res.json({ paymentUrl, mock: MOCK_MODE });
  } catch (e) {
    res.status(502).json({ error: e.message || "اتصال به درگاه پرداخت برقرار نشد." });
  }
});

// استفاده‌شده فقط در حالت شبیه‌سازی توسط payment-mock.html
router.post("/mock-complete", (req, res) => {
  const { authority, success } = req.body || {};
  const order = db.prepare("SELECT * FROM orders WHERE payment_authority = ?").get(authority);
  if (!order) return res.status(404).json({ error: "سفارش مرتبط با این تراکنش پیدا نشد." });

  if (success) {
    const updated = finalizePaid(order);
    return res.json({ orderId: updated.id, status: "success" });
  }
  db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(order.id);
  res.json({ orderId: order.id, status: "failed" });
});

// callback واقعی زرین‌پال (در حالت production استفاده می‌شود)
router.get("/callback", async (req, res) => {
  const { orderId, Authority, Status } = req.query;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return res.redirect(`/payment-result.html?status=error`);

  if (Status !== "OK") {
    db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(order.id);
    return res.redirect(`/payment-result.html?order=${order.id}&status=failed`);
  }

  try {
    const result = await verifyPayment({ amount: order.total, authority: Authority });
    if (result.success) {
      db.prepare("UPDATE orders SET payment_ref = ? WHERE id = ?").run(result.refId, order.id);
      finalizePaid(order);
      return res.redirect(`/payment-result.html?order=${order.id}&status=success`);
    }
    db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(order.id);
    res.redirect(`/payment-result.html?order=${order.id}&status=failed`);
  } catch (e) {
    res.redirect(`/payment-result.html?order=${order.id}&status=error`);
  }
});

router.get("/status/:orderId", (req, res) => {
  const order = db.prepare("SELECT id, status, payment_status, total, customer_name FROM orders WHERE id = ?").get(req.params.orderId);
  if (!order) return res.status(404).json({ error: "سفارش پیدا نشد." });
  res.json(order);
});

module.exports = router;
