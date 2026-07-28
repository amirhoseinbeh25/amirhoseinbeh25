import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";

export const metadata: Metadata = {
  title: "روایت من",
  description: "به قلم دکتر آرش رحمانی رضائیه",
};

export default async function MyAccountPage() {
  const content = await getAllContent();
  const { myAccount } = content as {
    myAccount: string[];
  };

  return (
    <>
      <PageHeader
        title="روایت من"
        description="آنچه خودم درباره مسیر علمی و کاری‌ام نوشته‌ام."
      />

      <div className="mx-auto max-w-3xl px-6 py-14">
        {myAccount.length === 0 ? (
          <EmptyState
            title="این متن هنوز نوشته نشده است"
            description="این صفحه باید به قلم خود ایشان نوشته شود؛ جای آن با متن ساختگی پر نشده است."
          />
        ) : (
          <div className="space-y-6 text-lg leading-10">
            {myAccount.map((paragraph, i) => (
              <Reveal key={paragraph} delay={i * 60}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
