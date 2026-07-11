import Link from "next/link";
import PaintDrop from "@/components/PaintDrop";
import SectionHeading from "@/components/SectionHeading";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { site } from "@/data/site";
import { categories, products } from "@/data/products";
import { brands } from "@/data/brands";
import { posts } from "@/data/blog";

const heroDrops = [
  { color: "var(--color-amber)", className: "w-10 h-12 top-6 left-4 rotate-6" },
  { color: "var(--color-coral)", className: "w-8 h-10 top-24 left-24 -rotate-12" },
  { color: "var(--color-teal)", className: "w-14 h-16 bottom-8 left-10 rotate-3" },
  { color: "var(--color-indigo)", className: "w-6 h-8 bottom-24 left-40 -rotate-6" },
  { color: "var(--color-olive)", className: "w-9 h-11 top-10 right-6 rotate-12" },
];

const stats = [
  { value: "+۸", label: "دسته‌بندی محصول" },
  { value: "۷", label: "روز هفته پاسخ‌گویی" },
  { value: "+۱۰", label: "سال تجربه صنعتی" },
  { value: "۱۰۰٪", label: "تعهد به کیفیت" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-paper-soft">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          {heroDrops.map((d, i) => (
            <PaintDrop key={i} color={d.color} className={`absolute ${d.className} blur-[0.3px] opacity-70`} />
          ))}
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper-soft px-4 py-1.5 text-xs font-bold text-ink-soft">
            <span className="swatch-dot bg-primary" />
            {site.nameFa} — {site.tagline}
          </span>
          <h1 className="mt-6 text-3xl sm:text-5xl font-extrabold text-ink leading-tight">
            تامین رزین، رنگ و مواد شیمیایی صنعتی
            <br className="hidden sm:block" />
            با کیفیت پایدار و مشاوره تخصصی
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-ink-soft leading-8">
            {site.shortDescription}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="w-full sm:w-auto rounded-full bg-primary px-7 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
            >
              مشاهده محصولات
            </Link>
            <Link
              href="/enquiry"
              className="w-full sm:w-auto rounded-full border-2 border-ink px-7 py-3 font-bold text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              درخواست استعلام قیمت
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-paper-soft bg-paper-soft/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-primary-dark">{s.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <SectionHeading
          eyebrow="دسته‌بندی محصولات"
          title="از رزین اپوکسی تا رنگ‌های صنعتی"
          description="محصولات کم‌کان در دسته‌های زیر برای صنایع مختلف قابل تامین است."
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-paper-soft/40 border-y border-paper-soft">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeading eyebrow="محصولات" title="محصولات پرکاربرد" />
            <Link href="/products" className="text-sm font-semibold text-primary-dark shrink-0">
              مشاهده همه محصولات ←
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <SectionHeading eyebrow="همکاران" title="برندهای همکار و تامین‌کننده" align="center" />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((b) => (
            <div
              key={b.slug}
              className="flex items-center justify-center rounded-xl border border-paper-soft bg-paper h-20 text-sm font-semibold text-ink-soft"
            >
              {b.name}
            </div>
          ))}
        </div>
      </section>

      {/* Blog preview */}
      <section className="bg-paper-soft/40 border-y border-paper-soft">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeading eyebrow="بلاگ" title="آخرین مقالات و اخبار" />
            <Link href="/blog" className="text-sm font-semibold text-primary-dark shrink-0">
              مشاهده همه مقالات ←
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-2xl border border-paper-soft bg-paper p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <p className="text-xs text-ink-soft">{post.date}</p>
                <h3 className="mt-2 font-bold text-ink">{post.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-6">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 sm:px-14 py-14 text-center">
          <PaintDrop color="var(--color-primary)" className="absolute -left-4 -top-4 w-24 h-28 opacity-30" />
          <PaintDrop color="var(--color-coral)" className="absolute -right-2 -bottom-6 w-20 h-24 opacity-30" />
          <h2 className="relative text-2xl sm:text-3xl font-extrabold text-paper">
            نیاز به مشاوره برای انتخاب رزین یا رنگ مناسب دارید؟
          </h2>
          <p className="relative mt-3 text-paper-soft max-w-xl mx-auto">
            کارشناسان کم‌کان آماده پاسخگویی به سوالات فنی و ارائه استعلام قیمت هستند.
          </p>
          <Link
            href="/enquiry"
            className="relative mt-7 inline-block rounded-full bg-primary px-8 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
          >
            ارسال درخواست
          </Link>
        </div>
      </section>
    </div>
  );
}
