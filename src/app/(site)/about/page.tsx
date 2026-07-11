import SectionHeading from "@/components/SectionHeading";
import PaintDrop from "@/components/PaintDrop";
import { getSiteSettings } from "@/lib/repo";

const values = [
  { title: "کیفیت پایدار", desc: "تامین مواد اولیه با استانداردهای ثابت و قابل اتکا.", color: "amber" },
  { title: "مشاوره تخصصی", desc: "راهنمایی فنی برای انتخاب رزین و رنگ متناسب با کاربرد.", color: "coral" },
  { title: "پاسخ‌گویی سریع", desc: "ارتباط مستقیم و سریع با کارشناسان فروش و فنی.", color: "teal" },
  { title: "شبکه تامین گسترده", desc: "همکاری با برندهای معتبر داخلی و خارجی.", color: "indigo" },
];

export default function AboutPage() {
  const site = getSiteSettings();
  return (
    <div>
      <section className="relative overflow-hidden border-b border-paper-soft">
        <PaintDrop color="var(--color-teal)" className="absolute -left-6 top-6 w-20 h-24 opacity-20" />
        <PaintDrop color="var(--color-amber)" className="absolute -right-4 bottom-0 w-24 h-28 opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper-soft px-4 py-1.5 text-xs font-bold text-ink-soft">
            <span className="swatch-dot bg-primary" />
            درباره {site.nameLatin}
          </span>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-ink">
            {site.nameFa} ({site.nameLatin})
          </h1>
          <p className="mt-5 text-ink-soft leading-8">
            {/* TODO: تاریخچه و معرفی کامل شرکت جایگزین شود */}
            {site.shortDescription} این متن، معرفی نمونه‌ای از شرکت است و پس از دریافت اطلاعات
            واقعی، با تاریخچه، مأموریت و دستاوردهای {site.nameLatin} تکمیل خواهد شد.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <SectionHeading eyebrow="ارزش‌های ما" title="چرا کم‌کان؟" align="center" />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-paper-soft bg-paper p-6">
              <span
                className="swatch-dot block mb-4"
                style={{ backgroundColor: `var(--color-${v.color})`, width: "1.75rem", height: "1.75rem" }}
              />
              <h3 className="font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-6">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-soft/40 border-y border-paper-soft">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold text-ink">مسیر رشد {site.nameLatin}</h2>
          <p className="mt-4 text-ink-soft leading-8">
            {/* TODO: تاریخچه واقعی شرکت (سال تاسیس، مراحل رشد، تغییر نام و...) جایگزین شود */}
            بخش تاریخچه و مراحل رشد شرکت پس از دریافت اطلاعات واقعی در این قسمت قرار می‌گیرد.
          </p>
        </div>
      </section>
    </div>
  );
}
