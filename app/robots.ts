import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

// نشانی در زمان اجرا خوانده می‌شود، پس تغییر دامنه build دوباره نمی‌خواهد
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // پنل مدیریت و مسیرهای داخلی نباید ایندکس شوند
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
