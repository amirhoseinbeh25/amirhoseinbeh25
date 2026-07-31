import type { MetadataRoute } from "next";
import { menuSections } from "@/lib/site";
import { getSiteUrl } from "@/lib/seo";

/**
 * نقشه سایت از همان فهرست منو ساخته می‌شود، پس هر صفحه‌ای که به منو اضافه
 * شود خودبه‌خود این‌جا هم می‌آید و جا نمی‌ماند.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();

  const routes = new Set<string>(["/"]);
  for (const section of menuSections) {
    for (const item of section.items) routes.add(item.href);
  }

  const now = new Date();

  return [...routes].map((route) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
