/* کمک‌توابع اعتبارسنجی ورودی‌های پنل ادمین و فرم‌های سایت */
const crypto = require("node:crypto");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function text(value, { max = 500, required = false, label = "این فیلد" } = {}) {
  const v = value === undefined || value === null ? "" : String(value).trim();
  if (required && !v) throw new ValidationError(`${label} الزامی است.`);
  if (v.length > max) throw new ValidationError(`${label} نباید بیشتر از ${max} کاراکتر باشد.`);
  return v;
}

// فقط فایل‌های همین سایت (uploads یا assets) یا آدرس http/https بدون کاراکترهای خطرناک
const IMAGE_URL_RE = /^(\/(uploads|assets)\/[A-Za-z0-9._\/-]+|https?:\/\/[^\s"'<>()\\]+)$/;

function imageUrl(value, label = "آدرس تصویر") {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const v = String(value).trim();
  if (v.length > 1000 || !IMAGE_URL_RE.test(v) || v.includes("..")) {
    throw new ValidationError(`${label} معتبر نیست.`);
  }
  return v;
}

// لینک داخلی (مثل shop.html?cat=riazi) یا http/https/mailto/tel
const LINK_RE = /^(#[^\s"'<>\\]*|\/?[A-Za-z0-9._\/-]*(\?[^\s"'<>\\]*)?(#[^\s"'<>\\]*)?|https?:\/\/[^\s"'<>\\]+|mailto:[^\s"'<>\\]+|tel:[0-9+\-\s]+)$/;

function link(value, label = "لینک") {
  if (value === undefined || value === null || String(value).trim() === "") return "";
  const v = String(value).trim();
  if (v.length > 1000 || !LINK_RE.test(v)) throw new ValidationError(`${label} معتبر نیست.`);
  return v;
}

function color(value, fallback = null, label = "رنگ") {
  if (value === undefined || value === null || value === "") return fallback;
  const v = String(value).trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) throw new ValidationError(`${label} معتبر نیست.`);
  return v.toLowerCase();
}

function int(value, { min = -Infinity, max = Infinity, fallback = null, label = "عدد" } = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new ValidationError(`${label} معتبر نیست.`);
  return Math.min(max, Math.max(min, Math.round(n)));
}

function num(value, { min = -Infinity, max = Infinity, fallback = null, label = "عدد" } = {}) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new ValidationError(`${label} معتبر نیست.`);
  return Math.min(max, Math.max(min, n));
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === 1 || value === "1" || value === "true";
}

// شناسه انگلیسی برای دسته‌بندی/پایه/رشته؛ اگر خالی باشد خودکار ساخته می‌شود
function slugId(value, prefix) {
  const v = value === undefined || value === null ? "" : String(value).trim().toLowerCase();
  if (!v) return `${prefix}-${crypto.randomBytes(3).toString("hex")}`;
  if (!/^[a-z0-9][a-z0-9_-]{0,39}$/.test(v)) {
    throw new ValidationError("شناسه فقط می‌تواند شامل حروف انگلیسی کوچک، عدد، - و _ باشد.");
  }
  return v;
}

module.exports = { ValidationError, text, imageUrl, link, color, int, num, bool, slugId };
