import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";

export const metadata: Metadata = {
  title: "رزومه",
  description: "تحصیلات، سوابق اجرایی و دروس تدریس‌شده",
};

export default async function ResumePage() {
  const content = await getAllContent();
  const { education, positions, courses } = content as {
    education: { degree: string; field: string; institution: string; years: string }[];
    positions: { title: string; organization: string; years: string; details: string[] }[];
    courses: { name: string; level: string }[];
  };

  return (
    <>
      <PageHeader
        title="رزومه"
        description="خلاصه‌ای از تحصیلات، سوابق اجرایی و دروس تدریس‌شده."
      />

      <div className="mx-auto max-w-5xl space-y-14 px-6 py-14">
        <section>
          <h2 className="text-2xl font-bold">تحصیلات</h2>
          <ul className="mt-6 space-y-4">
            {education.map((item, i) => (
              <li key={`${item.degree}-${item.institution}`}>
                <Reveal delay={i * 80}>
                  <TiltCard
                    className="rounded-2xl border border-border bg-surface p-6"
                    max={4}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">
                        {item.degree} {item.field}
                      </h3>
                      <span className="text-sm text-muted">{item.years}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{item.institution}</p>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">سوابق اجرایی و علمی</h2>
          <ul className="mt-6 space-y-4">
            {positions.map((item, i) => (
              <li key={`${item.title}-${item.years}`}>
                <Reveal delay={i * 80}>
                <TiltCard
                  className="rounded-2xl border border-border bg-surface p-6"
                  max={4}
                >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="text-sm text-muted">{item.years}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{item.organization}</p>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
                  {item.details.map((detail) => (
                    <li key={detail} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-3 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">دروس تدریس‌شده</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {courses.map((item, i) => (
              <li key={`${item.name}-${item.level}`}>
                <Reveal delay={i * 70}>
                  <TiltCard
                    className="rounded-xl border border-border bg-surface px-5 py-4"
                    max={5}
                  >
                    {/* چیدمان افقی باید داخل TiltCard باشد، چون خود کارت
                        فقط یک فرزند (لایه شناور) دارد. */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{item.name}</span>
                      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                        {item.level}
                      </span>
                    </div>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
