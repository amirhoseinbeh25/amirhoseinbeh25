import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllContent, type ContentKey } from "@/lib/content";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

/** ترتیب و عنوان بخش‌ها در پنل. */
const SECTIONS: { key: ContentKey; label: string }[] = [
  { key: "hero", label: "صفحه اصلی — ویدئو و صحنه" },
  { key: "profile", label: "معرفی و مشخصات" },
  { key: "contact", label: "راه‌های ارتباطی" },
  { key: "scholarlyProfiles", label: "پروفایل‌های علمی" },
  { key: "stats", label: "آمار (مقاله، اختراع…)" },
  { key: "researchInterests", label: "زمینه‌های پژوهشی" },
  { key: "education", label: "تحصیلات" },
  { key: "positions", label: "سوابق اجرایی و علمی" },
  { key: "courses", label: "دروس" },
  { key: "publications", label: "مقالات و کتاب‌ها" },
  { key: "activities", label: "فعالیت‌ها" },
  { key: "lifeTimeline", label: "زندگی من در یک نگاه" },
  { key: "myAccount", label: "روایت من" },
  { key: "testimonials", label: "روایت دیگران" },
  { key: "news", label: "اخبار" },
  { key: "notes", label: "یادداشت‌ها" },
  { key: "interviews", label: "گفت‌وگو" },
  { key: "messages", label: "پیام‌ها" },
  { key: "mediaItems", label: "گالری چندرسانه‌ای" },
];

export default async function ContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const content = await getAllContent();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-7 text-muted">
        هر بخش جدا ذخیره می‌شود. برای نشانی عکس و ویدئو، اول فایل را در بخش
        «فایل‌ها» بارگذاری کنید و نشانی‌اش را این‌جا بگذارید.
      </p>

      {SECTIONS.map((section) => (
        <ContentEditor
          key={section.key}
          contentKey={section.key}
          label={section.label}
          initialValue={content[section.key]}
        />
      ))}
    </div>
  );
}
