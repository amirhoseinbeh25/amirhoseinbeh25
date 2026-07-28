import {
  activities,
  courses,
  education,
  interviews,
  menuSections,
  messages,
  news,
  notes,
  positions,
  profile,
  publications,
  researchInterests,
  testimonials,
} from "@/lib/site";

export type SearchEntry = {
  title: string;
  href: string;
  section: string;
  body: string;
};

/**
 * نمایه جستجو از همان داده‌ای ساخته می‌شود که صفحات را می‌سازد، پس با اضافه
 * شدن محتوا خودبه‌خود کامل می‌شود و جایی برای از قلم افتادن نمی‌ماند.
 *
 * سایت استاتیک است و سرور جستجو ندارد؛ نمایه کوچک است و کل کار در مرورگر
 * انجام می‌شود.
 */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  entries.push({
    title: profile.name,
    href: "/",
    section: "صفحه اول",
    body: [
      profile.title,
      profile.field,
      profile.role,
      profile.organization,
      profile.birth,
      profile.tagline,
      ...profile.summary,
    ].join(" "),
  });

  for (const section of menuSections) {
    for (const item of section.items) {
      entries.push({
        title: item.label,
        href: item.href,
        section: section.title,
        body: item.label,
      });
    }
  }

  for (const item of education) {
    entries.push({
      title: `${item.degree} ${item.field}`,
      href: "/resume",
      section: "تحصیلات",
      body: `${item.institution} ${item.years}`,
    });
  }

  for (const item of positions) {
    entries.push({
      title: item.title,
      href: "/resume",
      section: "سوابق",
      body: `${item.organization} ${item.years} ${item.details.join(" ")}`,
    });
  }

  for (const item of courses) {
    entries.push({
      title: item.name,
      href: "/resume",
      section: "دروس",
      body: item.level,
    });
  }

  for (const item of publications) {
    entries.push({
      title: item.title,
      href: "/publications",
      section: "پژوهش‌ها",
      body: `${item.authors} ${item.venue} ${item.year}`,
    });
  }

  for (const item of researchInterests) {
    entries.push({
      title: item,
      href: "/publications",
      section: "زمینه‌های پژوهشی",
      body: item,
    });
  }

  for (const item of activities) {
    entries.push({
      title: item.title,
      href: "/activities",
      section: "فعالیت‌ها",
      body: `${item.year} ${item.description}`,
    });
  }

  const articleGroups = [
    { items: news, href: "/news", section: "اخبار" },
    { items: notes, href: "/notes", section: "یادداشت‌ها" },
    { items: interviews, href: "/interviews", section: "گفت‌وگو" },
    { items: messages, href: "/messages", section: "پیام‌ها" },
  ];

  for (const group of articleGroups) {
    for (const item of group.items) {
      entries.push({
        title: item.title,
        href: group.href,
        section: group.section,
        body: [item.date, item.summary, item.source].filter(Boolean).join(" "),
      });
    }
  }

  for (const item of testimonials) {
    entries.push({
      title: item.author,
      href: "/biography/others",
      section: "روایت دیگران",
      body: `${item.quote} ${item.role ?? ""} ${item.source ?? ""}`,
    });
  }

  return entries;
}

/** حروف عربی و ارقام فارسی/عربی به شکل استاندارد فارسی برمی‌گردند. */
export function normalize(text: string): string {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[٠-٩]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x06f0),
    )
    .replace(/‌/g, " ")
    .replace(/[ً-ٰٟ]/g, "")
    .toLowerCase()
    .trim();
}

export function searchEntries(
  entries: SearchEntry[],
  query: string,
): SearchEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return entries
    .map((entry) => {
      const title = normalize(entry.title);
      const body = normalize(entry.body);
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 3;
        else if (body.includes(term)) score += 1;
      }
      return { entry, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((row) => row.entry);
}
