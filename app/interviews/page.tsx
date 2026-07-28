import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "گفت‌وگو",
  description: "مصاحبه‌ها و گفت‌وگوهای منتشرشده.",
};

export default async function Page() {
  const content = await getAllContent();
  const { interviews } = content as {
    interviews: import("@/lib/site").Article[];
  };

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
