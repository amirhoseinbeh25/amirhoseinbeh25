import type { NextConfig } from "next";

/**
 * ساخت عادی برای اجرا روی سرور است (server.js).
 *
 * با `NEXT_EXPORT=1 next build` به‌جای آن یک خروجی کاملاً استاتیک در پوشه
 * `out` ساخته می‌شود؛ از آن برای گرفتن پریویو تک‌فایلی استفاده می‌شود.
 * بهینه‌سازی تصویر در حالت استاتیک سرور ندارد، پس خاموش می‌شود.
 */
const isStaticExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? { output: "export", images: { unoptimized: true } }
  : {};

export default nextConfig;
