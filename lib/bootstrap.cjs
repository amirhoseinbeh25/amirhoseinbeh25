/**
 * کارهایی که تا دیروز باید دستی در ترمینال انجام می‌شد و حالا خود سرور
 * هنگام بالا آمدن انجامشان می‌دهد:
 *
 *   ۱. ساخت پوشه‌های لازم
 *   ۲. ساخت کلید نشست، اگر تنظیم نشده باشد
 *   ۳. اجرای مهاجرت‌های پایگاه داده
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

/**
 * مهاجرت‌ها مستقیم روی فایل SQLite اجرا می‌شوند.
 *
 * به‌جای فراخوانی Prisma CLI — که روی هاست اشتراکی ممکن است در دسترس
 * نباشد — همان فایل‌های SQL خوانده و اجرا می‌شوند، و نام هرکدام در جدول
 * مهاجرت ثبت می‌شود تا بار بعد دوباره اجرا نشود.
 */
function runMigrations(root) {
  const url = process.env.DATABASE_URL || "file:./data/site.db";
  const relative = url.replace(/^file:/, "");
  const dbPath = path.isAbsolute(relative)
    ? relative
    : path.join(root, relative);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const Database = require("better-sqlite3");
  const db = new Database(dbPath);

  db.exec(
    "CREATE TABLE IF NOT EXISTS _applied_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
  );

  const applied = new Set(
    db
      .prepare("SELECT name FROM _applied_migrations")
      .all()
      .map((row) => row.name),
  );

  const dir = path.join(root, "prisma", "migrations");
  const names = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => fs.existsSync(path.join(dir, name, "migration.sql")))
        .sort()
    : [];

  let count = 0;
  for (const name of names) {
    if (applied.has(name)) continue;
    const sql = fs.readFileSync(path.join(dir, name, "migration.sql"), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare(
        "INSERT INTO _applied_migrations (name, applied_at) VALUES (?, ?)",
      ).run(name, new Date().toISOString());
      db.exec("COMMIT");
      count += 1;
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }

  db.close();
  if (count > 0) console.log(`> ${count} مهاجرت پایگاه داده اجرا شد`);
}

function bootstrap(root) {
  loadEnvFile(root);
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "uploads"), { recursive: true });
  ensureSessionSecret(root);
  runMigrations(root);
}

module.exports = { bootstrap };
