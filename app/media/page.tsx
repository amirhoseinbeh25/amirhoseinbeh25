import type { Metadata } from "next";
import Image from "next/image";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";
import { mediaItems } from "@/lib/site";

export const metadata: Metadata = {
  title: "چندرسانه‌ای",
  description: "تصاویر و ویدئوهای مربوط به فعالیت‌های علمی و دانشجویی",
};

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="چندرسانه‌ای"
        description="تصویر و ویدئو از برنامه‌های علمی، دانشجویی و فرهنگی."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {mediaItems.length === 0 ? (
          <EmptyState
            title="هنوز تصویری بارگذاری نشده است"
            description="عکس‌ها و ویدئوهای برنامه‌ها این‌جا در قالب گالری نمایش داده می‌شوند."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mediaItems.map((item, i) => (
              <li key={item.src}>
                <Reveal delay={i * 70}>
                  <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
                    {item.kind === "image" ? (
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={800}
                        height={600}
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.src}
                        poster={item.poster}
                        controls
                        playsInline
                        className="aspect-[4/3] w-full object-cover"
                      />
                    )}
                    <figcaption className="p-4">
                      <p className="font-medium">{item.title}</p>
                      {item.date && (
                        <p className="mt-1 text-sm text-muted">{item.date}</p>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
