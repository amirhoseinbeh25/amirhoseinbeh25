import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteSettings();
  return {
    title: `${site.nameLatin} | ${site.tagline}`,
    description: site.shortDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
