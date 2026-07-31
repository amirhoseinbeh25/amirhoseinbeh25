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

/**
 * خروجی standalone فقط فایل‌هایی را که سرور واقعاً لازم دارد کنار هم
 * می‌گذارد. بدون آن، نصب روی هاست نزدیک یک گیگابایت و ۲۳ هزار فایل
 * می‌شود — چون کامپایلر Next و ابزارهای Prisma هم می‌آیند — و سهمیه هاست
 * اشتراکی را پر می‌کند. با این حالت، روی سرور نه نصب لازم است نه build.
 */
const nextConfig: NextConfig = isStaticExport
  ? { output: "export", images: { unoptimized: true } }
  : {
      output: "standalone",
      /**
       * بهینه‌سازی تصویر به sharp نیاز دارد که یک ماژول کامپایل‌شده است و
       * روی سرورهایی با glibc قدیمی بارگذاری نمی‌شود — همان مشکلی که
       * پایگاه داده داشت. تصاویر این سایت کوچک‌اند و از دست‌دادن بهینه‌سازی
       * در برابر «هیچ باینری بومی در بسته نباشد» ارزشش را دارد.
       */
      images: { unoptimized: true },
      // راه‌انداز از سرور بیرونِ Next صدا زده می‌شود، پس ردیابی خودکار
      // آن را نمی‌بیند.
      outputFileTracingIncludes: {
        "/**": ["./lib/bootstrap.cjs"],
      },
      ...(allowedOrigins?.length
        ? { experimental: { serverActions: { allowedOrigins } } }
        : {}),
    };

export default nextConfig;
