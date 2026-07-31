import { headers } from "next/headers";
import { profile } from "@/lib/site";

/**
 * نشانی اصلی سایت.
 *
 * در زمان اجرا خوانده می‌شود، نه هنگام build: اگر متغیر محیطی تنظیم نشده
 * باشد از سرآیند Host خود درخواست به دست می‌آید. به این ترتیب می‌شود اپِ
 * از پیش ساخته‌شده را روی هر دامنه‌ای گذاشت و بدون build دوباره درست کار کند.
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "http://localhost:3000";

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");

  return `${protocol}://${host}`;
}

/**
 * داده ساخت‌یافته Person برای گوگل.
 *
 * باعث می‌شود نتیجه جستجو به‌جای یک لینک ساده، به‌صورت کارت شخص با عنوان،
 * سازمان و پیوندهای علمی نمایش داده شود.
 */
export function personJsonLd(input: {
  siteUrl: string;
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
    url: input.siteUrl,
    ...(input.image ? { image: `${input.siteUrl}${input.image}` } : {}),
    ...(input.email ? { email: `mailto:${input.email}` } : {}),
    worksFor: {
      "@type": "CollegeOrUniversity",
      name: input.worksFor,
    },
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

export const defaultSiteName = `${profile.name} | ${profile.role}`;
