/*
 * بعد از هر تغییر در فایل‌های CSS/JS اجرا شود: node tools/version-assets.js
 * به آدرس فایل‌های CSS و JS در صفحات HTML یک نسخه (?v=هش محتوا) اضافه می‌کند تا مرورگرها
 * فایل‌ها را طولانی‌مدت کش کنند ولی بعد از هر به‌روزرسانی، نسخه جدید را بگیرند.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const siteRoot = path.join(__dirname, "..", "..");
const htmlFiles = [
  ...fs.readdirSync(siteRoot).filter(f => f.endsWith(".html")).map(f => path.join(siteRoot, f)),
  ...fs.readdirSync(path.join(siteRoot, "admin")).filter(f => f.endsWith(".html")).map(f => path.join(siteRoot, "admin", f))
];

const hashes = new Map();
function hashOf(file) {
  if (!hashes.has(file)) hashes.set(file, crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8));
  return hashes.get(file);
}

let changed = 0;
for (const html of htmlFiles) {
  const src = fs.readFileSync(html, "utf8");
  const out = src.replace(/(href|src)="((?:\.\.\/)?(?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=[\w]+)?"/g, (m, attr, rel) => {
    const file = path.join(path.dirname(html), rel);
    if (!fs.existsSync(file)) return m;
    return `${attr}="${rel}?v=${hashOf(file)}"`;
  });
  if (out !== src) {
    fs.writeFileSync(html, out);
    changed++;
  }
}
console.log(`${changed} صفحه به‌روز شد`);
