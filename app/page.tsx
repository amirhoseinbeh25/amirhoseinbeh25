import Link from "next/link";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";
import { UrmiaScene } from "@/components/scene/UrmiaScene";
import {
  activities,
  profile,
  publications,
  researchInterests,
  stats,
} from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* پس‌زمینه تیره روی خود سکشن: وقتی صحنه می‌چرخد، گوشه‌ها نباید
          پس‌زمینه روشن صفحه را لو بدهند. */}
      <section
        className="scene relative isolate -mt-[var(--header-h)] min-h-[calc(88vh+var(--header-h))] overflow-hidden border-b border-border"
        style={{ background: "var(--hero-bg-1)" }}
      >
        <UrmiaScene />

        <div className="relative mx-auto flex min-h-[calc(88vh+var(--header-h))] max-w-5xl items-center px-6 pb-24 pt-[calc(var(--header-h)+3rem)]">
          <div className="max-w-xl">
            <p
              className="text-sm font-semibold tracking-wide"
              style={{ color: "var(--hero-accent)" }}
            >
              {profile.title}
            </p>
            <h1
              className="mt-3 text-4xl font-bold leading-tight sm:text-6xl"
              style={{ color: "var(--hero-fg)" }}
            >
              {profile.name}
            </h1>
            <p className="mt-3 text-lg" style={{ color: "var(--hero-muted)" }}>
              {profile.role} — {profile.organization}
            </p>
            <p
              className="mt-6 text-lg leading-9"
              style={{ color: "var(--hero-muted)" }}
            >
              {profile.tagline}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/resume"
                className="rounded-xl px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "var(--hero-accent)",
                  color: "var(--hero-bg-1)",
                }}
              >
                مشاهده رزومه
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--hero-line)",
                  color: "var(--hero-fg)",
                }}
              >
                راه‌های ارتباطی
              </Link>
            </div>

            <p
              className="mt-12 text-xs leading-6"
              style={{ color: "var(--hero-muted)" }}
            >
              دریاچه ارومیه، پل میانگذر، فلامینگو و بلور نمک — در کنار چرخ‌دنده،
              نشان مهندسی مکانیک.
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="anim-nudge absolute inset-x-0 bottom-6 flex justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="var(--hero-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((item, i) => (
            <Reveal key={item.label} delay={i * 80}>
              <TiltCard className="h-full rounded-2xl border border-border bg-surface p-5">
                <dt className="text-2xl font-bold text-accent">{item.value}</dt>
                <dd className="mt-1 text-sm text-muted">{item.label}</dd>
              </TiltCard>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <h2 className="text-2xl font-bold">درباره من</h2>
            <div className="mt-5 space-y-4 leading-9 text-muted">
              {profile.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="self-start">
            <TiltCard className="rounded-2xl border border-border bg-surface p-6" max={5}>
              <h2 className="text-lg font-bold">زمینه‌های پژوهشی</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {researchInterests.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {publications.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold">آخرین پژوهش‌ها</h2>
            <Link href="/publications" className="text-sm text-accent hover:underline">
              همه پژوهش‌ها
            </Link>
          </div>
          <ul className="mt-6 space-y-3">
            {publications.slice(0, 3).map((item, i) => (
              <li key={`${item.title}-${item.year}`}>
                <Reveal delay={i * 90}>
                  <TiltCard
                    className="rounded-2xl border border-border bg-surface p-5"
                    max={4}
                  >
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted">
                      {item.venue} — {item.year}
                    </p>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activities.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold">فعالیت‌های دانشجویی و فرهنگی</h2>
            <Link href="/activities" className="text-sm text-accent hover:underline">
              همه فعالیت‌ها
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {activities.slice(0, 4).map((item, i) => (
              <li key={`${item.title}-${item.year}`}>
                <Reveal delay={i * 90} className="h-full">
                  <TiltCard className="h-full rounded-2xl border border-border bg-surface p-5">
                    <p className="text-xs text-accent">{item.year}</p>
                    <h3 className="mt-1 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {item.description}
                    </p>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="rounded-2xl border border-border bg-accent-soft p-8 text-center">
          <h2 className="text-xl font-bold">در تماس باشیم</h2>
          <p className="mx-auto mt-3 max-w-xl leading-8 text-muted">
            برای هماهنگی جلسه، همکاری پژوهشی یا پیگیری امور دانشجویی می‌توانید از طریق
            ایمیل یا در ساعات ملاقات حضوری مراجعه کنید.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            راه‌های ارتباطی
          </Link>
        </div>
      </section>
    </>
  );
}
