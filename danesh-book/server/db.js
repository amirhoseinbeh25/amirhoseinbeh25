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
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    author          TEXT NOT NULL,
    translator      TEXT,
    category_id     TEXT NOT NULL REFERENCES categories(id),
    grade           TEXT,
    track           TEXT,
    price           INTEGER NOT NULL,
    old_price       INTEGER,
    badge           TEXT,
    rating          REAL DEFAULT 4.5,
    reviews         INTEGER DEFAULT 0,
    publisher       TEXT,
    pages           INTEGER,
    year            INTEGER,
    color           TEXT DEFAULT '#6d93ac',
    stock           INTEGER DEFAULT 0,
    description     TEXT,
    sample_pdf_url  TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    phone         TEXT UNIQUE NOT NULL,
    email         TEXT,
    password_hash TEXT NOT NULL,
    points        INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER REFERENCES users(id),
    customer_name    TEXT NOT NULL,
    phone            TEXT NOT NULL,
    address          TEXT,
    subtotal         INTEGER NOT NULL,
    shipping         INTEGER NOT NULL DEFAULT 0,
    total            INTEGER NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending',
    payment_status   TEXT NOT NULL DEFAULT 'unpaid',
    payment_ref      TEXT,
    payment_authority TEXT,
    created_at       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER,
    bundle_id  INTEGER,
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

  CREATE TABLE IF NOT EXISTS bundles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT,
    price       INTEGER NOT NULL,
    old_price   INTEGER,
    color       TEXT DEFAULT '#6d93ac',
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bundle_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    bundle_id  INTEGER NOT NULL REFERENCES bundles(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    qty        INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS bulk_orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name   TEXT NOT NULL,
    contact_name  TEXT NOT NULL,
    phone         TEXT NOT NULL,
    grade         TEXT,
    track         TEXT,
    items_note    TEXT,
    status        TEXT NOT NULL DEFAULT 'new',
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT UNIQUE NOT NULL,
    title        TEXT NOT NULL,
    excerpt      TEXT,
    content      TEXT NOT NULL,
    cover_color  TEXT DEFAULT '#6d93ac',
    published_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS return_requests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    user_id    INTEGER REFERENCES users(id),
    reason     TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER REFERENCES orders(id),
    channel    TEXT NOT NULL,
    recipient  TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

/* برای دیتابیس‌های قدیمی‌تر که این ستون‌ها را ندارند، ستون‌های جدید را اضافه می‌کند */
function ensureColumn(table, column, declaration) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = cols.some(c => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${declaration}`);
  }
}

ensureColumn("products", "grade", "TEXT");
ensureColumn("products", "track", "TEXT");
ensureColumn("products", "sample_pdf_url", "TEXT");
ensureColumn("orders", "user_id", "INTEGER REFERENCES users(id)");
ensureColumn("orders", "payment_status", "TEXT NOT NULL DEFAULT 'unpaid'");
ensureColumn("orders", "payment_ref", "TEXT");
ensureColumn("orders", "payment_authority", "TEXT");
ensureColumn("order_items", "bundle_id", "INTEGER");

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
      ["ریاضی دهم (رشته ریاضی و تجربی)", "گروه مؤلفان خیلی سبز", null, "riazi", "10", "moshtarek", 185000, 220000, "پرفروش", 4.8, 312, "خیلی سبز", 480, 1403, "#2c5f8a", 40, "کتاب کار و تست ریاضی پایه دهم همراه با آموزش کامل مفاهیم، تست‌های طبقه‌بندی‌شده و پاسخ‌های تشریحی گام‌به‌گام.", "sample-pdfs/riazi-dahom.pdf"],
      ["ریاضی هفتم", "گروه مؤلفان پویش", null, "riazi", "7", "moshtarek", 98000, null, null, 4.5, 87, "پویش", 180, 1403, "#b3792c", 45, "کتاب کار ریاضی پایه هفتم برای تثبیت مفاهیم پایه و آمادگی برای امتحانات مدرسه.", null],
      ["فیزیک یازدهم تجربی", "گروه مؤلفان گاج", null, "fizik", "11", "tajrobi", 210000, null, "جدید", 4.6, 150, "گاج", 392, 1403, "#8a6d1f", 30, "آموزش کامل فیزیک یازدهم تجربی به همراه تست‌های کنکوری و پاسخ تشریحی.", null],
      ["فیزیک دهم ریاضی", "گروه مؤلفان خیلی سبز", null, "fizik", "10", "riazi", 175000, 205000, "تخفیف", 4.5, 198, "خیلی سبز", 350, 1403, "#2e6b6b", 27, "کتاب آموزشی و تست فیزیک دهم رشته ریاضی با رویکرد کنکوری و حل تشریحی مسائل.", "sample-pdfs/fizik-dahom.pdf"],
      ["شیمی دوازدهم", "گروه مؤلفان مبتکران", null, "shimi", "12", "moshtarek", 230000, 275000, "تخفیف", 4.7, 266, "مبتکران", 512, 1403, "#5a2a2a", 22, "جمع‌بندی و تست شیمی دوازدهم ویژه کنکور سراسری با نکات کلیدی و پاسخ‌نامه کامل.", null],
      ["شیمی یازدهم (تجربی و ریاضی)", "گروه مؤلفان گاج", null, "shimi", "11", "moshtarek", 200000, null, "پرفروش", 4.6, 240, "گاج", 410, 1403, "#843e5c", 20, "آموزش مفهومی و تست شیمی یازدهم همراه با پاسخ‌های تشریحی کامل.", null],
      ["زیست‌شناسی کنکور جامع", "گروه مؤلفان خیلی سبز", null, "zist", "konkur", "tajrobi", 275000, 320000, "پرفروش", 4.8, 410, "خیلی سبز", 640, 1403, "#1d4d4d", 18, "جمع‌بندی کامل زیست‌شناسی دوره دوم متوسطه ویژه داوطلبان کنکور تجربی.", "sample-pdfs/zist-konkur.pdf"],
      ["زیست‌شناسی دهم", "گروه مؤلفان مبتکران", null, "zist", "10", "tajrobi", 160000, null, "جدید", 4.5, 120, "مبتکران", 300, 1403, "#4a4a2e", 34, "آموزش گام‌به‌گام زیست‌شناسی دهم همراه با تست‌های طبقه‌بندی‌شده.", null],
      ["ادبیات فارسی دهم", "گروه مؤلفان مبتکران", null, "adabiyat", "10", "moshtarek", 150000, null, null, 4.4, 95, "مبتکران", 320, 1403, "#6b4226", 25, "آموزش کامل آرایه‌های ادبی، قرابت معنایی و تست‌های کنکوری ادبیات فارسی دهم.", null],
      ["نگارش و زبان فارسی نهم", "گروه مؤلفان الگو", null, "adabiyat", "9", "moshtarek", 110000, 135000, "تخفیف", 4.3, 70, "الگو", 220, 1403, "#a85c32", 38, "کتاب کار نگارش و زبان فارسی پایه نهم مطابق با آخرین تغییرات کتاب درسی.", null],
      ["زبان انگلیسی کنکور", "گروه مؤلفان نشر الگو", null, "zaban", "konkur", "moshtarek", 195000, 230000, "تخفیف", 4.6, 180, "الگو", 288, 1403, "#2f6f5e", 33, "گرامر، لغات و تست‌های کنکوری زبان انگلیسی به‌صورت طبقه‌بندی‌شده.", null],
      ["۴۰۰۰ واژه ضروری زبان کنکور", "رهپویان دانش و اندیشه", null, "zaban", "konkur", "moshtarek", 140000, null, "پرفروش", 4.7, 350, "رهپویان دانش", 256, 1402, "#1f5d50", 42, "مجموعه کامل واژگان پرتکرار کنکور به همراه مثال و تمرین برای تثبیت یادگیری.", "sample-pdfs/4000-vajeh.pdf"],
      ["عربی، زبان قرآن یازدهم", "گروه مؤلفان الگو", null, "arabi", "11", "moshtarek", 165000, null, "جدید", 4.5, 88, "الگو", 260, 1403, "#7a3b2e", 28, "آموزش قواعد و ترجمه عربی یازدهم همراه با تست‌های کنکوری.", null],
      ["عربی دوازدهم جامع", "گروه مؤلفان گاج", null, "arabi", "12", "moshtarek", 185000, 215000, "تخفیف", 4.6, 140, "گاج", 300, 1403, "#3a3a52", 19, "جمع‌بندی قواعد و تست‌های عربی دوازدهم ویژه کنکور سراسری.", null],
      ["کنکور جامع علوم تجربی", "گروه مؤلفان گاج", null, "konkur", "konkur", "tajrobi", 480000, 560000, "ویژه کنکور", 4.9, 520, "گاج", 1200, 1403, "#3d2b56", 10, "بسته کامل جمع‌بندی تمامی دروس رشته تجربی ویژه کنکور سراسری با تست‌های اختصاصی.", "sample-pdfs/konkur-tajrobi.pdf"],
      ["پاسخ‌نامه تشریحی کنکور سراسری", "گروه مؤلفان گاج", null, "konkur", "konkur", "moshtarek", 220000, null, "جدید", 4.4, 76, "گاج", 500, 1403, "#6b8ca3", 15, "پاسخ تشریحی کامل سؤالات کنکور سراسری ۵ دوره اخیر به تفکیک درس.", null]
    ];
    const insertBook = db.prepare(`
      INSERT INTO products
        (title, author, translator, category_id, grade, track, price, old_price, badge, rating, reviews, publisher, pages, year, color, stock, description, sample_pdf_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  const settingsCount = db.prepare("SELECT COUNT(*) AS n FROM settings").get().n;
  if (settingsCount === 0) {
    const defaults = [
      ["konkur_exam_date", "2027-07-02"],
      ["site_announcement", "ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان"]
    ];
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const s of defaults) insertSetting.run(...s);
  }

  const bundleCount = db.prepare("SELECT COUNT(*) AS n FROM bundles").get().n;
  if (bundleCount === 0) {
    const findIds = (titles) => {
      const rows = db.prepare(`SELECT id, price FROM products WHERE title IN (${titles.map(() => "?").join(",")})`).all(...titles);
      return rows;
    };
    const dahomRiazi = findIds(["ریاضی دهم (رشته ریاضی و تجربی)", "فیزیک دهم ریاضی", "ادبیات فارسی دهم"]);
    const konkurTajrobi = findIds(["زیست‌شناسی کنکور جامع", "کنکور جامع علوم تجربی", "زبان انگلیسی کنکور"]);

    if (dahomRiazi.length) {
      const subtotal = dahomRiazi.reduce((s, p) => s + p.price, 0);
      const info = db.prepare("INSERT INTO bundles (title, description, price, old_price, color) VALUES (?, ?, ?, ?, ?)")
        .run("پک کامل پایه دهم (ریاضی)", "ریاضی، فیزیک و ادبیات فارسی دهم با تخفیف ویژه پک", Math.round(subtotal * 0.85 / 1000) * 1000, subtotal, "#2c5f8a");
      const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, qty) VALUES (?, ?, 1)");
      for (const p of dahomRiazi) insertItem.run(info.lastInsertRowid, p.id);
    }
    if (konkurTajrobi.length) {
      const subtotal = konkurTajrobi.reduce((s, p) => s + p.price, 0);
      const info = db.prepare("INSERT INTO bundles (title, description, price, old_price, color) VALUES (?, ?, ?, ?, ?)")
        .run("پک جمع‌بندی کنکور تجربی", "زیست، جمع‌بندی جامع تجربی و زبان کنکور در یک پک با تخفیف", Math.round(subtotal * 0.85 / 1000) * 1000, subtotal, "#1d4d4d");
      const insertItem = db.prepare("INSERT INTO bundle_items (bundle_id, product_id, qty) VALUES (?, ?, 1)");
      for (const p of konkurTajrobi) insertItem.run(info.lastInsertRowid, p.id);
    }
  }

  const postCount = db.prepare("SELECT COUNT(*) AS n FROM posts").get().n;
  if (postCount === 0) {
    const insertPost = db.prepare("INSERT INTO posts (slug, title, excerpt, content, cover_color) VALUES (?, ?, ?, ?, ?)");
    insertPost.run("barname-rizi-konkur", "چگونه برای کنکور برنامه‌ریزی کنیم؟", "اصول پایه برنامه‌ریزی درسی برای داوطلبان کنکور",
      "برنامه‌ریزی درسی باید واقع‌بینانه و قابل اجرا باشد. اول دروس ضعیف‌تر خود را شناسایی کنید و زمان بیشتری به آن‌ها اختصاص دهید. مرور دوره‌ای هفتگی و ماهانه را فراموش نکنید و برای هر هفته اهداف کوچک و قابل‌اندازه‌گیری تعیین کنید. استراحت کافی و خواب منظم هم بخشی جدایی‌ناپذیر از یک برنامه موفق است.",
      "#2c5f8a");
    insertPost.run("ravesh-motaleh-fizik", "روش مطالعه فیزیک برای تثبیت مفاهیم", "تکنیک‌های کاربردی برای درک عمیق‌تر فیزیک کنکور",
      "فیزیک درسی مفهومی است و حفظ کردن فرمول‌ها بدون درک آن‌ها نتیجه‌بخش نیست. بهتر است پس از یادگیری هر مبحث، چند مسئله متنوع از همان مبحث حل کنید و دلیل هر مرحله را برای خودتان توضیح دهید. استفاده از نمودار و شکل برای مسائل حرکت‌شناسی و الکتریسیته بسیار کمک‌کننده است.",
      "#8a6d1f");
    insertPost.run("entekhab-reshte", "راهنمای انتخاب رشته تحصیلی در دهم", "تفاوت رشته ریاضی، تجربی و انسانی چیست؟",
      "انتخاب رشته تحصیلی تصمیمی مهم در مسیر آینده تحصیلی و شغلی شماست. رشته ریاضی‌فیزیک برای علاقه‌مندان به مهندسی و علوم دقیقه مناسب است، رشته تجربی برای علاقه‌مندان به پزشکی و علوم زیستی، و رشته انسانی برای علاقه‌مندان به حقوق، روان‌شناسی و علوم اجتماعی. در انتخاب رشته به علاقه واقعی خود بیشتر از فشار اطرافیان توجه کنید.",
      "#5a2a2a");
  }
}

seedIfEmpty();

module.exports = db;
