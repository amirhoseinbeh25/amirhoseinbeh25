import Link from "next/link";
import type { Category } from "@/lib/repo";
import PaintDrop from "./PaintDrop";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="card-glow group relative overflow-hidden rounded-2xl border border-paper-soft bg-paper p-6"
      style={{ ["--glow" as string]: `var(--color-${category.color})` }}
    >
      <span
        className="absolute -left-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-xl transition-transform duration-500 group-hover:scale-150"
        style={{ backgroundColor: `var(--color-${category.color})` }}
      />
      <span className="relative mb-4 inline-flex h-11 w-11 items-center justify-center">
        <PaintDrop
          glossy
          color={`var(--color-${category.color})`}
          className="h-11 w-11 drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6"
        />
      </span>
      <h3 className="relative font-bold text-ink">{category.title}</h3>
      <p className="relative mt-2 text-sm text-ink-soft leading-6">{category.description}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-dark">
        مشاهده محصولات
        <span className="transition-transform group-hover:-translate-x-1">←</span>
      </span>
    </Link>
  );
}
