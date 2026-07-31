import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { contact, profile, scholarlyProfiles } from "@/lib/site";
import { getSiteUrl, personJsonLd } from "@/lib/seo";
import { Analytics } from "@/components/Analytics";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

const description = `${profile.title} ${profile.organization}. ${profile.tagline}`;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getSiteUrl();

  return {
    // بدون این، نشانی‌های نسبی در متادیتای اشتراک‌گذاری مطلق نمی‌شوند
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} | ${profile.role}`,
      template: `%s | ${profile.name}`,
    },
    description,
    keywords: [
      profile.name,
      "آرش رحمانی",
      "دانشگاه صنعتی ارومیه",
      "مهندسی مکانیک",
      "رباتیک",
      "هوش مصنوعی",
      "معاون دانشجویی و فرهنگی",
      "ارومیه",
    ],
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      locale: "fa_IR",
      siteName: profile.name,
      title: `${profile.name} | ${profile.role}`,
      description,
      url: siteUrl,
      images: [
        {
          url: profile.photo,
          width: 460,
          height: 672,
          alt: `پرتره ${profile.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} | ${profile.role}`,
      description,
      images: [profile.photo],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = await getSiteUrl();
  const jsonLd = personJsonLd({
    siteUrl,
    name: profile.name,
    jobTitle: `${profile.title} — ${profile.role}`,
    worksFor: profile.organization,
    description: profile.tagline,
    image: profile.photo,
    email: contact.email || undefined,
    sameAs: scholarlyProfiles.map((item) => item.href),
  });

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />

        <script
          type="application/ld+json"
          // داده ساخت‌یافته باید خام در صفحه بنشیند تا خزنده آن را بخواند
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
