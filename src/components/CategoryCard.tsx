import Link from "next/link";
import type { Category } from "@/data/products";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-paper-soft bg-paper p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <span
        className="absolute -left-6 -top-6 w-20 h-20 rounded-full opacity-20 transition-transform group-hover:scale-125"
        style={{ backgroundColor: `var(--color-${category.color})` }}
      />
      <span
        className="swatch-dot mb-4 block"
        style={{ backgroundColor: `var(--color-${category.color})`, width: "1.75rem", height: "1.75rem" }}
      />
      <h3 className="font-bold text-ink">{category.title}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-6">{category.description}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-primary-dark">مشاهده محصولات ←</span>
    </Link>
  );
}
