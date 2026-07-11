// اخبار و مقالات نمونه — بعداً با محتوای واقعی جایگزین شود.
export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
};

export const posts: Post[] = [
  {
    slug: "resin-selection-guide",
    title: "راهنمای انتخاب رزین مناسب برای پروژه شما",
    date: "۱۴۰۴/۰۲/۲۰",
    excerpt:
      "تفاوت رزین‌های اپوکسی، پلی‌استر و پلی‌یورتان در چیست و برای کدام کاربرد مناسب‌ترند؟",
    content: [
      "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود.",
      "در این مقاله به بررسی تفاوت انواع رزین و کاربرد هر یک می‌پردازیم.",
    ],
  },
  {
    slug: "industrial-paint-storage",
    title: "نکات نگهداری و انبارداری رنگ‌های صنعتی",
    date: "۱۴۰۴/۰۱/۱۵",
    excerpt: "رعایت چند نکته ساده می‌تواند عمر مفید رنگ‌های صنعتی را افزایش دهد.",
    content: [
      "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود.",
    ],
  },
  {
    slug: "kemkan-news",
    title: "اخبار کم‌کان",
    date: "۱۴۰۳/۱۲/۰۱",
    excerpt: "آخرین رویدادها و اخبار مجموعه کم‌کان.",
    content: [
      "این یک متن نمونه است و باید با محتوای واقعی جایگزین شود.",
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
