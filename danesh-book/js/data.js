/* دانش بوک — داده‌های نمونه فروشگاه */

const CATEGORIES = [
  { id: "roman", title: "رمان و ادبیات داستانی", icon: "📖" },
  { id: "classic", title: "ادبیات کلاسیک", icon: "🏛️" },
  { id: "psychology", title: "روان‌شناسی و خودشناسی", icon: "🧠" },
  { id: "history", title: "تاریخ و سیاست", icon: "🏺" },
  { id: "business", title: "کسب‌وکار و مدیریت", icon: "💼" },
  { id: "kids", title: "کودک و نوجوان", icon: "🧸" },
  { id: "poetry", title: "شعر و ادبیات", icon: "🌙" },
  { id: "science", title: "علمی و دانشگاهی", icon: "🔬" }
];

const BOOKS = [
  {
    id: 1, title: "ملت عشق", author: "الیف شافاک", translator: "ارسلان فصیحی",
    category: "roman", price: 420000, oldPrice: 520000, badge: "پرفروش",
    rating: 4.8, reviews: 312, publisher: "نشر ققنوس", pages: 480, year: 1401,
    color: "#2f6f5e", stock: 18,
    desc: "رمانی پرفروش که داستان دو زندگی موازی را در قرن سیزدهم و قرن بیست‌ویکم روایت می‌کند و به عشق، عرفان و شناخت می‌پردازد."
  },
  {
    id: 2, title: "کیمیاگر", author: "پائولو کوئیلو", translator: "آرش حجازی",
    category: "roman", price: 185000, oldPrice: 230000, badge: "تخفیف",
    rating: 4.6, reviews: 540, publisher: "نشر کاروان", pages: 192, year: 1400,
    color: "#b3792c", stock: 25,
    desc: "داستان چوپانی اسپانیایی که برای یافتن گنجی افسانه‌ای سفر می‌کند و در این راه معنای زندگی را کشف می‌کند."
  },
  {
    id: 3, title: "بوف کور", author: "صادق هدایت", translator: null,
    category: "classic", price: 150000, oldPrice: null, badge: "کلاسیک",
    rating: 4.5, reviews: 210, publisher: "نشر چشمه", pages: 136, year: 1399,
    color: "#3a3a52", stock: 30,
    desc: "یکی از تأثیرگذارترین آثار ادبیات فارسی معاصر، روایتی سوررئال از تنهایی و مرگ‌اندیشی."
  },
  {
    id: 4, title: "جنایت و مکافات", author: "فئودور داستایفسکی", translator: "مهری آهی",
    category: "classic", price: 480000, oldPrice: 560000, badge: "پرفروش",
    rating: 4.9, reviews: 410, publisher: "نشر خوارزمی", pages: 912, year: 1401,
    color: "#5a2a2a", stock: 12,
    desc: "رمانی روان‌شناختی درباره گناه، کیفر و رستگاری که یکی از برجسته‌ترین آثار ادبیات روسیه است."
  },
  {
    id: 5, title: "اتوبیوگرافی یک یوگی", author: "پاراماهانسا یوگاناندا", translator: "مانی جمشیدی",
    category: "psychology", price: 260000, oldPrice: null, badge: "جدید",
    rating: 4.7, reviews: 98, publisher: "نشر دایره", pages: 420, year: 1402,
    color: "#1f5d50", stock: 20,
    desc: "روایتی معنوی از زندگی یک استاد یوگای هندی و تجربه‌های عرفانی او در شرق و غرب."
  },
  {
    id: 6, title: "اثر مرکب", author: "دارن هاردی", translator: "مینا اعظامی",
    category: "business", price: 198000, oldPrice: 240000, badge: "تخفیف",
    rating: 4.4, reviews: 275, publisher: "نشر نسل نواندیش", pages: 220, year: 1400,
    color: "#8a6d1f", stock: 40,
    desc: "راهکارهایی ساده برای رسیدن به موفقیت بزرگ از طریق تصمیم‌های کوچک و پیوسته."
  },
  {
    id: 7, title: "پدر پولدار، پدر فقیر", author: "رابرت کیوساکی", translator: "محمدرضا آل‌یاسین",
    category: "business", price: 175000, oldPrice: null, badge: null,
    rating: 4.5, reviews: 630, publisher: "نشر آتیسا", pages: 260, year: 1399,
    color: "#2c5f8a", stock: 35,
    desc: "درس‌هایی درباره آموزش مالی که والدین معمولی هرگز به فرزندان خود نمی‌دهند."
  },
  {
    id: 8, title: "شازده کوچولو", author: "آنتوان دو سنت‌اگزوپری", translator: "محمد قاضی",
    category: "kids", price: 95000, oldPrice: 120000, badge: "پرفروش",
    rating: 4.9, reviews: 820, publisher: "نشر نیلوفر", pages: 96, year: 1402,
    color: "#d4a24c", stock: 50,
    desc: "داستانی لطیف و فیلسوفانه برای همه سنین دربارهٔ دوستی، عشق و از دست دادن."
  },
  {
    id: 9, title: "مزرعه حیوانات", author: "جورج اورول", translator: "صالح حسینی",
    category: "classic", price: 140000, oldPrice: null, badge: null,
    rating: 4.6, reviews: 390, publisher: "نشر نیلوفر", pages: 152, year: 1400,
    color: "#4a4a2e", stock: 22,
    desc: "تمثیلی سیاسی و طعنه‌آمیز از انقلاب و قدرت که در قالب داستان حیوانات یک مزرعه روایت می‌شود."
  },
  {
    id: 10, title: "تاریخ ایران باستان", author: "حسن پیرنیا", translator: null,
    category: "history", price: 320000, oldPrice: null, badge: "جدید",
    rating: 4.3, reviews: 64, publisher: "نشر نگاه", pages: 760, year: 1402,
    color: "#7a3b2e", stock: 15,
    desc: "بررسی دقیق و مستند تاریخ ایران از دوران هخامنشیان تا پایان ساسانیان."
  },
  {
    id: 11, title: "دیوان حافظ", author: "خواجه شمس‌الدین حافظ", translator: null,
    category: "poetry", price: 280000, oldPrice: 340000, badge: "تخفیف",
    rating: 4.9, reviews: 455, publisher: "نشر اساطیر", pages: 640, year: 1401,
    color: "#3d2b56", stock: 28,
    desc: "مجموعه کامل غزلیات حافظ شیرازی همراه با شرح لغات و تصحیح معتبر."
  },
  {
    id: 12, title: "هوموساپینس", author: "یوال نوح هراری", translator: "نیک گرگین",
    category: "science", price: 390000, oldPrice: 450000, badge: "پرفروش",
    rating: 4.8, reviews: 702, publisher: "نشر فرهنگ نشر نو", pages: 528, year: 1401,
    color: "#1d4d4d", stock: 19,
    desc: "روایتی خواندنی از تاریخ تطور انسان، از عصر حجر تا انقلاب فناوری اطلاعات."
  },
  {
    id: 13, title: "صد سال تنهایی", author: "گابریل گارسیا مارکز", translator: "بهمن فرزانه",
    category: "roman", price: 345000, oldPrice: null, badge: "کلاسیک",
    rating: 4.7, reviews: 380, publisher: "نشر امیرکبیر", pages: 432, year: 1400,
    color: "#6b4226", stock: 16,
    desc: "شاهکار رئالیسم جادویی که سرگذشت هفت نسل از خانواده بوئندیا را روایت می‌کند."
  },
  {
    id: 14, title: "قدرت عادت", author: "چارلز داهیگ", translator: "پرویز ترکان",
    category: "psychology", price: 210000, oldPrice: 255000, badge: "تخفیف",
    rating: 4.5, reviews: 266, publisher: "نشر میلکان", pages: 350, year: 1401,
    color: "#2e6b6b", stock: 33,
    desc: "چرا عادت می‌کنیم و چگونه می‌توانیم عادت‌های خود را در زندگی و کسب‌وکار تغییر دهیم."
  },
  {
    id: 15, title: "مارمولک", author: "هوشنگ مرادی کرمانی", translator: null,
    category: "kids", price: 88000, oldPrice: null, badge: "جدید",
    rating: 4.4, reviews: 54, publisher: "نشر معین", pages: 160, year: 1402,
    color: "#a85c32", stock: 24,
    desc: "مجموعه داستان‌های کوتاه و دلنشین برای نوجوانان از نویسنده محبوب ادبیات کودک ایران."
  },
  {
    id: 16, title: "غرور و تعصب", author: "جین آستین", translator: "رضا رضایی",
    category: "classic", price: 230000, oldPrice: 270000, badge: "تخفیف",
    rating: 4.7, reviews: 300, publisher: "نشر نی", pages: 424, year: 1400,
    color: "#843e5c", stock: 21,
    desc: "رمانی کلاسیک و پرطرفدار درباره عشق، طبقه اجتماعی و پیش‌داوری در انگلستان قرن نوزدهم."
  }
];

function getBookById(id) {
  return BOOKS.find(b => String(b.id) === String(id));
}

function getCategoryTitle(catId) {
  const c = CATEGORIES.find(c => c.id === catId);
  return c ? c.title : catId;
}

function formatPrice(n) {
  return n.toLocaleString("fa-IR") + " تومان";
}

/* تولید جلد کتاب به صورت SVG بدون نیاز به تصویر خارجی */
function bookCoverDataUrl(book) {
  const initials = book.title.trim().split(" ").slice(0, 2).map(w => w[0]).join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${book.color}"/>
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
