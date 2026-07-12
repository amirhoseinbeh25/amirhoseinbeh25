import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProductsByCategory } from "@/lib/repo";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getProductsByCategory(product.categorySlug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <nav className="text-sm text-ink-soft">
        <Link href="/products" className="hover:text-primary-dark">محصولات</Link>
        {" / "}
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-primary-dark">
          {product.categoryTitle}
        </Link>
      </nav>

      <div className="mt-6 grid lg:grid-cols-2 gap-10 items-start">
        <div
          className="relative flex h-64 items-center justify-center overflow-hidden rounded-3xl sm:h-80"
          style={{
            background: `linear-gradient(135deg, var(--color-${product.categoryColor}) 0%, var(--color-ink) 130%)`,
          }}
        >
          <span className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white opacity-30 blur-3xl" />
          <span className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white opacity-15 blur-2xl" />
          <span className="relative px-8 text-center text-2xl font-extrabold text-paper drop-shadow-sm">
            {product.title}
          </span>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-paper-soft px-3 py-1 text-xs font-bold text-ink-soft">
            <span className="swatch-dot bg-primary" />
            {product.categoryTitle}
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-ink">{product.title}</h1>
          <p className="mt-4 text-ink-soft leading-8">{product.summary}</p>

          <dl className="mt-6 divide-y divide-paper-soft border-y border-paper-soft">
            {product.specs.map((s, i) => (
              <div key={i} className="flex justify-between py-3 text-sm">
                <dt className="text-ink-soft">{s.label}</dt>
                <dd className="font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-ink-soft">برند</dt>
              <dd className="font-semibold text-ink">{product.brand}</dd>
            </div>
          </dl>

          <Link href="/enquiry" className="btn-primary mt-8">
            استعلام قیمت این محصول
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-extrabold text-ink">محصولات مرتبط</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
