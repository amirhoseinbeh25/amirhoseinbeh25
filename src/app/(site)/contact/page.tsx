import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/repo";

export const metadata = { title: "تماس با ما | Kemkan" };

export default function ContactPage() {
  const site = getSiteSettings();
  const infoRows = [
    { label: "آدرس", value: site.address },
    { label: "تلفن", value: [site.phone1, site.phone2].filter(Boolean).join(" - ") },
    { label: "ایمیل", value: site.email },
    { label: "ساعات کاری", value: site.workHours },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="ارتباط با ما"
        title="تماس با کم‌کان"
        description="سوالات، درخواست همکاری یا استعلام قیمت خود را برای ما ارسال کنید."
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-8 items-start">
        <ContactForm email={site.email} />

        <div className="space-y-4">
          {infoRows.map((row) => (
            <div key={row.label} className="card-glow rounded-2xl border border-paper-soft bg-paper p-5">
              <p className="text-xs font-bold text-ink-soft">{row.label}</p>
              <p className="mt-1 font-semibold text-ink">{row.value || "به‌زودی تکمیل می‌شود"}</p>
            </div>
          ))}

          {site.mapEmbedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-paper-soft">
              <iframe
                src={site.mapEmbedUrl}
                title="نقشه موقعیت"
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-paper-soft bg-paper-soft/40 text-sm text-ink-soft">
              <span className="absolute inset-0 bg-dot-grid text-ink opacity-[0.06]" />
              <span className="relative">نقشه موقعیت — به‌زودی</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
