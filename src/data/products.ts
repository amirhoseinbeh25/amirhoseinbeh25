// دسته‌بندی و محصولات نمونه — بعداً با اطلاعات واقعی جایگزین شود.

export type Category = {
  slug: string;
  title: string;
  description: string;
  color: string; // یکی از رنگ‌های پالت برند
};

export const categories: Category[] = [
  {
    slug: "epoxy-resin",
    title: "رزین اپوکسی",
    description: "رزین و هاردنر اپوکسی برای پوشش، کفپوش و کامپوزیت",
    color: "amber",
  },
  {
    slug: "polyester-resin",
    title: "رزین پلی‌استر",
    description: "رزین پلی‌استر غیراشباع برای قالب‌گیری و کامپوزیت",
    color: "coral",
  },
  {
    slug: "polyurethane",
    title: "رزین پلی‌یورتان",
    description: "سیستم‌های پلی‌یورتان برای پوشش و آب‌بندی",
    color: "indigo",
  },
  {
    slug: "hardener-catalyst",
    title: "هاردنر و کاتالیست",
    description: "سخت‌کننده و کاتالیست متناسب با انواع رزین",
    color: "teal",
  },
  {
    slug: "industrial-paint",
    title: "رنگ‌های صنعتی",
    description: "پوشش‌های صنعتی مقاوم در برابر خوردگی و سایش",
    color: "olive",
  },
  {
    slug: "architectural-paint",
    title: "رنگ‌های ساختمانی",
    description: "رنگ داخلی و نمای ساختمان با کیفیت بالا",
    color: "coral",
  },
  {
    slug: "additives",
    title: "افزودنی‌ها",
    description: "افزودنی‌های بهبود‌دهنده فرآیند و کیفیت",
    color: "indigo",
  },
  {
    slug: "solvents",
    title: "حلال‌ها",
    description: "حلال‌های صنعتی برای رقیق‌سازی و شست‌وشو",
    color: "teal",
  },
];

export type Product = {
  slug: string;
  title: string;
  category: string; // category slug
  brand: string;
  summary: string;
  specs: { label: string; value: string }[];
};

export const products: Product[] = [
  {
    slug: "epoxy-resin-lv50",
    title: "رزین اپوکسی رقیق LV50",
    category: "epoxy-resin",
    brand: "—",
    summary: "رزین اپوکسی با ویسکوزیته پایین، مناسب کفپوش و کامپوزیت.",
    specs: [
      { label: "ویسکوزیته", value: "—" },
      { label: "زمان ژل", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "epoxy-hardener-ha11",
    title: "هاردنر اپوکسی HA11",
    category: "hardener-catalyst",
    brand: "—",
    summary: "هاردنر آمینی برای سیستم‌های اپوکسی عمومی.",
    specs: [
      { label: "نسبت اختلاط", value: "—" },
      { label: "زمان کارکرد", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "polyester-resin-general",
    title: "رزین پلی‌استر عمومی",
    category: "polyester-resin",
    brand: "—",
    summary: "رزین پلی‌استر غیراشباع برای قالب‌گیری دستی و کامپوزیت.",
    specs: [
      { label: "ویسکوزیته", value: "—" },
      { label: "زمان ژل", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "polyurethane-coating-pu200",
    title: "پوشش پلی‌یورتان PU200",
    category: "polyurethane",
    brand: "—",
    summary: "پوشش دو جزئی پلی‌یورتان با مقاومت شیمیایی بالا.",
    specs: [
      { label: "نوع", value: "دو جزئی" },
      { label: "براقیت", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "industrial-paint-anticorrosive",
    title: "رنگ صنعتی ضد خوردگی",
    category: "industrial-paint",
    brand: "—",
    summary: "پوشش محافظ فلزات در برابر زنگ‌زدگی و خوردگی.",
    specs: [
      { label: "پایه", value: "—" },
      { label: "رنگ", value: "—" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "architectural-paint-interior",
    title: "رنگ پلاستیک داخلی",
    category: "architectural-paint",
    brand: "—",
    summary: "رنگ ساختمانی داخلی، شست‌شوپذیر و کم‌بو.",
    specs: [
      { label: "پوشش‌دهی", value: "—" },
      { label: "درجه براقیت", value: "مات" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "additive-defoamer",
    title: "افزودنی ضد کف",
    category: "additives",
    brand: "—",
    summary: "افزودنی کاهش‌دهنده کف در فرمولاسیون رنگ و رزین.",
    specs: [
      { label: "دوز مصرف", value: "—" },
      { label: "حالت", value: "مایع" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
  {
    slug: "solvent-xylene",
    title: "زایلین صنعتی",
    category: "solvents",
    brand: "—",
    summary: "حلال آروماتیک برای رقیق‌سازی رنگ و رزین.",
    specs: [
      { label: "درجه خلوص", value: "—" },
      { label: "کاربرد", value: "رقیق‌کننده" },
      { label: "بسته‌بندی", value: "—" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}
