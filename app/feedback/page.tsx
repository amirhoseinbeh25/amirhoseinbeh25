import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "حرف شما",
  description: "پیشنهاد، انتقاد و درخواست دانشجویان",
};

const topics = [
  "امور رفاهی، خوابگاه و تغذیه",
  "تشکل‌ها، انجمن‌های علمی و کانون‌های فرهنگی",
  "مشاوره و سلامت روان",
  "پیشنهاد همکاری علمی و پژوهشی",
];

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        title="حرف شما"
        description="پیشنهاد، انتقاد و درخواست‌های خود را مطرح کنید."
      />

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-14">
        <Reveal>
          <p className="text-lg leading-9">
            دانشجویان، همکاران و مراجعان می‌توانند پیشنهاد، انتقاد یا درخواست
            خود را مطرح کنند. موضوع‌هایی که بیشتر مطرح می‌شوند:
          </p>
          <ul className="mt-5 space-y-3 leading-8 text-muted">
            {topics.map((topic) => (
              <li key={topic} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-3 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/*
          سایت استاتیک است و سروری برای دریافت فرم ندارد، پس به‌جای فرمی که
          دکمه‌اش کاری نمی‌کند، پیام مستقیم به ایمیل فرستاده می‌شود.
        */}
        <Reveal delay={120}>
          <div className="rounded-2xl border border-border bg-accent-soft p-8 text-center">
            <h2 className="text-xl font-bold">ارسال پیام</h2>
            <p className="mx-auto mt-3 max-w-md leading-8 text-muted">
              پیام شما مستقیم به ایمیل ارسال می‌شود. لطفاً موضوع و نام خود را در
              متن بنویسید.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}?subject=${encodeURIComponent("حرف شما")}`}
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  نوشتن ایمیل
                </a>
              )}
              <Link
                href="/contact"
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                سایر راه‌های ارتباطی
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
