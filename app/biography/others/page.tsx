import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";
import { testimonials } from "@/lib/site";

export const metadata: Metadata = {
  title: "روایت دیگران",
  description: "آنچه همکاران، دانشجویان و دیگران گفته و نوشته‌اند",
};

export default function OthersPage() {
  return (
    <>
      <PageHeader
        title="روایت دیگران"
        description="آنچه همکاران، دانشجویان و دیگران درباره ایشان گفته و نوشته‌اند."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        {testimonials.length === 0 ? (
          <EmptyState
            title="هنوز روایتی ثبت نشده است"
            description="نقل‌قول‌ها فقط وقتی اضافه می‌شوند که گوینده و منبعشان مشخص باشد."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((item, i) => (
              <li key={`${item.author}-${item.quote.slice(0, 24)}`}>
                <Reveal delay={i * 90} className="h-full">
                  <TiltCard className="h-full rounded-2xl border border-border bg-surface p-6">
                    <blockquote className="leading-9">
                      «{item.quote}»
                    </blockquote>
                    <footer className="mt-4 text-sm">
                      <span className="font-semibold">{item.author}</span>
                      {item.role && (
                        <span className="text-muted"> — {item.role}</span>
                      )}
                      {item.source && (
                        <span className="mt-1 block text-muted">
                          منبع: {item.source}
                        </span>
                      )}
                    </footer>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
