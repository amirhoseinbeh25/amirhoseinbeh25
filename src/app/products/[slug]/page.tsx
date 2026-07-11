import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getCategory, getProductsByCategory, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = getProductsByCategory(product.category).filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <nav className="text-sm text-ink-soft">
        <Link href="/products" className="hover:text-primary-dark">محصولات</Link>
        {" / "}
        <Link href={`/products?category=${category?.slug}`} className="hover:text-primary-dark">
          {category?.title}
        </Link>
      </nav>

      <div className="mt-6 grid lg:grid-cols-2 gap-10 items-start">
        <div
          className="rounded-3xl h-64 sm:h-80 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, var(--color-${category?.color ?? "amber"}) 0%, var(--color-paper-soft) 100%)`,
          }}
        >
          <span className="text-paper/90 font-extrabold text-2xl px-8 text-center drop-shadow-sm">
            {product.title}
          </span>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-paper-soft px-3 py-1 text-xs font-bold text-ink-soft">
            <span className="swatch-dot bg-primary" />
            {category?.title}
          </span>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-ink">{product.title}</h1>
          <p className="mt-4 text-ink-soft leading-8">{product.summary}</p>

          <dl className="mt-6 divide-y divide-paper-soft border-y border-paper-soft">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between py-3 text-sm">
                <dt className="text-ink-soft">{s.label}</dt>
                <dd className="font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-ink-soft">برند</dt>
              <dd className="font-semibold text-ink">{product.brand}</dd>
            </div>
          </dl>

          <Link
            href="/enquiry"
            className="mt-8 inline-block rounded-full bg-primary px-7 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
          >
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
