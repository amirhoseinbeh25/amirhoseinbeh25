import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = getSiteSettings();
  return (
    <>
      <Header nameLatin={site.nameLatin} tagline={site.tagline} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
