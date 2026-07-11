import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

export const metadata = { title: "محصولات | Kemkan" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category && categories.some((c) => c.slug === category) ? category : undefined;
  const list = activeCategory ? products.filter((p) => p.category === activeCategory) : products;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="محصولات کم‌کان"
        title="رزین، رنگ و مواد شیمیایی صنعتی"
        description="محصولات را بر اساس دسته‌بندی فیلتر کنید."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
            !activeCategory
              ? "bg-ink text-paper border-ink"
              : "border-paper-soft text-ink-soft hover:border-ink"
          }`}
        >
          همه محصولات
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
              activeCategory === c.slug
                ? "bg-ink text-paper border-ink"
                : "border-paper-soft text-ink-soft hover:border-ink"
            }`}
          >
            {c.title}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-10 text-center text-ink-soft">محصولی در این دسته‌بندی یافت نشد.</p>
      )}
    </div>
  );
}
