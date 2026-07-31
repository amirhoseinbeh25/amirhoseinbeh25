import type { NextConfig } from "next";

/**
 * ساخت عادی برای اجرا روی سرور است (server.js).
 *
 * با `NEXT_EXPORT=1 next build` به‌جای آن یک خروجی کاملاً استاتیک در پوشه
 * `out` ساخته می‌شود؛ از آن برای گرفتن پریویو تک‌فایلی استفاده می‌شود.
 * بهینه‌سازی تصویر در حالت استاتیک سرور ندارد، پس خاموش می‌شود.
 */
const isStaticExport = process.env.NEXT_EXPORT === "1";

/**
 * وقتی سایت پشت یک پراکسی یا CDN باشد، ممکن است دامنه‌ای که مرورگر می‌بیند
 * با آنچه به سرور می‌رسد یکی نباشد؛ در آن حالت Next فرم‌های پنل مدیریت را
 * با پیام «Invalid Server Actions request» رد می‌کند. اگر چنین شد، دامنه را
 * در ALLOWED_ORIGINS بگذارید (چند دامنه با کاما).
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = isStaticExport
  ? { output: "export", images: { unoptimized: true } }
  : allowedOrigins?.length
    ? { experimental: { serverActions: { allowedOrigins } } }
    : {};

export default nextConfig;
