/* خواندن و اعتبارسنجی تنظیمات قابل ویرایش سایت (هدر، صفحه اصلی، فوتر، رنگ‌ها و ...) */
const db = require("../db");
const defaults = require("../defaults");
const v = require("./validate");

const IMAGE_KEYS = ["logo_image", "favicon_image", "trust_bg_image", "newsletter_bg_image"];
const COLOR_KEYS = ["theme_primary", "theme_primary_dark", "theme_accent", "theme_accent_dark", "theme_text", "theme_page_bg"];
const INT_KEYS = {
  shipping_cost: { min: 0, max: 100000000 },
  free_shipping_threshold: { min: 0, max: 1000000000 },
  flash_hours: { min: 1, max: 168 }
};
const BOOL_KEYS = ["topbar_enabled"];
const LONG_TEXT_KEYS = ["footer_about_text", "seo_description"];

function getSettings() {
  const out = { ...defaults.SETTINGS };
  for (const r of db.prepare("SELECT key, value FROM settings").all()) out[r.key] = r.value;
  return out;
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function sanitizeSection(s, def) {
  const out = { ...def, enabled: v.bool(s.enabled, def.enabled) };
  if (def.title !== undefined) out.title = v.text(s.title !== undefined ? s.title : def.title, { max: 150, label: "عنوان بخش" });
  if (def.subtitle !== undefined) out.subtitle = v.text(s.subtitle !== undefined ? s.subtitle : def.subtitle, { max: 300, label: "زیرعنوان بخش" });
  if (def.limit !== undefined) out.limit = v.int(s.limit, { min: 1, max: 24, fallback: def.limit });
  return out;
}

// بخش‌های صفحه اصلی به ترتیب ذخیره‌شده؛ بخش‌هایی که بعداً به سایت اضافه شده‌اند به انتها اضافه می‌شوند
function mergeHomeSections(saved) {
  const byKey = new Map(defaults.HOME_SECTIONS.map(s => [s.key, s]));
  const out = [];
  const seen = new Set();
  for (const s of Array.isArray(saved) ? saved : []) {
    const def = s && byKey.get(s.key);
    if (!def || seen.has(def.key)) continue;
    seen.add(def.key);
    out.push(sanitizeSection(s, def));
  }
  for (const def of defaults.HOME_SECTIONS) if (!seen.has(def.key)) out.push({ ...def });
  return out;
}

function sanitizeTrustItems(list) {
  if (!Array.isArray(list)) throw new v.ValidationError("فهرست مزایا معتبر نیست.");
  return list.slice(0, 8).map(it => ({
    icon: v.text(it && it.icon, { max: 16, label: "آیکون" }),
    title: v.text(it && it.title, { required: true, max: 60, label: "عنوان مزیت" }),
    text: v.text(it && it.text, { max: 160, label: "توضیح مزیت" })
  }));
}

function sanitizeBanners(list) {
  if (!Array.isArray(list)) throw new v.ValidationError("فهرست بنرها معتبر نیست.");
  return list.slice(0, 6).map(it => {
    const image = v.imageUrl(it && it.image, "تصویر بنر");
    if (!image) throw new v.ValidationError("برای هر بنر یک تصویر انتخاب کنید.");
    return { image, link: v.link(it && it.link, "لینک بنر"), alt: v.text(it && it.alt, { max: 120, label: "متن جایگزین بنر" }) };
  });
}

function asJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch (e) { /* در ادامه خطا داده می‌شود */ }
  }
  throw new v.ValidationError("داده ارسالی معتبر نیست.");
}

function sanitizeSetting(key, value) {
  if (!(key in defaults.SETTINGS)) throw new v.ValidationError(`تنظیم «${key}» شناخته‌شده نیست.`);

  if (IMAGE_KEYS.includes(key)) return v.imageUrl(value) || "";
  if (COLOR_KEYS.includes(key)) return v.color(value, defaults.SETTINGS[key]);
  if (INT_KEYS[key]) return String(v.int(value, { ...INT_KEYS[key], fallback: Number(defaults.SETTINGS[key]) }));
  if (BOOL_KEYS.includes(key)) return v.bool(value) ? "1" : "0";

  if (key === "home_sections") return JSON.stringify(mergeHomeSections(asJsonArray(value)));
  if (key === "trust_items") return JSON.stringify(sanitizeTrustItems(asJsonArray(value)));
  if (key === "home_banners") return JSON.stringify(sanitizeBanners(asJsonArray(value)));

  if (key === "konkur_exam_date") {
    const d = v.text(value, { max: 10 });
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new v.ValidationError("تاریخ کنکور معتبر نیست.");
    return d;
  }
  if (key === "enamad_id" || key === "enamad_code") {
    const code = v.text(value, { max: 40 });
    if (code && !/^[A-Za-z0-9]+$/.test(code)) throw new v.ValidationError("شناسه یا کد اینماد معتبر نیست.");
    return code;
  }
  return v.text(value, { max: LONG_TEXT_KEYS.includes(key) ? 2000 : 300 });
}

function saveSettings(updates) {
  const clean = {};
  for (const [key, value] of Object.entries(updates || {})) clean[key] = sanitizeSetting(key, value);
  const upsert = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [key, value] of Object.entries(clean)) upsert.run(key, value);
  return getSettings();
}

// تنظیمات به‌همراه نسخه پردازش‌شده بخش‌های JSON برای استفاده مستقیم در سایت
function publicSiteConfig() {
  const settings = getSettings();
  return {
    settings,
    homeSections: mergeHomeSections(parseJson(settings.home_sections, [])),
    trustItems: parseJson(settings.trust_items, defaults.TRUST_ITEMS),
    homeBanners: parseJson(settings.home_banners, [])
  };
}

function shippingRules() {
  const s = getSettings();
  return {
    cost: Number(s.shipping_cost) || 0,
    freeThreshold: Number(s.free_shipping_threshold) || 0
  };
}

module.exports = { getSettings, saveSettings, publicSiteConfig, shippingRules, mergeHomeSections };
