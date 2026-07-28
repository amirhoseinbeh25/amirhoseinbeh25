import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";
import { messages } from "@/lib/site";

export const metadata: Metadata = {
  title: "پیام‌ها",
  description: "پیام‌های رسمی به مناسبت‌های دانشگاهی و مناسبت‌های ملی.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="پیام‌ها" description="پیام‌های رسمی به مناسبت‌های دانشگاهی و مناسبت‌های ملی." />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <ArticleList
          items={messages}
          emptyTitle="هنوز پیامی ثبت نشده است"
          emptyDescription="پیام‌های مناسبتی و رسمی این‌جا منتشر می‌شود."
        />
      </div>
    </>
  );
}
