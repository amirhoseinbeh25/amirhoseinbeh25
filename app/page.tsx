import Image from "next/image";
import Link from "next/link";
import { ScholarlyProfiles } from "@/components/ScholarlyProfiles";
import { HeroScene } from "@/components/scene/HeroScene";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";
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
        className="scene relative isolate -mt-[var(--header-h)] min-h-[calc(100vh+var(--header-h))] overflow-hidden"
        style={{ background: "var(--hero-bg-1)" }}
      >
        <HeroScene />

        <div className="relative mx-auto flex min-h-[calc(100vh+var(--header-h))] max-w-6xl flex-col items-start gap-8 px-6 pb-28 pt-[calc(var(--header-h)+3rem)] lg:flex-row lg:items-center lg:gap-12">
          {/* روی صفحه باریک پرتره کوچک و بالای متن می‌نشیند، روی صفحه بزرگ
              بزرگ و کنار متن. یک تصویر است، نه دو نسخه. */}
          <div className="relative order-first shrink-0 lg:order-none">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] blur-2xl lg:-inset-4"
              style={{ background: "rgba(111,211,194,0.16)" }}
            />
            <Image
              src={profile.photo}
              alt={`پرتره ${profile.name}`}
              width={460}
              height={672}
              priority
              sizes="(min-width: 1024px) 300px, 132px"
              className="hero-portrait relative w-[108px] rounded-2xl border object-cover sm:w-[132px] lg:w-[300px] lg:rounded-[1.6rem]"
              style={{ borderColor: "var(--hero-line)" }}
            />
          </div>

          <div className="max-w-2xl">
            <p
              className="hero-rise text-xs font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--hero-accent)", animationDelay: "60ms" }}
            >
              {profile.title}
            </p>
            <h1
              className="mt-5 text-[2.6rem] font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ color: "var(--hero-fg)" }}
            >
              {profile.nameLines.map((line, i) => (
                <span key={line} className="hero-line">
                  <span style={{ animationDelay: `${140 + i * 110}ms` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p
              className="hero-rise mt-5 text-xl font-medium sm:text-2xl"
              style={{ color: "var(--hero-accent)", animationDelay: "460ms" }}
            >
              {profile.role}
              <span style={{ color: "var(--hero-muted)" }}>
                {" "}
                — {profile.organization}
              </span>
            </p>
            <p
              className="hero-rise mt-7 max-w-xl text-lg leading-9"
              style={{ color: "var(--hero-muted)", animationDelay: "560ms" }}
            >
              {profile.tagline}
            </p>

            <div className="hero-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "660ms" }}>
              <Link
                href="/resume"
                className="rounded-xl px-6 py-3.5 text-base font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "var(--hero-accent)",
                  color: "var(--hero-bg-1)",
                }}
              >
                مشاهده رزومه
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border px-6 py-3.5 text-base font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--hero-line)",
                  color: "var(--hero-fg)",
                }}
              >
                راه‌های ارتباطی
              </Link>
            </div>

            <div className="hero-rise" style={{ animationDelay: "760ms" }}>
              <ScholarlyProfiles className="mt-10" tone="hero" />
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="anim-nudge absolute inset-x-0 bottom-8 flex justify-center"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
