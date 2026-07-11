import Link from "next/link";
import type { Product } from "@/data/products";
import { getCategory } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-paper-soft bg-paper overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className="h-32 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, var(--color-${category?.color ?? "amber"}) 0%, var(--color-paper-soft) 100%)`,
        }}
      >
        <span className="text-paper/90 font-extrabold text-lg drop-shadow-sm px-4 text-center">
          {category?.title}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-ink group-hover:text-primary-dark transition-colors">{product.title}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-6 flex-1">{product.summary}</p>
        <span className="mt-4 inline-block text-sm font-semibold text-primary-dark">مشاهده جزئیات ←</span>
      </div>
    </Link>
  );
}
