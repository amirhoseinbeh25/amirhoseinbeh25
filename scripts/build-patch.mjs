/**
 * بسته «به‌روزرسانی» می‌سازد: فقط فایل‌هایی که نسبت به نسخه روی هاست عوض
 * شده‌اند.
 *
 * چرا: بسته کامل هشت مگابایت و نزدیک دو هزار فایل است و برای هر اصلاح کوچک
 * باید کل پوشه روی هاست پاک و دوباره آپلود شود. در عمل هر تغییر چند ده فایل
 * را جابه‌جا می‌کند، پس همان چند ده فایل کافی است: روی نصب فعلی Extract
 * می‌شود، چیزی پاک نمی‌شود و پایگاه داده و فایل‌های آپلودشده دست‌نخورده
 * می‌مانند.
 *
 * اجرا:  node scripts/build-patch.mjs <بسته-قدیم> <بسته-جدید> <خروجی>
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const [oldDir, newDir, outDir] = process.argv.slice(2);

if (!oldDir || !newDir || !outDir) {
  console.error("استفاده: node scripts/build-patch.mjs <قدیم> <جدید> <خروجی>");
  process.exit(1);
}

/** همه فایل‌ها با مسیر نسبی. */
function walk(root, base = root, found = []) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) walk(full, base, found);
    else found.push(relative(base, full));
  }
  return found;
}

const digest = (file) =>
  createHash("sha1").update(readFileSync(file)).digest("hex");

/**
 * مقایسه اول با اندازه است چون خواندن کل فایل برای هزاران فایل کند است و
 * تغییر واقعی تقریباً همیشه اندازه را هم عوض می‌کند؛ اندازه که یکی بود،
 * محتوا بررسی می‌شود.
 */
function same(a, b) {
  if (statSync(a).size !== statSync(b).size) return false;
  return digest(a) === digest(b);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const newFiles = walk(newDir);
const changed = [];

for (const file of newFiles) {
  const from = join(newDir, file);
  const to = join(oldDir, file);

  if (existsSync(to) && same(from, to)) continue;

  changed.push(file);
  mkdirSync(join(outDir, dirname(file)), { recursive: true });
  cpSync(from, join(outDir, file));
}

/**
 * فایل‌های نسخه قبل که دیگر وجود ندارند — بیشترشان تکه‌های ساخت با نام
 * هش‌دار‌ند. به هیچ‌کدام ارجاعی نمی‌ماند، پس ماندنشان چیزی را خراب نمی‌کند و
 * فقط جا می‌گیرد. فهرستشان می‌آید تا اگر خواستید دستی پاک کنید.
 */
const removed = walk(oldDir).filter((file) => !existsSync(join(newDir, file)));

writeFileSync(
  join(outDir, "به‌روزرسانی.txt"),
  `به‌روزرسانی سایت
================

${changed.length} فایل عوض شده است.

روش نصب
--------
۱. در File Manager وارد پوشه سایت شوید — همان پوشه‌ای که server.js در آن است.
۲. این فایل zip را همان‌جا آپلود و Extract کنید. روی «Replace All» بزنید.
۳. در cPanel → Setup Node.js App → RESTART.

چیزی را پاک نکنید. پوشه data (پایگاه داده و حساب مدیر) و
public/uploads (فایل‌هایی که خودتان بالا گذاشته‌اید) دست نمی‌خورند.

${
  removed.length
    ? `فایل‌های قدیمی که دیگر استفاده نمی‌شوند (پاک کردنشان اختیاری است):\n\n${removed
        .map((file) => `  ${file}`)
        .join("\n")}\n`
    : ""
}`,
);

console.log(`بسته به‌روزرسانی آماده است: ${outDir}`);
console.log(`  ${changed.length} فایل تغییر کرده یا تازه`);
console.log(`  ${removed.length} فایل قدیمی بلااستفاده`);
