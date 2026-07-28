import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";
import { interviews } from "@/lib/site";

export const metadata: Metadata = {
  title: "گفت‌وگو",
  description: "مصاحبه‌ها و گفت‌وگوهای منتشرشده.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="گفت‌وگو" description="مصاحبه‌ها و گفت‌وگوهای منتشرشده." />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <ArticleList
          items={interviews}
          emptyTitle="هنوز گفت‌وگویی ثبت نشده است"
          emptyDescription="مصاحبه‌های منتشرشده در رسانه‌ها این‌جا فهرست می‌شود."
        />
      </div>
    </>
  );
}
