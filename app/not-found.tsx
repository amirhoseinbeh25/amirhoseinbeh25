import type { Metadata } from "next";
import Link from "next/link";
import { UrmiaBand } from "@/components/scene/UrmiaScene";
import { navigation } from "@/lib/site";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
};

export default function NotFound() {
  return (
    <div
      className="scene relative isolate -mt-[var(--header-h)] flex min-h-[calc(80vh+var(--header-h))] items-center overflow-hidden border-b border-border"
      style={{ background: "var(--hero-bg-1)" }}
    >
      <UrmiaBand />

      <div className="relative mx-auto w-full max-w-5xl px-6 pb-16 pt-[calc(var(--header-h)+3rem)]">
        <p
          className="text-6xl font-bold tabular-nums"
          style={{ color: "var(--hero-accent)" }}
        >
          ۴۰۴
        </p>
        <h1
          className="mt-4 text-3xl font-bold sm:text-4xl"
          style={{ color: "var(--hero-fg)" }}
        >
          این صفحه پیدا نشد
        </h1>
        <p
          className="mt-3 max-w-xl leading-8"
          style={{ color: "var(--hero-muted)" }}
        >
          نشانی‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است. از این‌جا
          می‌توانید به بخش‌های دیگر سایت بروید.
        </p>

        <nav className="mt-8 flex flex-wrap gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: "var(--hero-line)",
                color: "var(--hero-fg)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
