import { EmptyState } from "@/components/EmptyState";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";
import type { Article } from "@/lib/site";

/**
 * فهرست مشترک اخبار، یادداشت‌ها، گفت‌وگوها و پیام‌ها. ساختار این چهار صفحه
 * یکی است و تفاوتشان فقط در داده و عنوان است.
 */
export function ArticleList({
  items,
  emptyTitle,
  emptyDescription,
}: {
  items: Article[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={`${item.title}-${item.date}`}>
          <Reveal delay={i * 80}>
            <TiltCard
              className="rounded-2xl border border-border bg-surface p-6"
              max={4}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <span className="text-sm text-muted">{item.date}</span>
              </div>

              {item.summary && (
                <p className="mt-3 leading-8 text-muted">{item.summary}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {item.source && (
                  <span className="text-muted">منبع: {item.source}</span>
                )}
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    مشاهده کامل
                  </a>
                )}
              </div>
            </TiltCard>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
