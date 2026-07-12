import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { getPosts } from "@/lib/repo";

export const metadata = { title: "بلاگ | Kemkan" };

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <SectionHeading eyebrow="بلاگ کم‌کان" title="مقالات و اخبار صنعت رنگ و رزین" />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="card-glow rounded-2xl border border-paper-soft bg-paper p-6"
          >
            <p className="text-xs text-ink-soft">{post.date}</p>
            <h2 className="mt-2 font-bold text-lg text-ink">{post.title}</h2>
            <p className="mt-2 text-sm text-ink-soft leading-6">{post.excerpt}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary-dark">ادامه مطلب ←</span>
          </Link>
        ))}
      </div>

      {posts.length === 0 && <p className="mt-10 text-center text-ink-soft">هنوز مقاله‌ای منتشر نشده است.</p>}
    </div>
  );
}
