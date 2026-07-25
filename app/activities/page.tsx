import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { activities } from "@/lib/site";

export const metadata: Metadata = {
  title: "فعالیت‌ها",
  description: "برنامه‌ها و طرح‌های حوزه دانشجویی و فرهنگی",
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader
        title="فعالیت‌های دانشجویی و فرهنگی"
        description="برنامه‌ها، طرح‌ها و رویدادهای اجراشده در حوزه معاونت دانشجویی و فرهنگی."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {activities.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            هنوز موردی ثبت نشده است.
          </p>
        )}
        <ol className="space-y-4">
          {activities.map((item) => (
            <li
              key={`${item.title}-${item.year}`}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
                  {item.year}
                </span>
              </div>
              <p className="mt-3 leading-8 text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
