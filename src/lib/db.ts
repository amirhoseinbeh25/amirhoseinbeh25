import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "kemkan.db");

declare global {
  var __kemkanDb: Database.Database | undefined;
}

export const db = globalThis.__kemkanDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalThis.__kemkanDb = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'amber'
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  brand TEXT NOT NULL DEFAULT '—',
  summary TEXT NOT NULL DEFAULT '',
  specs TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name_latin TEXT NOT NULL DEFAULT 'Kemkan',
  name_fa TEXT NOT NULL DEFAULT 'کم‌کان',
  tagline TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  phone1 TEXT NOT NULL DEFAULT '',
  phone2 TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  map_embed_url TEXT NOT NULL DEFAULT '',
  work_hours TEXT NOT NULL DEFAULT '',
  social_telegram TEXT NOT NULL DEFAULT '',
  social_instagram TEXT NOT NULL DEFAULT '',
  social_whatsapp TEXT NOT NULL DEFAULT '',
  social_linkedin TEXT NOT NULL DEFAULT ''
);
`);

seedIfEmpty();

function seedIfEmpty() {
  const { count } = db.prepare("SELECT count(*) as count FROM categories").get() as { count: number };
  if (count > 0) return;

  const insertCategory = db.prepare(
    "INSERT INTO categories (slug, title, description, color) VALUES (?, ?, ?, ?)"
  );
  const categories = [
    ["epoxy-resin", "رزین اپوکسی", "رزین و هاردنر اپوکسی برای پوشش، کفپوش و کامپوزیت", "amber"],
    ["polyester-resin", "رزین پلی‌استر", "رزین پلی‌استر غیراشباع برای قالب‌گیری و کامپوزیت", "coral"],
    ["polyurethane", "رزین پلی‌یورتان", "سیستم‌های پلی‌یورتان برای پوشش و آب‌بندی", "indigo"],
    ["hardener-catalyst", "هاردنر و کاتالیست", "سخت‌کننده و کاتالیست متناسب با انواع رزین", "teal"],
    ["industrial-paint", "رنگ‌های صنعتی", "پوشش‌های صنعتی مقاوم در برابر خوردگی و سایش", "olive"],
    ["architectural-paint", "رنگ‌های ساختمانی", "رنگ داخلی و نمای ساختمان با کیفیت بالا", "coral"],
    ["additives", "افزودنی‌ها", "افزودنی‌های بهبود‌دهنده فرآیند و کیفیت", "indigo"],
    ["solvents", "حلال‌ها", "حلال‌های صنعتی برای رقیق‌سازی و شست‌وشو", "teal"],
  ] as const;
  const categoryIds: Record<string, number> = {};
  for (const c of categories) {
    const info = insertCategory.run(...c);
    categoryIds[c[0]] = info.lastInsertRowid as number;
  }

  const insertProduct = db.prepare(
    "INSERT INTO products (slug, title, category_id, brand, summary, specs) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const products: [string, string, string, string, string, { label: string; value: string }[]][] = [
    ["epoxy-resin-lv50", "رزین اپوکسی رقیق LV50", "epoxy-resin", "—", "رزین اپوکسی با ویسکوزیته پایین، مناسب کفپوش و کامپوزیت.", [
      { label: "ویسکوزیته", value: "—" },
      { label: "زمان ژل", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["epoxy-hardener-ha11", "هاردنر اپوکسی HA11", "hardener-catalyst", "—", "هاردنر آمینی برای سیستم‌های اپوکسی عمومی.", [
      { label: "نسبت اختلاط", value: "—" },
      { label: "زمان کارکرد", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["polyester-resin-general", "رزین پلی‌استر عمومی", "polyester-resin", "—", "رزین پلی‌استر غیراشباع برای قالب‌گیری دستی و کامپوزیت.", [
      { label: "ویسکوزیته", value: "—" },
      { label: "زمان ژل", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["polyurethane-coating-pu200", "پوشش پلی‌یورتان PU200", "polyurethane", "—", "پوشش دو جزئی پلی‌یورتان با مقاومت شیمیایی بالا.", [
      { label: "نوع", value: "دو جزئی" },
      { label: "براقیت", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["industrial-paint-anticorrosive", "رنگ صنعتی ضد خوردگی", "industrial-paint", "—", "پوشش محافظ فلزات در برابر زنگ‌زدگی و خوردگی.", [
      { label: "پایه", value: "—" },
      { label: "رنگ", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["architectural-paint-interior", "رنگ پلاستیک داخلی", "architectural-paint", "—", "رنگ ساختمانی داخلی، شست‌شوپذیر و کم‌بو.", [
      { label: "پوشش‌دهی", value: "—" },
      { label: "درجه براقیت", value: "مات" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["additive-defoamer", "افزودنی ضد کف", "additives", "—", "افزودنی کاهش‌دهنده کف در فرمولاسیون رنگ و رزین.", [
      { label: "دوز مصرف", value: "—" },
      { label: "حالت", value: "مایع" },
      { label: "بسته‌بندی", value: "—" },
    ]],
    ["solvent-xylene", "زایلین صنعتی", "solvents", "—", "حلال آروماتیک برای رقیق‌سازی رنگ و رزین.", [
      { label: "درجه خلوص", value: "—" },
      { label: "کاربرد", value: "رقیق‌کننده" },
      { label: "بسته‌بندی", value: "—" },
    ]],
  ];
  for (const [slug, title, categorySlug, brand, summary, specs] of products) {
    insertProduct.run(slug, title, categoryIds[categorySlug], brand, summary, JSON.stringify(specs));
  }

  const insertBrand = db.prepare("INSERT INTO brands (slug, name) VALUES (?, ?)");
  for (let i = 1; i <= 6; i++) insertBrand.run(`brand-${i}`, `برند همکار ${i}`);

  const insertPost = db.prepare(
    "INSERT INTO posts (slug, title, date, excerpt, content) VALUES (?, ?, ?, ?, ?)"
  );
  insertPost.run(
    "resin-selection-guide",
    "راهنمای انتخاب رزین مناسب برای پروژه شما",
    "۱۴۰۴/۰۲/۲۰",
    "تفاوت رزین‌های اپوکسی، پلی‌استر و پلی‌یورتان در چیست و برای کدام کاربرد مناسب‌ترند؟",
    "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود.\n\nدر این مقاله به بررسی تفاوت انواع رزین و کاربرد هر یک می‌پردازیم."
  );
  insertPost.run(
    "industrial-paint-storage",
    "نکات نگهداری و انبارداری رنگ‌های صنعتی",
    "۱۴۰۴/۰۱/۱۵",
    "رعایت چند نکته ساده می‌تواند عمر مفید رنگ‌های صنعتی را افزایش دهد.",
    "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود."
  );
  insertPost.run(
    "kemkan-news",
    "اخبار کم‌کان",
    "۱۴۰۳/۱۲/۰۱",
    "آخرین رویدادها و اخبار مجموعه کم‌کان.",
    "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود."
  );

  db.prepare(
    `INSERT INTO site_settings (id, name_latin, name_fa, tagline, short_description)
     VALUES (1, 'Kemkan', 'کم‌کان', 'رنگ، رزین و مواد شیمیایی صنعتی',
     'کم‌کان تامین‌کننده رزین‌های اپوکسی، پلی‌استر و پلی‌یورتان، رنگ‌های صنعتی و ساختمانی، هاردنر، افزودنی و حلال‌های شیمیایی برای صنایع مختلف است.')`
  ).run();
}
