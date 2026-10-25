/* دانش بوک — کمک‌توابع نمایش داده (داده واقعی از API بک‌اند خوانده می‌شود) */

let CATEGORIES = [];
let BOOKS = [];
let SITE = {};
let MENU = {};
let HOME = { sections: [], trustItems: [], banners: [] };

// مقدار اولیه تا زمان دریافت از API؛ بعد از initPage با داده دیتابیس جایگزین می‌شود
let GRADES = [
  { id: "7", title: "هفتم" },
  { id: "8", title: "هشتم" },
  { id: "9", title: "نهم" },
  { id: "10", title: "دهم" },
  { id: "11", title: "یازدهم" },
  { id: "12", title: "دوازدهم" },
  { id: "konkur", title: "کنکور / جامع" }
];

let TRACKS = [
  { id: "riazi", title: "ریاضی‌فیزیک" },
  { id: "tajrobi", title: "علوم تجربی" },
  { id: "ensani", title: "علوم انسانی" },
  { id: "fan", title: "فنی و حرفه‌ای" },
  { id: "moshtarek", title: "مشترک همه رشته‌ها" }
];

function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* فقط لینک‌های امن (http/https، نسبی، mailto، tel) مجازند */
function safeUrl(url) {
  if (!url) return "#";
  const compact = String(url).replace(/[\s\x00-\x1f]/g, "").toLowerCase();
  const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/);
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme[1])) return "#";
  return String(url).trim();
}

/* لینک تماس تلفنی؛ ارقام فارسی و عربی به انگلیسی تبدیل می‌شوند تا روی همه گوشی‌ها کار کند */
function telHref(phone) {
  const digits = String(phone || "")
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^0-9+]/g, "");
  return "tel:" + digits;
}

/* آدرس تصویر فقط از همین سایت (uploads/assets) یا http/https بدون کاراکترهای خطرناک */
function safeImageUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  return /^(\/(uploads|assets)\/[A-Za-z0-9._\/-]+|https?:\/\/[^\s"'<>()\\]+)$/.test(u) && !u.includes("..") ? u : "";
}

/* نسخه کوچک تصویری که از پنل آپلود شده (برای کارت‌ها)؛ برای بقیه آدرس‌ها همان تصویر */
function thumbUrl(url) {
  const u = safeImageUrl(url);
  const m = /^\/uploads\/([a-z0-9]+-[a-f0-9]{16})\.(jpg|png|webp|gif)$/.exec(u);
  return m ? `/uploads/${m[1]}-t.jpg` : u;
}

/* تگ تصویر سبک: نسخه کوچک + بارگذاری تنبل؛ اگر نسخه کوچک نبود، خود تصویر نمایش داده می‌شود */
function imgTag(url, { alt = "", cls = "", thumb = true, lazy = true } = {}) {
  const full = safeImageUrl(url);
  if (!full) return "";
  const src = thumb ? thumbUrl(full) : full;
  const fallback = src !== full ? ` onerror="this.onerror=null;this.src='${esc(full)}'"` : "";
  return `<img src="${esc(src)}"${cls ? ` class="${esc(cls)}"` : ""} alt="${esc(alt)}"${lazy ? ` loading="lazy"` : ""} decoding="async"${fallback}>`;
}

/* مقدار امن برای background-image داخل استایل */
function cssUrl(url) {
  const u = safeImageUrl(url);
  return u ? `url('${u}')` : "none";
}

/* تبدیل رنگ hex به rgba برای پوشش رنگی روی عکس‌ها */
function hexToRgba(hex, alpha) {
  let h = String(hex || "").replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = "8fc1e8";
  const n = parseInt(h, 16);
  const a = Math.min(1, Math.max(0, Number(alpha)));
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Number.isFinite(a) ? a : 0.78})`;
}

/*
 * نمایش امن متن‌های قابل ویرایش در پنل ادمین (صفحات، وبلاگ و توضیحات کتاب).
 * قالب: «## تیتر»، «### زیرتیتر»، «- آیتم لیست»، «1. لیست شماره‌دار»، «---» خط جداکننده،
 * «**پررنگ**»، «[متن](آدرس)» لینک، «![توضیح](آدرس تصویر)» تصویر، «[[card:آیکون|عنوان|متن]]» کارت،
 * «[[faq:سوال|پاسخ]]» پرسش و پاسخ بازشونده و «[[button:متن|آدرس]]» دکمه.
 */
function renderRichText(text) {
  if (!text) return "";
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => `<a href="${esc(safeUrl(url.replace(/&amp;/g, "&")))}">${label}</a>`);

  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let para = [];
  let list = null;
  let cards = [];
  let faqs = [];

  const flushPara = () => { if (para.length) { out.push(`<p>${para.join("<br>")}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map(i => `<li>${i}</li>`).join("")}</${list.tag}>`); list = null; } };
  const flushCards = () => {
    if (cards.length) {
      out.push(`<div class="info-grid">${cards.map(c => `
        <div class="info-card"><div class="info-ico">${esc(c[0])}</div><h3>${inline(c[1])}</h3><p>${inline(c[2] || "")}</p></div>`).join("")}</div>`);
      cards = [];
    }
  };
  const flushFaqs = () => {
    if (faqs.length) {
      out.push(`<div class="faq-list">${faqs.map(f => `
        <details class="faq-item"><summary>${inline(f[0])}</summary><div class="faq-answer">${inline(f[1])}</div></details>`).join("")}</div>`);
      faqs = [];
    }
  };
  const flushAll = () => { flushPara(); flushList(); flushCards(); flushFaqs(); };

  for (const raw of lines) {
    const line = raw.trim();
    const card = line.match(/^\[\[card:([^|]*)\|([^|]*)(?:\|(.*))?\]\]$/);
    if (card) { flushPara(); flushList(); flushFaqs(); cards.push([card[1], card[2], card[3]]); continue; }
    const faq = line.match(/^\[\[faq:([^|]+)\|(.+)\]\]$/);
    if (faq) { flushPara(); flushList(); flushCards(); faqs.push([faq[1], faq[2]]); continue; }
    flushCards();
    flushFaqs();
    if (!line) { flushPara(); flushList(); continue; }
    const button = line.match(/^\[\[button:([^|]+)\|([^\]\s]+)\]\]$/);
    if (button) { flushAll(); out.push(`<p class="rt-actions"><a class="btn btn-primary" href="${esc(safeUrl(button[2]))}">${esc(button[1])}</a></p>`); continue; }
    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image) {
      flushAll();
      const src = safeImageUrl(image[2]);
      if (src) out.push(`<figure class="rt-figure"><img src="${esc(src)}" alt="${esc(image[1])}" loading="lazy">${image[1] ? `<figcaption>${esc(image[1])}</figcaption>` : ""}</figure>`);
      continue;
    }
    if (line === "---") { flushAll(); out.push("<hr>"); continue; }
    let m;
    if ((m = line.match(/^###\s+(.+)/))) { flushAll(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.+)/))) { flushAll(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^[-*]\s+(.+)/))) {
      flushPara();
      if (!list || list.tag !== "ul") { flushList(); list = { tag: "ul", items: [] }; }
      list.items.push(inline(m[1]));
      continue;
    }
    if ((m = line.match(/^[0-9۰-۹]+[.)]\s+(.+)/))) {
      flushPara();
      if (!list || list.tag !== "ol") { flushList(); list = { tag: "ol", items: [] }; }
      list.items.push(inline(m[1]));
      continue;
    }
    flushList();
    para.push(inline(line));
  }
  flushAll();
  return out.join("\n");
}

function getBookById(id) {
  return BOOKS.find(b => String(b.id) === String(id));
}

function getCategoryTitle(catId) {
  const c = CATEGORIES.find(c => c.id === catId);
  return c ? c.title : catId;
}

function getGradeTitle(gradeId) {
  const g = GRADES.find(g => g.id === gradeId);
  return g ? g.title : gradeId;
}

function getTrackTitle(trackId) {
  const t = TRACKS.find(t => t.id === trackId);
  return t ? t.title : trackId;
}

function formatPrice(n) {
  return Number(n).toLocaleString("fa-IR") + " تومان";
}

/* عدد با ارقام فارسی و بدون جداکننده (مثل سال چاپ) */
function faNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString("fa-IR", { useGrouping: false }) : esc(n);
}

function xmlEscape(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* تولید جلد کتاب به صورت SVG برای کتاب‌هایی که هنوز عکس ندارند */
function bookCoverDataUrl(book) {
  const initials = book.title.trim().split(" ").slice(0, 2).map(w => w[0]).join("");
  const color = /^#[0-9a-fA-F]{3,8}$/.test(book.color || "") ? book.color : "#6d93ac";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#1c2a33"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#g)"/>
      <rect x="18" y="18" width="364" height="524" fill="none" stroke="#f3e9d2" stroke-width="2" opacity="0.5"/>
      <text x="200" y="260" font-family="Vazirmatn, Tahoma, sans-serif" font-size="46" fill="#f3e9d2" text-anchor="middle" font-weight="700">${xmlEscape(initials)}</text>
      <foreignObject x="30" y="300" width="340" height="180">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Vazirmatn,Tahoma,sans-serif;color:#f3e9d2;text-align:center;font-size:22px;line-height:1.5;font-weight:700;direction:rtl;">
          ${xmlEscape(book.title)}
        </div>
      </foreignObject>
      <text x="200" y="520" font-family="Vazirmatn, Tahoma, sans-serif" font-size="16" fill="#f3e9d2" text-anchor="middle" opacity="0.85">${xmlEscape(book.author)}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* عکس واقعی کتاب اگر آپلود شده باشد، وگرنه جلد تولیدی */
function productImage(book) {
  return safeImageUrl(book.imageUrl) || bookCoverDataUrl(book);
}

/* تگ تصویر کتاب برای کارت‌ها و فهرست‌ها (نسخه کوچک عکس یا جلد تولیدی) */
function productImgTag(book, { cls = "", lazy = true, thumb = true } = {}) {
  if (safeImageUrl(book.imageUrl)) return imgTag(book.imageUrl, { alt: book.title, cls, lazy, thumb });
  return `<img src="${esc(bookCoverDataUrl(book))}"${cls ? ` class="${esc(cls)}"` : ""} alt="${esc(book.title)}"${lazy ? ` loading="lazy"` : ""} decoding="async">`;
}
