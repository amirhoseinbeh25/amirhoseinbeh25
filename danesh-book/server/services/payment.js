/*
 * درگاه پرداخت زرین‌پال.
 *
 * حالت پیش‌فرض: «شبیه‌سازی‌شده» (mock) — بدون نیاز به حساب تجاری واقعی یا اتصال اینترنت، کل مسیر
 * پرداخت (درخواست → صفحه بانک → بازگشت → تایید) را به‌صورت کامل شبیه‌سازی می‌کند تا کل سایت قابل تست باشد.
 *
 * برای فعال‌سازی حالت واقعی: در فایل .env مقدار ZARINPAL_MERCHANT_ID را با مرچنت‌کد واقعی زرین‌پال
 * پر کنید (از پنل zarinpal.com). با ZARINPAL_SANDBOX=true می‌توانید ابتدا در محیط آزمایشی زرین‌پال تست کنید.
 */
const crypto = require("node:crypto");

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "";
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX === "true";
const MOCK_MODE = !MERCHANT_ID;

const BASE_URL = IS_SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const API_BASE = IS_SANDBOX ? "https://sandbox.zarinpal.com/pg/v4" : "https://api.zarinpal.com/pg/v4";

function toRial(tomanAmount) {
  return tomanAmount * 10;
}

async function requestPayment({ amount, description, callbackUrl, mobile }) {
  if (MOCK_MODE) {
    const authority = "MOCK" + crypto.randomBytes(16).toString("hex");
    return {
      authority,
      paymentUrl: `/payment-mock.html?authority=${authority}&amount=${amount}`
    };
  }

  const res = await fetch(`${API_BASE}/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: toRial(amount),
      description,
      callback_url: callbackUrl,
      metadata: mobile ? { mobile } : undefined
    })
  });
  const data = await res.json();
  if (!data.data || !data.data.authority) {
    throw new Error((data.errors && data.errors.message) || "خطا در اتصال به درگاه پرداخت زرین‌پال.");
  }
  return {
    authority: data.data.authority,
    paymentUrl: `${BASE_URL}/pg/StartPay/${data.data.authority}`
  };
}

async function verifyPayment({ amount, authority }) {
  if (MOCK_MODE || authority.startsWith("MOCK")) {
    // در حالت شبیه‌سازی، نتیجه توسط صفحه payment-mock.html تعیین و مستقیماً ثبت می‌شود.
    return { success: true, refId: "MOCKREF" + Date.now() };
  }

  const res = await fetch(`${API_BASE}/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant_id: MERCHANT_ID, amount: toRial(amount), authority })
  });
  const data = await res.json();
  const code = data.data && data.data.code;
  if (code === 100 || code === 101) {
    return { success: true, refId: data.data.ref_id };
  }
  return { success: false, refId: null };
}

module.exports = { requestPayment, verifyPayment, MOCK_MODE };
