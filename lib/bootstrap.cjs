/**
 * کارهایی که تا دیروز باید دستی در ترمینال انجام می‌شد و حالا خود سرور
 * هنگام بالا آمدن انجامشان می‌دهد:
 *
 *   ۱. ساخت پوشه‌های لازم
 *   ۲. ساخت کلید نشست، اگر تنظیم نشده باشد
 *
 * جدول‌های پایگاه داده را خود برنامه هنگام اولین اتصال می‌سازد.
 *
 * حساب مدیر این‌جا ساخته نمی‌شود؛ اولین بار که وارد /admin شوید صفحه
 * راه‌اندازی باز می‌شود و رمز را خودتان تعیین می‌کنید — تا رمزی از پیش
 * تعیین‌شده در فایل نماند.
 *
 * CommonJS است چون server.js آن را با require صدا می‌زند.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function loadEnvFile(root) {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

/** کلید نشست باید بین ری‌استارت‌ها ثابت بماند وگرنه همه از پنل بیرون می‌افتند. */
function ensureSessionSecret(root) {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 24) {
    return;
  }

  const file = path.join(root, "data", "session-secret");
  if (fs.existsSync(file)) {
    process.env.SESSION_SECRET = fs.readFileSync(file, "utf8").trim();
    return;
  }

  const secret = crypto.randomBytes(48).toString("base64");
  fs.writeFileSync(file, secret, { mode: 0o600 });
  process.env.SESSION_SECRET = secret;
  console.log("> کلید نشست ساخته شد: data/session-secret");
}

function bootstrap(root) {
  loadEnvFile(root);
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "uploads"), { recursive: true });
  ensureSessionSecret(root);
}

module.exports = { bootstrap };
