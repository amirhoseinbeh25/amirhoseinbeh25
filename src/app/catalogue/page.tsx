import SectionHeading from "@/components/SectionHeading";
import { categories } from "@/data/products";

export const metadata = { title: "کاتالوگ‌ها | Kemkan" };

export default function CataloguePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="منابع فنی"
        title="کاتالوگ‌های محصولات"
        description="کاتالوگ هر دسته محصول شامل مشخصات فنی و راهنمای مصرف است. فایل‌های PDF به‌زودی بارگذاری می‌شوند."
      />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {categories.map((c) => (
          <div
            key={c.slug}
            className="flex items-center justify-between rounded-2xl border border-paper-soft bg-paper p-6"
          >
            <div className="flex items-center gap-4">
              <span
                className="swatch-dot"
                style={{ backgroundColor: `var(--color-${c.color})`, width: "1.5rem", height: "1.5rem" }}
              />
              <div>
                <h3 className="font-bold text-ink">{c.title}</h3>
                <p className="text-xs text-ink-soft mt-0.5">کاتالوگ PDF — به‌زودی</p>
              </div>
            </div>
            <span className="rounded-full border border-paper-soft px-4 py-2 text-xs font-semibold text-ink-soft">
              دانلود
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
