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
      ["roman", "رمان و ادبیات داستانی", "📖"],
      ["classic", "ادبیات کلاسیک", "🏛️"],
      ["psychology", "روان‌شناسی و خودشناسی", "🧠"],
      ["history", "تاریخ و سیاست", "🏺"],
      ["business", "کسب‌وکار و مدیریت", "💼"],
      ["kids", "کودک و نوجوان", "🧸"],
      ["poetry", "شعر و ادبیات", "🌙"],
      ["science", "علمی و دانشگاهی", "🔬"]
    ];
    const insertCat = db.prepare("INSERT INTO categories (id, title, icon) VALUES (?, ?, ?)");
    for (const c of categories) insertCat.run(...c);
  }

  const prodCount = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (prodCount === 0) {
    const books = [
      ["ملت عشق", "الیف شافاک", "ارسلان فصیحی", "roman", 420000, 520000, "پرفروش", 4.8, 312, "نشر ققنوس", 480, 1401, "#2f6f5e", 18, "رمانی پرفروش که داستان دو زندگی موازی را در قرن سیزدهم و قرن بیست‌ویکم روایت می‌کند و به عشق، عرفان و شناخت می‌پردازد."],
      ["کیمیاگر", "پائولو کوئیلو", "آرش حجازی", "roman", 185000, 230000, "تخفیف", 4.6, 540, "نشر کاروان", 192, 1400, "#b3792c", 25, "داستان چوپانی اسپانیایی که برای یافتن گنجی افسانه‌ای سفر می‌کند و در این راه معنای زندگی را کشف می‌کند."],
      ["بوف کور", "صادق هدایت", null, "classic", 150000, null, "کلاسیک", 4.5, 210, "نشر چشمه", 136, 1399, "#3a3a52", 30, "یکی از تأثیرگذارترین آثار ادبیات فارسی معاصر، روایتی سوررئال از تنهایی و مرگ‌اندیشی."],
      ["جنایت و مکافات", "فئودور داستایفسکی", "مهری آهی", "classic", 480000, 560000, "پرفروش", 4.9, 410, "نشر خوارزمی", 912, 1401, "#5a2a2a", 12, "رمانی روان‌شناختی درباره گناه، کیفر و رستگاری که یکی از برجسته‌ترین آثار ادبیات روسیه است."],
      ["اتوبیوگرافی یک یوگی", "پاراماهانسا یوگاناندا", "مانی جمشیدی", "psychology", 260000, null, "جدید", 4.7, 98, "نشر دایره", 420, 1402, "#1f5d50", 20, "روایتی معنوی از زندگی یک استاد یوگای هندی و تجربه‌های عرفانی او در شرق و غرب."],
      ["اثر مرکب", "دارن هاردی", "مینا اعظامی", "business", 198000, 240000, "تخفیف", 4.4, 275, "نشر نسل نواندیش", 220, 1400, "#8a6d1f", 40, "راهکارهایی ساده برای رسیدن به موفقیت بزرگ از طریق تصمیم‌های کوچک و پیوسته."],
      ["پدر پولدار، پدر فقیر", "رابرت کیوساکی", "محمدرضا آل‌یاسین", "business", 175000, null, null, 4.5, 630, "نشر آتیسا", 260, 1399, "#2c5f8a", 35, "درس‌هایی درباره آموزش مالی که والدین معمولی هرگز به فرزندان خود نمی‌دهند."],
      ["شازده کوچولو", "آنتوان دو سنت‌اگزوپری", "محمد قاضی", "kids", 95000, 120000, "پرفروش", 4.9, 820, "نشر نیلوفر", 96, 1402, "#d4a24c", 50, "داستانی لطیف و فیلسوفانه برای همه سنین دربارهٔ دوستی، عشق و از دست دادن."],
      ["مزرعه حیوانات", "جورج اورول", "صالح حسینی", "classic", 140000, null, null, 4.6, 390, "نشر نیلوفر", 152, 1400, "#4a4a2e", 22, "تمثیلی سیاسی و طعنه‌آمیز از انقلاب و قدرت که در قالب داستان حیوانات یک مزرعه روایت می‌شود."],
      ["تاریخ ایران باستان", "حسن پیرنیا", null, "history", 320000, null, "جدید", 4.3, 64, "نشر نگاه", 760, 1402, "#7a3b2e", 15, "بررسی دقیق و مستند تاریخ ایران از دوران هخامنشیان تا پایان ساسانیان."],
      ["دیوان حافظ", "خواجه شمس‌الدین حافظ", null, "poetry", 280000, 340000, "تخفیف", 4.9, 455, "نشر اساطیر", 640, 1401, "#3d2b56", 28, "مجموعه کامل غزلیات حافظ شیرازی همراه با شرح لغات و تصحیح معتبر."],
      ["هوموساپینس", "یوال نوح هراری", "نیک گرگین", "science", 390000, 450000, "پرفروش", 4.8, 702, "نشر فرهنگ نشر نو", 528, 1401, "#1d4d4d", 19, "روایتی خواندنی از تاریخ تطور انسان، از عصر حجر تا انقلاب فناوری اطلاعات."],
      ["صد سال تنهایی", "گابریل گارسیا مارکز", "بهمن فرزانه", "roman", 345000, null, "کلاسیک", 4.7, 380, "نشر امیرکبیر", 432, 1400, "#6b4226", 16, "شاهکار رئالیسم جادویی که سرگذشت هفت نسل از خانواده بوئندیا را روایت می‌کند."],
      ["قدرت عادت", "چارلز داهیگ", "پرویز ترکان", "psychology", 210000, 255000, "تخفیف", 4.5, 266, "نشر میلکان", 350, 1401, "#2e6b6b", 33, "چرا عادت می‌کنیم و چگونه می‌توانیم عادت‌های خود را در زندگی و کسب‌وکار تغییر دهیم."],
      ["مارمولک", "هوشنگ مرادی کرمانی", null, "kids", 88000, null, "جدید", 4.4, 54, "نشر معین", 160, 1402, "#a85c32", 24, "مجموعه داستان‌های کوتاه و دلنشین برای نوجوانان از نویسنده محبوب ادبیات کودک ایران."],
      ["غرور و تعصب", "جین آستین", "رضا رضایی", "classic", 230000, 270000, "تخفیف", 4.7, 300, "نشر نی", 424, 1400, "#843e5c", 21, "رمانی کلاسیک و پرطرفدار درباره عشق، طبقه اجتماعی و پیش‌داوری در انگلستان قرن نوزدهم."]
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
