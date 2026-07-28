import { profile } from "@/lib/site";

/**
 * نشانی اصلی سایت. متادیتای اشتراک‌گذاری و نقشه سایت به نشانی مطلق نیاز
 * دارند، پس این مقدار باید در سرور تنظیم شود.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = `${profile.name} | ${profile.role}`;

/**
 * داده ساخت‌یافته Person برای گوگل.
 *
 * باعث می‌شود نتیجه جستجو به‌جای یک لینک ساده، به‌صورت کارت شخص با عنوان،
 * سازمان و پیوندهای علمی نمایش داده شود.
 */
export function personJsonLd(input: {
  name: string;
  jobTitle: string;
  worksFor: string;
  description: string;
  image?: string;
  email?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    description: input.description,
    url: siteUrl,
    ...(input.image ? { image: `${siteUrl}${input.image}` } : {}),
    ...(input.email ? { email: `mailto:${input.email}` } : {}),
    worksFor: {
      "@type": "CollegeOrUniversity",
      name: input.worksFor,
    },
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}
