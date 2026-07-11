import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";

export const metadata = { title: "تماس با ما | Kemkan" };

const infoRows = [
  { label: "آدرس", value: site.address },
  { label: "تلفن", value: site.phones.filter(Boolean).join(" - ") },
  { label: "ایمیل", value: site.email },
  { label: "ساعات کاری", value: site.workHours },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="ارتباط با ما"
        title="تماس با کم‌کان"
        description="سوالات، درخواست همکاری یا استعلام قیمت خود را برای ما ارسال کنید."
      />

      <div className="mt-10 grid lg:grid-cols-2 gap-8 items-start">
        <ContactForm />

        <div className="space-y-4">
          {infoRows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-paper-soft bg-paper p-5">
              <p className="text-xs font-bold text-ink-soft">{row.label}</p>
              <p className="mt-1 font-semibold text-ink">{row.value || "به‌زودی تکمیل می‌شود"}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-paper-soft bg-paper-soft/40 h-56 flex items-center justify-center text-sm text-ink-soft">
            نقشه موقعیت — به‌زودی
          </div>
        </div>
      </div>
    </div>
  );
}
