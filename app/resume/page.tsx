import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { courses, education, positions } from "@/lib/site";

export const metadata: Metadata = {
  title: "رزومه",
  description: "تحصیلات، سوابق اجرایی و دروس تدریس‌شده",
};

export default function ResumePage() {
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
            {education.map((item) => (
              <li
                key={`${item.degree}-${item.institution}`}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">
                    {item.degree} {item.field}
                  </h3>
                  <span className="text-sm text-muted">{item.years}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{item.institution}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">سوابق اجرایی و علمی</h2>
          <ul className="mt-6 space-y-4">
            {positions.map((item) => (
              <li
                key={`${item.title}-${item.years}`}
                className="rounded-2xl border border-border bg-surface p-6"
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
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">دروس تدریس‌شده</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {courses.map((item) => (
              <li
                key={`${item.name}-${item.level}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4"
              >
                <span className="font-medium">{item.name}</span>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  {item.level}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
