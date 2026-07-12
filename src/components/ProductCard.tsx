import Link from "next/link";
import type { Product } from "@/lib/repo";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-glow group flex flex-col overflow-hidden rounded-2xl border border-paper-soft bg-paper"
      style={{ ["--glow" as string]: `var(--color-${product.categoryColor})` }}
    >
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--color-${product.categoryColor}) 0%, var(--color-ink) 130%)`,
        }}
      >
        <span
          className="absolute -right-6 -top-10 h-28 w-28 rounded-full opacity-40 blur-2xl transition-transform duration-500 group-hover:scale-125"
          style={{ background: "white" }}
        />
        <span
          className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full opacity-25 blur-xl"
          style={{ background: "white" }}
        />
        <span className="relative flex h-full items-center justify-center px-4 text-center">
          <span className="font-extrabold text-lg text-paper drop-shadow-sm">{product.categoryTitle}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-ink transition-colors group-hover:text-primary-dark">{product.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{product.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-dark">
          مشاهده جزئیات
          <span className="transition-transform group-hover:-translate-x-1">←</span>
        </span>
      </div>
    </Link>
  );
}
