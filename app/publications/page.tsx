import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { PageHeader } from "@/components/PageHeader";
import { ScholarlyProfiles } from "@/components/ScholarlyProfiles";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";

export const metadata: Metadata = {
  title: "پژوهش‌ها",
  description: "مقالات، کتاب‌ها و زمینه‌های پژوهشی",
};

export default async function PublicationsPage() {
  const content = await getAllContent();
  const { publications, researchInterests } = content as {
    publications: { title: string; venue: string; year: string; authors: string; href: string }[];
    researchInterests: string[];
  };

  return (
    <>
      <PageHeader
        title="پژوهش‌ها"
        description="فهرست مقالات علمی، کتاب‌ها و زمینه‌های اصلی پژوهشی."
      />

      <div className="mx-auto max-w-5xl space-y-14 px-6 py-14">
        <section>
          <h2 className="text-2xl font-bold">پروفایل‌های علمی</h2>
          <p className="mt-3 leading-8 text-muted">
            فهرست کامل و به‌روز مقالات و شمار ارجاعات در این پروفایل‌ها در دسترس
            است.
          </p>
          <ScholarlyProfiles className="mt-5" />
        </section>

        <section>
          <h2 className="text-2xl font-bold">مقالات و کتاب‌ها</h2>
          {publications.length === 0 && (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-muted">
              هنوز موردی این‌جا ثبت نشده است — فهرست کامل را در گوگل اسکولر
              ببینید.
            </p>
          )}
          <ul className="mt-6 space-y-4">
            {publications.map((item, i) => (
              <li key={`${item.title}-${item.year}`}>
                <Reveal delay={i * 80}>
                  <TiltCard
                    className="rounded-2xl border border-border bg-surface p-6"
                    max={4}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-sm text-muted">{item.year}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{item.authors}</p>
                    <p className="mt-1 text-sm text-muted">{item.venue}</p>
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm text-accent hover:underline"
                      >
                        مشاهده متن کامل
                      </a>
                    )}
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">زمینه‌های پژوهشی</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {researchInterests.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
