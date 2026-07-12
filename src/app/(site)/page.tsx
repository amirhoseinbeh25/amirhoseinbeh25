import Link from "next/link";
import PaintDrop from "@/components/PaintDrop";
import SectionHeading from "@/components/SectionHeading";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { getSiteSettings, getCategories, getProducts, getBrands, getPosts } from "@/lib/repo";

const heroDrops = [
  { color: "var(--color-amber)", className: "w-10 h-12 top-6 left-4", rot: "6deg", delay: "0s" },
  { color: "var(--color-coral)", className: "w-8 h-10 top-24 left-24", rot: "-12deg", delay: "1.2s" },
  { color: "var(--color-teal)", className: "w-14 h-16 bottom-8 left-10", rot: "3deg", delay: "0.6s" },
  { color: "var(--color-indigo)", className: "w-6 h-8 bottom-24 left-40", rot: "-6deg", delay: "1.8s" },
  { color: "var(--color-olive)", className: "w-9 h-11 top-10 right-6", rot: "12deg", delay: "0.9s" },
];

const stats = [
  { value: "+۸", label: "دسته‌بندی محصول", color: "amber" },
  { value: "۷", label: "روز هفته پاسخ‌گویی", color: "coral" },
  { value: "+۱۰", label: "سال تجربه صنعتی", color: "teal" },
  { value: "۱۰۰٪", label: "تعهد به کیفیت", color: "indigo" },
];

export default function Home() {
  const site = getSiteSettings();
  const categories = getCategories();
  const products = getProducts();
  const brands = getBrands();
  const posts = getPosts();
  const marqueeBrands = brands.length > 0 ? [...brands, ...brands] : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-paper-soft">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/90" />

        <div className="pointer-events-none absolute inset-0 opacity-90">
          {heroDrops.map((d, i) => (
            <PaintDrop
              key={i}
              glossy
              color={d.color}
              className={`animate-float absolute ${d.className} drop-shadow-lg`}
              style={{ ["--rot" as string]: d.rot, animationDelay: d.delay }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold text-paper backdrop-blur-sm">
            <span className="swatch-dot bg-primary" />
            {site.nameFa} — {site.tagline}
          </span>
          <h1
            className="animate-fade-up mt-6 text-3xl sm:text-5xl font-extrabold text-paper leading-tight"
            style={{ animationDelay: "0.1s" }}
          >
            تامین رزین، رنگ و مواد شیمیایی صنعتی
            <br className="hidden sm:block" />
            با{" "}
            <span className="bg-gradient-to-l from-primary-light via-coral to-primary-light bg-clip-text text-transparent">
              کیفیت پایدار
            </span>{" "}
            و مشاوره تخصصی
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-2xl mx-auto text-paper-soft leading-8"
            style={{ animationDelay: "0.2s" }}
          >
            {site.shortDescription}
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/products" className="btn-primary w-full sm:w-auto">
              مشاهده محصولات
            </Link>
            <Link href="/enquiry" className="btn-outline-light w-full sm:w-auto">
              درخواست استعلام قیمت
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-paper-soft bg-paper-soft/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <span
                className="mb-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(--color-${s.color})` }}
              />
              <p className="text-3xl font-extrabold text-ink">{s.value}</p>
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
            <Link href="/products" className="text-sm font-semibold text-primary-dark shrink-0 hover:text-coral transition-colors">
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
      {brands.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <SectionHeading eyebrow="همکاران" title="برندهای همکار و تامین‌کننده" align="center" />
          <div
            className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            dir="ltr"
          >
            <div className="animate-marquee flex w-max items-center gap-4">
              {marqueeBrands.map((b, i) => (
                <div
                  key={`${b.slug}-${i}`}
                  className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-paper-soft bg-paper text-sm font-semibold text-ink-soft"
                >
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog preview */}
      <section className="bg-paper-soft/40 border-y border-paper-soft">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeading eyebrow="بلاگ" title="آخرین مقالات و اخبار" />
            <Link href="/blog" className="text-sm font-semibold text-primary-dark shrink-0 hover:text-coral transition-colors">
              مشاهده همه مقالات ←
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card-glow rounded-2xl border border-paper-soft bg-paper p-6"
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-ink via-ink to-[#2a1c0f] px-6 sm:px-14 py-14 text-center">
          <span className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <span className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-coral/20 blur-3xl" />
          <PaintDrop glossy color="var(--color-primary)" className="absolute -left-4 -top-4 w-24 h-28 opacity-60" />
          <PaintDrop glossy color="var(--color-coral)" className="absolute -right-2 -bottom-6 w-20 h-24 opacity-60" />
          <h2 className="relative text-2xl sm:text-3xl font-extrabold text-paper">
            نیاز به مشاوره برای انتخاب رزین یا رنگ مناسب دارید؟
          </h2>
          <p className="relative mt-3 text-paper-soft max-w-xl mx-auto">
            کارشناسان کم‌کان آماده پاسخگویی به سوالات فنی و ارائه استعلام قیمت هستند.
          </p>
          <Link href="/enquiry" className="btn-primary relative mt-7 inline-flex">
            ارسال درخواست
          </Link>
        </div>
      </section>
    </div>
  );
}
