const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "daneshbook.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id    TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon  TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,
    translator  TEXT,
    category_id TEXT NOT NULL REFERENCES categories(id),
    price       INTEGER NOT NULL,
    old_price   INTEGER,
    badge       TEXT,
    rating      REAL DEFAULT 4.5,
    reviews     INTEGER DEFAULT 0,
    publisher   TEXT,
    pages       INTEGER,
    year        INTEGER,
    color       TEXT DEFAULT '#6d93ac',
    stock       INTEGER DEFAULT 0,
    description TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone         TEXT NOT NULL,
    address       TEXT,
    subtotal      INTEGER NOT NULL,
    shipping      INTEGER NOT NULL DEFAULT 0,
    total         INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL,
    title      TEXT NOT NULL,
    price      INTEGER NOT NULL,
    qty        INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT
  );
`);

function seedIfEmpty() {
  const catCount = db.prepare("SELECT COUNT(*) AS n FROM categories").get().n;
  if (catCount === 0) {
    const categories = [
      ["riazi", "ریاضی", "📐"],
      ["fizik", "فیزیک", "⚛️"],
      ["shimi", "شیمی", "🧪"],
      ["zist", "زیست‌شناسی", "🧬"],
      ["adabiyat", "ادبیات فارسی", "📖"],
      ["zaban", "زبان انگلیسی", "🔤"],
      ["arabi", "عربی", "📗"],
      ["konkur", "کنکور و تست جامع", "🎯"]
    ];
    const insertCat = db.prepare("INSERT INTO categories (id, title, icon) VALUES (?, ?, ?)");
    for (const c of categories) insertCat.run(...c);
  }

  const prodCount = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (prodCount === 0) {
    const books = [
      ["ریاضی دهم (رشته ریاضی و تجربی)", "گروه مؤلفان خیلی سبز", null, "riazi", 185000, 220000, "پرفروش", 4.8, 312, "خیلی سبز", 480, 1403, "#2c5f8a", 40, "کتاب کار و تست ریاضی پایه دهم همراه با آموزش کامل مفاهیم، تست‌های طبقه‌بندی‌شده و پاسخ‌های تشریحی گام‌به‌گام."],
      ["ریاضی هفتم", "گروه مؤلفان پویش", null, "riazi", 98000, null, null, 4.5, 87, "پویش", 180, 1403, "#b3792c", 45, "کتاب کار ریاضی پایه هفتم برای تثبیت مفاهیم پایه و آمادگی برای امتحانات مدرسه."],
      ["فیزیک یازدهم تجربی", "گروه مؤلفان گاج", null, "fizik", 210000, null, "جدید", 4.6, 150, "گاج", 392, 1403, "#8a6d1f", 30, "آموزش کامل فیزیک یازدهم تجربی به همراه تست‌های کنکوری و پاسخ تشریحی."],
      ["فیزیک دهم ریاضی", "گروه مؤلفان خیلی سبز", null, "fizik", 175000, 205000, "تخفیف", 4.5, 198, "خیلی سبز", 350, 1403, "#2e6b6b", 27, "کتاب آموزشی و تست فیزیک دهم رشته ریاضی با رویکرد کنکوری و حل تشریحی مسائل."],
      ["شیمی دوازدهم", "گروه مؤلفان مبتکران", null, "shimi", 230000, 275000, "تخفیف", 4.7, 266, "مبتکران", 512, 1403, "#5a2a2a", 22, "جمع‌بندی و تست شیمی دوازدهم ویژه کنکور سراسری با نکات کلیدی و پاسخ‌نامه کامل."],
      ["شیمی یازدهم (تجربی و ریاضی)", "گروه مؤلفان گاج", null, "shimi", 200000, null, "پرفروش", 4.6, 240, "گاج", 410, 1403, "#843e5c", 20, "آموزش مفهومی و تست شیمی یازدهم همراه با پاسخ‌های تشریحی کامل."],
      ["زیست‌شناسی کنکور جامع", "گروه مؤلفان خیلی سبز", null, "zist", 275000, 320000, "پرفروش", 4.8, 410, "خیلی سبز", 640, 1403, "#1d4d4d", 18, "جمع‌بندی کامل زیست‌شناسی دوره دوم متوسطه ویژه داوطلبان کنکور تجربی."],
      ["زیست‌شناسی دهم", "گروه مؤلفان مبتکران", null, "zist", 160000, null, "جدید", 4.5, 120, "مبتکران", 300, 1403, "#4a4a2e", 34, "آموزش گام‌به‌گام زیست‌شناسی دهم همراه با تست‌های طبقه‌بندی‌شده."],
      ["ادبیات فارسی دهم", "گروه مؤلفان مبتکران", null, "adabiyat", 150000, null, null, 4.4, 95, "مبتکران", 320, 1403, "#6b4226", 25, "آموزش کامل آرایه‌های ادبی، قرابت معنایی و تست‌های کنکوری ادبیات فارسی دهم."],
      ["نگارش و زبان فارسی نهم", "گروه مؤلفان الگو", null, "adabiyat", 110000, 135000, "تخفیف", 4.3, 70, "الگو", 220, 1403, "#a85c32", 38, "کتاب کار نگارش و زبان فارسی پایه نهم مطابق با آخرین تغییرات کتاب درسی."],
      ["زبان انگلیسی کنکور", "گروه مؤلفان نشر الگو", null, "zaban", 195000, 230000, "تخفیف", 4.6, 180, "الگو", 288, 1403, "#2f6f5e", 33, "گرامر، لغات و تست‌های کنکوری زبان انگلیسی به‌صورت طبقه‌بندی‌شده."],
      ["۴۰۰۰ واژه ضروری زبان کنکور", "رهپویان دانش و اندیشه", null, "zaban", 140000, null, "پرفروش", 4.7, 350, "رهپویان دانش", 256, 1402, "#1f5d50", 42, "مجموعه کامل واژگان پرتکرار کنکور به همراه مثال و تمرین برای تثبیت یادگیری."],
      ["عربی، زبان قرآن یازدهم", "گروه مؤلفان الگو", null, "arabi", 165000, null, "جدید", 4.5, 88, "الگو", 260, 1403, "#7a3b2e", 28, "آموزش قواعد و ترجمه عربی یازدهم همراه با تست‌های کنکوری."],
      ["عربی دوازدهم جامع", "گروه مؤلفان گاج", null, "arabi", 185000, 215000, "تخفیف", 4.6, 140, "گاج", 300, 1403, "#3a3a52", 19, "جمع‌بندی قواعد و تست‌های عربی دوازدهم ویژه کنکور سراسری."],
      ["کنکور جامع علوم تجربی", "گروه مؤلفان گاج", null, "konkur", 480000, 560000, "ویژه کنکور", 4.9, 520, "گاج", 1200, 1403, "#3d2b56", 10, "بسته کامل جمع‌بندی تمامی دروس رشته تجربی ویژه کنکور سراسری با تست‌های اختصاصی."],
      ["پاسخ‌نامه تشریحی کنکور سراسری", "گروه مؤلفان گاج", null, "konkur", 220000, null, "جدید", 4.4, 76, "گاج", 500, 1403, "#6b8ca3", 15, "پاسخ تشریحی کامل سؤالات کنکور سراسری ۵ دوره اخیر به تفکیک درس."]
    ];
    const insertBook = db.prepare(`
      INSERT INTO products
        (title, author, translator, category_id, price, old_price, badge, rating, reviews, publisher, pages, year, color, stock, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of books) insertBook.run(...b);
  }

  const adminCount = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (adminCount === 0) {
    const email = (process.env.ADMIN_EMAIL || "admin@daneshbook.ir").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)")
      .run(email, hash, "مدیر دانش بوک");
    console.log(`[seed] حساب ادمین پیش‌فرض ساخته شد → ایمیل: ${email} | رمز عبور: ${password}`);
  }
}

seedIfEmpty();

module.exports = db;
