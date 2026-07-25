import Link from "next/link";
import {
  activities,
  contact,
  profile,
  publications,
  researchInterests,
  stats,
} from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-sm font-semibold text-accent">{profile.title}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-lg text-muted">
            {profile.role} — {profile.organization}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-9">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/resume"
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              مشاهده رزومه
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              راه‌های ارتباطی
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <dt className="text-2xl font-bold text-accent">{item.value}</dt>
              <dd className="mt-1 text-sm text-muted">{item.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold">درباره من</h2>
            <div className="mt-5 space-y-4 leading-9 text-muted">
              {profile.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold">زمینه‌های پژوهشی</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {researchInterests.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">آخرین پژوهش‌ها</h2>
          <Link href="/publications" className="text-sm text-accent hover:underline">
            همه پژوهش‌ها
          </Link>
        </div>
        <ul className="mt-6 space-y-3">
          {publications.slice(0, 3).map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">
                {item.venue} — {item.year}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">فعالیت‌های دانشجویی و فرهنگی</h2>
          <Link href="/activities" className="text-sm text-accent hover:underline">
            همه فعالیت‌ها
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {activities.slice(0, 4).map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <p className="text-xs text-accent">{item.year}</p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="rounded-2xl border border-border bg-accent-soft p-8 text-center">
          <h2 className="text-xl font-bold">در تماس باشیم</h2>
          <p className="mx-auto mt-3 max-w-xl leading-8 text-muted">
            برای هماهنگی جلسه، همکاری پژوهشی یا پیگیری امور دانشجویی می‌توانید از طریق
            ایمیل یا در ساعات ملاقات حضوری مراجعه کنید.
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            ارسال ایمیل
          </a>
        </div>
      </section>
    </>
  );
}
