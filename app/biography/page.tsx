import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/scene/Reveal";
import { TiltCard } from "@/components/scene/TiltCard";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "زندگی‌نامه",
  description: "معرفی، مسیر تحصیلی و حرفه‌ای، و روایت‌ها",
};

const chapters = [
  {
    href: "/biography/at-a-glance",
    title: "زندگی من در یک نگاه",
    description: "خط زمانی کوتاهی از تحصیل، تدریس، پژوهش و مسئولیت‌های اجرایی.",
  },
  {
    href: "/biography/my-account",
    title: "روایت من",
    description: "آنچه خودم درباره مسیر علمی و کاری‌ام نوشته‌ام.",
  },
  {
    href: "/biography/others",
    title: "روایت دیگران",
    description: "آنچه همکاران، دانشجویان و دیگران گفته و نوشته‌اند.",
  },
];

export default function BiographyPage() {
  return (
    <>
      <PageHeader
        title="زندگی‌نامه"
        description="معرفی کوتاه، مسیر تحصیلی و حرفه‌ای، و روایت‌هایی از این مسیر."
      />

      <div className="mx-auto max-w-5xl space-y-14 px-6 py-14">
        <section className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal className="self-start">
            <Image
              src={profile.photo}
              alt={`پرتره ${profile.name}`}
              width={460}
              height={672}
              sizes="(min-width: 1024px) 320px, 60vw"
              className="w-full max-w-[320px] rounded-2xl border border-border object-cover"
            />
          </Reveal>

          <Reveal delay={120}>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="mt-2 text-muted">
              {profile.title} — {profile.organization}
            </p>
            <p className="mt-1 text-sm text-muted">{profile.birth}</p>

            <div className="mt-6 space-y-4 leading-9 text-muted">
              {profile.summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </section>

        <section>
          <h2 className="text-2xl font-bold">بخش‌های زندگی‌نامه</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {chapters.map((chapter, i) => (
              <li key={chapter.href}>
                <Reveal delay={i * 90} className="h-full">
                  <TiltCard className="h-full rounded-2xl border border-border bg-surface p-6">
                    <Link href={chapter.href} className="block">
                      <h3 className="font-semibold text-accent">
                        {chapter.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        {chapter.description}
                      </p>
                    </Link>
                  </TiltCard>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
