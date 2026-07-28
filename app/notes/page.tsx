import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";
import { notes } from "@/lib/site";

export const metadata: Metadata = {
  title: "یادداشت‌ها",
  description: "یادداشت‌ها و نوشته‌های کوتاه درباره آموزش مهندسی، پژوهش و امور دانشجویی.",
};

export default function Page() {
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
