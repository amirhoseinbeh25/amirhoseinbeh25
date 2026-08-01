import "server-only";

import { createHash } from "node:crypto";

/**
 * تشخیص مرورگر، سیستم‌عامل و مدل دستگاه از رشته User-Agent.
 *
 * عمداً بدون کتابخانه نوشته شده: فهرست الگوها کوتاه است و افزودن مورد تازه
 * یعنی یک سطر، در حالی که یک وابستگی تازه چند صد کیلوبایت به سرور اضافه
 * می‌کرد.
 *
 * نکته درباره مدل دستگاه: اندروید مدل واقعی را در User-Agent می‌گذارد
 * (مثلاً «SM-A536E»)، ولی iOS فقط «iPhone» می‌گوید و مدل دقیق را اعلام
 * نمی‌کند. پس برای آیفون‌ها مدل تجاری در دسترس نیست.
 */
export function parseUserAgent(ua: string) {
  const browser = detectBrowser(ua);
  const os = detectOs(ua);
  const deviceType = detectDeviceType(ua);
  const deviceModel = detectDeviceModel(ua, os);
  return { browser, os, deviceType, deviceModel };
}

function detectBrowser(ua: string): string {
  const rules: [RegExp, string][] = [
    [/Edg[A-Z]?\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)|Opera/, "Opera"],
    [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
    [/FxiOS\/([\d.]+)|Firefox\/([\d.]+)/, "Firefox"],
    [/CriOS\/([\d.]+)/, "Chrome"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
    [/Safari\//, "Safari"],
  ];

  for (const [pattern, name] of rules) {
    const match = ua.match(pattern);
    if (match) {
      const version = (match[1] ?? match[2] ?? "").split(".")[0];
      return version ? `${name} ${version}` : name;
    }
  }
  return "نامشخص";
}

function detectOs(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Android ([\d.]+)/.test(ua)) {
    return `Android ${ua.match(/Android ([\d.]+)/)![1].split(".")[0]}`;
  }
  if (/(iPhone|iPad); CPU .*OS ([\d_]+)/.test(ua)) {
    const version = ua.match(/OS ([\d_]+)/)![1].split("_")[0];
    return `iOS ${version}`;
  }
  if (/Mac OS X ([\d_.]+)/.test(ua)) {
    const version = ua.match(/Mac OS X ([\d_.]+)/)![1].replace(/_/g, ".");
    return `macOS ${version.split(".").slice(0, 2).join(".")}`;
  }
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "نامشخص";
}

function detectDeviceType(ua: string): string {
  if (/bot|crawler|spider|crawling|preview/i.test(ua)) return "خزنده";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "تبلت";
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) return "موبایل";
  return "رایانه";
}

function detectDeviceModel(ua: string, os: string): string | null {
  // اندروید: مدل بین شماره نسخه و «Build» یا انتهای بخش پرانتزی می‌آید
  const android = ua.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/|[;)])/);
  if (android) {
    const model = android[1].trim();
    if (model && !/^wv$/i.test(model)) return model;
  }

  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (os.startsWith("macOS")) return "Mac";
  return null;
}

/**
 * نشانی IP واقعی بازدیدکننده.
 *
 * وقتی سایت پشت پراکسی یا CDN است، آدرس اتصال متعلق به پراکسی است و آدرس
 * واقعی در سرآیندها می‌آید. اولین مقدار X-Forwarded-For نزدیک‌ترین به
 * کاربر است.
 */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    null
  );
}

/** آخرین بخش IPv4 و نیمه دوم IPv6 حذف می‌شود. */
export function truncateIp(ip: string): string {
  if (ip.includes(":")) {
    return ip.split(":").slice(0, 4).join(":") + "::";
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return ip;
}

/**
 * شناسه ناشناس بازدیدکننده برای شمردن بازدیدکننده یکتا، بدون کوکی.
 *
 * از IP و User-Agent و یک نمک روزانه ساخته می‌شود، پس هر روز عوض می‌شود و
 * قابل ردیابی در طول زمان نیست.
 */
export function visitorHash(ip: string, ua: string, secret: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}|${ua}|${day}|${secret}`)
    .digest("hex")
    .slice(0, 32);
}

export type GeoResult = {
  country: string | null;
  countryCode: string | null;
  city: string | null;
};

/**
 * سرویس پیش‌فرض تبدیل IP به کشور و شهر.
 *
 * وقتی سایت پشت CDN نباشد، هیچ سرآیندی موقعیت را نمی‌گوید و ستون کشور و شهر
 * همیشه خالی می‌ماند. این سرویس رایگان است و کلید نمی‌خواهد، پس آمار بدون
 * تنظیمات اضافه کار می‌کند.
 *
 * در عوض، نشانی IP بازدیدکننده به یک سرویس بیرونی فرستاده می‌شود. اگر
 * نمی‌خواهید، در فایل `.env` بنویسید `GEO_API_URL=off` — آن‌وقت کشور و شهر
 * ثبت نمی‌شود و بقیه آمار سر جایش می‌ماند.
 */
const DEFAULT_GEO_API = "https://ipwho.is/{ip}";

/**
 * نتیجه هر IP چند ساعت نگه داشته می‌شود.
 *
 * یک بازدیدکننده معمولاً چند صفحه را پشت‌سرهم باز می‌کند و بدون این، برای
 * هر صفحه یک درخواست بیرونی می‌رفت و به سقف رایگان سرویس می‌خوردیم.
 */
const geoCache = new Map<string, { value: GeoResult; expires: number }>();
const GEO_TTL = 6 * 60 * 60 * 1000;
const GEO_CACHE_MAX = 500;

function rememberGeo(ip: string, value: GeoResult) {
  // ساده‌ترین سیاست خروج: پر که شد، قدیمی‌ترین ورودی حذف می‌شود
  if (geoCache.size >= GEO_CACHE_MAX) {
    const oldest = geoCache.keys().next().value;
    if (oldest) geoCache.delete(oldest);
  }
  geoCache.set(ip, { value, expires: Date.now() + GEO_TTL });
}

/**
 * موقعیت جغرافیایی از روی IP.
 *
 * اول سرآیندهای CDN خوانده می‌شود چون رایگان و آنی‌اند و اگر سایت پشت
 * کلادفلر باشد همان‌جا موجودند. اگر نبودند، از سرویس بیرونی پرسیده می‌شود.
 * آن هم جواب نداد، خالی برمی‌گردد — نه اینکه حدس بزند.
 */
export async function lookupGeo(
  ip: string | null,
  headers: Headers,
): Promise<GeoResult> {
  const fromHeaders: GeoResult = {
    country: headers.get("x-vercel-ip-country-name") ?? null,
    countryCode:
      headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? null,
    city:
      decodeHeader(headers.get("x-vercel-ip-city")) ??
      headers.get("cf-ipcity") ??
      null,
  };

  if (fromHeaders.countryCode || fromHeaders.city) {
    return {
      ...fromHeaders,
      country: fromHeaders.country ?? countryName(fromHeaders.countryCode),
      city: cityName(fromHeaders.city),
    };
  }

  const configured = process.env.GEO_API_URL?.trim();
  const endpoint =
    configured === "off" || configured === "" ? null : configured ?? DEFAULT_GEO_API;

  const empty: GeoResult = { country: null, countryCode: null, city: null };
  if (!ip || !endpoint || isPrivateIp(ip)) return empty;

  const cached = geoCache.get(ip);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const response = await fetch(endpoint.replace("{ip}", ip), {
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as Record<string, unknown>;

    const code = pickString(data, ["countryCode", "country_code", "country"]);
    const result: GeoResult = {
      countryCode: code,
      // نام فارسی مقدم است؛ اگر کشور در فهرست نبود، نام انگلیسی خود سرویس
      country:
        persianCountry(code) ??
        pickString(data, ["country_name", "countryName", "country"]) ??
        countryName(code),
      city: cityName(pickString(data, ["city", "cityName"])),
    };

    rememberGeo(ip, result);
    return result;
  } catch {
    // سرویس در دسترس نیست — ثبت بازدید نباید به‌خاطر آن شکست بخورد.
    // نتیجه خالی هم کش می‌شود تا اگر هاست دسترسی بیرونی ندارد، برای هر
    // بازدید ۲.۵ ثانیه منتظر نمانیم.
    rememberGeo(ip, empty);
    return empty;
  }
}

function pickString(
  data: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isPrivateIp(ip: string): boolean {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  IR: "ایران",
  TR: "ترکیه",
  IQ: "عراق",
  AE: "امارات",
  DE: "آلمان",
  US: "آمریکا",
  GB: "بریتانیا",
  CA: "کانادا",
  FR: "فرانسه",
  IT: "ایتالیا",
  NL: "هلند",
  SE: "سوئد",
  RU: "روسیه",
  CN: "چین",
  IN: "هند",
  AZ: "جمهوری آذربایجان",
  AM: "ارمنستان",
  AF: "افغانستان",
  PK: "پاکستان",
  QA: "قطر",
  OM: "عمان",
  MY: "مالزی",
  AU: "استرالیا",
};

export function countryName(code: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

/** فقط وقتی نام فارسی داریم جواب می‌دهد، تا بشود به نام سرویس عقب‌نشینی کرد. */
function persianCountry(code: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? null;
}

/**
 * سرویس‌های موقعیت‌یابی نام شهر را انگلیسی می‌دهند. شهرهای پربازدید این سایت
 * ایرانی‌اند، پس همان‌ها ترجمه می‌شوند و بقیه دست‌نخورده می‌مانند.
 */
const CITY_NAMES: Record<string, string> = {
  urmia: "ارومیه",
  orumiyeh: "ارومیه",
  tehran: "تهران",
  mashhad: "مشهد",
  isfahan: "اصفهان",
  esfahan: "اصفهان",
  tabriz: "تبریز",
  shiraz: "شیراز",
  karaj: "کرج",
  ahvaz: "اهواز",
  qom: "قم",
  kermanshah: "کرمانشاه",
  kerman: "کرمان",
  rasht: "رشت",
  zahedan: "زاهدان",
  hamadan: "همدان",
  yazd: "یزد",
  ardabil: "اردبیل",
  bandarabbas: "بندرعباس",
  arak: "اراک",
  zanjan: "زنجان",
  sanandaj: "سنندج",
  qazvin: "قزوین",
  khoy: "خوی",
  maragheh: "مراغه",
  miandoab: "میاندوآب",
  mahabad: "مهاباد",
  bukan: "بوکان",
  salmas: "سلماس",
  naqadeh: "نقده",
  piranshahr: "پیرانشهر",
  bostanabad: "بستان‌آباد",
  gorgan: "گرگان",
  sari: "ساری",
  babol: "بابل",
  amol: "آمل",
  bojnurd: "بجنورد",
  birjand: "بیرجند",
  ilam: "ایلام",
  yasuj: "یاسوج",
  shahrekord: "شهرکرد",
  khorramabad: "خرم‌آباد",
  dezful: "دزفول",
  abadan: "آبادان",
  bushehr: "بوشهر",
  semnan: "سمنان",
  qeshm: "قشم",
  varamin: "ورامین",
  islamshahr: "اسلام‌شهر",
};

export function cityName(name: string | null): string | null {
  if (!name) return null;
  const key = name.toLowerCase().replace(/[\s'’-]/g, "");
  return CITY_NAMES[key] ?? name;
}
