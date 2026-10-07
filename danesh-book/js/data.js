/* دانش بوک — کمک‌توابع نمایش داده (داده واقعی از API بک‌اند خوانده می‌شود) */

let CATEGORIES = [];
let BOOKS = [];

function getBookById(id) {
  return BOOKS.find(b => String(b.id) === String(id));
}

function getCategoryTitle(catId) {
  const c = CATEGORIES.find(c => c.id === catId);
  return c ? c.title : catId;
}

function formatPrice(n) {
  return Number(n).toLocaleString("fa-IR") + " تومان";
}

/* تولید جلد کتاب به صورت SVG بدون نیاز به تصویر خارجی */
function bookCoverDataUrl(book) {
  const initials = book.title.trim().split(" ").slice(0, 2).map(w => w[0]).join("");
  const color = book.color || "#1f5d50";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#1b1410"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#g)"/>
      <rect x="18" y="18" width="364" height="524" fill="none" stroke="#f3e9d2" stroke-width="2" opacity="0.5"/>
      <text x="200" y="260" font-family="Vazirmatn, Tahoma, sans-serif" font-size="46" fill="#f3e9d2" text-anchor="middle" font-weight="700">${initials}</text>
      <foreignObject x="30" y="300" width="340" height="180">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Vazirmatn,Tahoma,sans-serif;color:#f3e9d2;text-align:center;font-size:22px;line-height:1.5;font-weight:700;direction:rtl;">
          ${book.title}
        </div>
      </foreignObject>
      <text x="200" y="520" font-family="Vazirmatn, Tahoma, sans-serif" font-size="16" fill="#f3e9d2" text-anchor="middle" opacity="0.85">${book.author}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
