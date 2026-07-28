import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";
import { news } from "@/lib/site";

export const metadata: Metadata = {
  title: "اخبار",
  description: "خبرهای مربوط به فعالیت‌های علمی، دانشجویی و فرهنگی.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="اخبار" description="خبرهای مربوط به فعالیت‌های علمی، دانشجویی و فرهنگی." />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <ArticleList
          items={news}
          emptyTitle="هنوز خبری ثبت نشده است"
          emptyDescription="خبرهای دانشگاه و حوزه معاونت دانشجویی و فرهنگی این‌جا منتشر می‌شود."
        />
      </div>
    </>
  );
}
