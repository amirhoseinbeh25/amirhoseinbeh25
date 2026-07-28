import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { ArticleList } from "@/components/ArticleList";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "اخبار",
  description: "خبرهای مربوط به فعالیت‌های علمی، دانشجویی و فرهنگی.",
};

export default async function Page() {
  const content = await getAllContent();
  const { news } = content as {
    news: import("@/lib/site").Article[];
  };

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
