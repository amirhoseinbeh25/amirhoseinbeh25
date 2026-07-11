import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/data/blog";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <Link href="/blog" className="text-sm text-ink-soft hover:text-primary-dark">← بازگشت به بلاگ</Link>
      <p className="mt-4 text-xs text-ink-soft">{post.date}</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{post.title}</h1>
      <div className="mt-6 space-y-4 text-ink-soft leading-8">
        {post.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
