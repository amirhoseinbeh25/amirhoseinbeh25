/*
 * سرویس اعلان (پیامک/ایمیل) — شبیه‌سازی‌شده برای محیط توسعه.
 * برای فعال‌سازی واقعی:
 *   - پیامک: به‌جای بلوک «شبیه‌سازی» در sendSms، به API کاوه‌نگار/ملی‌پیامک وصل شوید (کلید در KAVENEGAR_API_KEY).
 *   - ایمیل: به‌جای بلوک «شبیه‌سازی» در sendEmail، nodemailer را با SMTP واقعی پیکربندی کنید.
 * در هر دو حالت، پیام در جدول notifications ثبت می‌شود تا در پنل ادمین قابل مشاهده باشد.
 */
const db = require("../db");

function logNotification({ orderId, channel, recipient, message }) {
  db.prepare("INSERT INTO notifications (order_id, channel, recipient, message) VALUES (?, ?, ?, ?)")
    .run(orderId || null, channel, recipient, message);
}

function sendSms(phone, message, orderId) {
  if (process.env.KAVENEGAR_API_KEY) {
    // TODO: اتصال واقعی به درگاه پیامک با KAVENEGAR_API_KEY
  }
  console.log(`[SMS شبیه‌سازی‌شده → ${phone}] ${message}`);
  logNotification({ orderId, channel: "sms", recipient: phone, message });
}

function sendEmail(email, subject, message, orderId) {
  if (!email) return;
  if (process.env.SMTP_HOST) {
    // TODO: اتصال واقعی با nodemailer و SMTP_HOST/SMTP_USER/SMTP_PASS
  }
  console.log(`[ایمیل شبیه‌سازی‌شده → ${email}] ${subject}: ${message}`);
  logNotification({ orderId, channel: "email", recipient: email, message: `${subject}: ${message}` });
}

function notifyOrderCreated(order) {
  sendSms(order.phone, `دانش بوک: سفارش شما با کد #${order.id} ثبت شد. مبلغ قابل پرداخت: ${order.total.toLocaleString("fa-IR")} تومان.`, order.id);
}

const STATUS_LABELS_FA = {
  pending: "در انتظار بررسی",
  processing: "در حال پردازش",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغو‌شده"
};

function notifyOrderStatusChanged(order) {
  const label = STATUS_LABELS_FA[order.status] || order.status;
  sendSms(order.phone, `دانش بوک: وضعیت سفارش #${order.id} به «${label}» تغییر کرد.`, order.id);
}

module.exports = { sendSms, sendEmail, notifyOrderCreated, notifyOrderStatusChanged };
