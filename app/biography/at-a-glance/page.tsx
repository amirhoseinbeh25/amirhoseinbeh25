import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";

export const metadata: Metadata = {
  title: "زندگی من در یک نگاه",
  description: "خط زمانی تحصیل، تدریس، پژوهش و مسئولیت‌های اجرایی",
};

export default async function AtAGlancePage() {
  const content = await getAllContent();
  const { lifeTimeline } = content as {
    lifeTimeline: import("@/lib/site").TimelineEntry[];
  };

  return (
    <>
      <PageHeader
        title="زندگی من در یک نگاه"
        description="خط زمانی کوتاهی از تحصیل، تدریس، پژوهش و مسئولیت‌های اجرایی."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {lifeTimeline.length === 0 ? (
          <EmptyState
            title="خط زمانی هنوز تکمیل نشده است"
            description="سال‌های تحصیل، شروع تدریس، مسئولیت‌های اجرایی و نقاط مهم دیگر این‌جا به‌ترتیب زمان می‌آید."
          />
        ) : (
          <ol className="relative space-y-8 border-e border-border pe-6">
            {lifeTimeline.map((entry, i) => (
              <li key={`${entry.year}-${entry.title}`} className="relative">
                <Reveal delay={i * 80}>
                  <span
                    aria-hidden
                    className="absolute -end-[1.6rem] top-2 size-3 rounded-full border-2 border-background bg-accent"
                  />
                  <p className="text-sm font-bold text-accent">{entry.year}</p>
                  <h2 className="mt-1 text-lg font-semibold">{entry.title}</h2>
                  {entry.description && (
                    <p className="mt-2 leading-8 text-muted">
                      {entry.description}
                    </p>
                  )}
                </Reveal>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
