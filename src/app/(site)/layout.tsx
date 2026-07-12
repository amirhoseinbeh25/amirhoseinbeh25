import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = getSiteSettings();
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/site-bg.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-0 bg-paper/85" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header nameLatin={site.nameLatin} tagline={site.tagline} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
