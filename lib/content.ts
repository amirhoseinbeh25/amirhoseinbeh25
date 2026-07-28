import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import * as defaults from "@/lib/site";

/**
 * محتوای سایت از پایگاه داده خوانده می‌شود و اگر بخشی هنوز ذخیره نشده باشد،
 * مقدار پیش‌فرض همان بخش از `lib/site.ts` برمی‌گردد.
 *
 * یعنی سایت بدون پایگاه داده هم کار می‌کند (خروجی استاتیک و نسخه آفلاین از
 * همین پیش‌فرض‌ها می‌سازند) و پنل مدیریت فقط روی آن می‌نویسد.
 */

export const CONTENT_KEYS = {
  profile: "profile",
  contact: "contact",
  scholarlyProfiles: "scholarlyProfiles",
  stats: "stats",
  education: "education",
  positions: "positions",
  courses: "courses",
  publications: "publications",
  activities: "activities",
  researchInterests: "researchInterests",
  lifeTimeline: "lifeTimeline",
  myAccount: "myAccount",
  testimonials: "testimonials",
  news: "news",
  notes: "notes",
  interviews: "interviews",
  messages: "messages",
  mediaItems: "mediaItems",
  hero: "hero",
} as const;

export type ContentKey = keyof typeof CONTENT_KEYS;

/** تنظیمات هیرو در `lib/site.ts` نیست چون تا امروز در کد ثابت بوده. */
export type HeroSettings = {
  videoWebm: string;
  videoMp4: string;
  poster: string;
  /** لایه سه‌بعدی روی ویدئو */
  showScene: boolean;
  sceneOpacity: number;
};

const HERO_DEFAULTS: HeroSettings = {
  videoWebm: "/video/urmia-bridge.webm",
  videoMp4: "/video/urmia-bridge.mp4",
  poster: "/video/urmia-bridge-poster.jpg",
  showScene: true,
  sceneOpacity: 0.45,
};

const DEFAULTS: Record<ContentKey, unknown> = {
  profile: defaults.profile,
  contact: defaults.contact,
  scholarlyProfiles: defaults.scholarlyProfiles,
  stats: defaults.stats,
  education: defaults.education,
  positions: defaults.positions,
  courses: defaults.courses,
  publications: defaults.publications,
  activities: defaults.activities,
  researchInterests: defaults.researchInterests,
  lifeTimeline: defaults.lifeTimeline,
  myAccount: defaults.myAccount,
  testimonials: defaults.testimonials,
  news: defaults.news,
  notes: defaults.notes,
  interviews: defaults.interviews,
  messages: defaults.messages,
  mediaItems: defaults.mediaItems,
  hero: HERO_DEFAULTS,
};

/** همه بخش‌ها در یک رفت‌وبرگشت خوانده می‌شوند، نه یکی‌یکی. */
export const getAllContent = cache(async (): Promise<Record<string, unknown>> => {
  let rows: { key: string; value: string }[] = [];

  try {
    rows = await db.setting.findMany();
  } catch {
    // پایگاه داده در دسترس نیست (مثلاً هنگام ساخت خروجی استاتیک) —
    // پیش‌فرض‌ها کافی‌اند.
    return { ...DEFAULTS };
  }

  const stored: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      stored[row.key] = JSON.parse(row.value);
    } catch {
      // مقدار خراب نادیده گرفته می‌شود تا کل سایت از کار نیفتد
    }
  }

  return { ...DEFAULTS, ...stored };
});

export async function getContent<T>(key: ContentKey): Promise<T> {
  const all = await getAllContent();
  return all[key] as T;
}

export async function setContent(key: ContentKey, value: unknown) {
  const serialized = JSON.stringify(value);
  await db.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

export type Profile = typeof defaults.profile;
export type Contact = typeof defaults.contact;
export { HERO_DEFAULTS };
