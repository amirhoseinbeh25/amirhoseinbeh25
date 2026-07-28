import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "یادداشت‌ها",
  description: "یادداشت‌ها و نوشته‌های کوتاه درباره آموزش مهندسی، پژوهش و امور دانشجویی.",
};

export default async function Page() {
  const content = await getAllContent();
  const { notes } = content as {
    notes: import("@/lib/site").Article[];
  };

  return (
    <>
      <PageHeader title="یادداشت‌ها" description="یادداشت‌ها و نوشته‌های کوتاه درباره آموزش مهندسی، پژوهش و امور دانشجویی." />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <ArticleList
          items={notes}
          emptyTitle="هنوز یادداشتی منتشر نشده است"
          emptyDescription="نوشته‌های کوتاه درباره آموزش مهندسی، پژوهش و امور دانشجویی این‌جا قرار می‌گیرد."
        />
      </div>
    </>
  );
}
