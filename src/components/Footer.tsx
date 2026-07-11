import Link from "next/link";
import Logo from "./Logo";
import { site } from "@/data/site";
import { categories } from "@/data/products";

const swatches = ["var(--color-amber)", "var(--color-coral)", "var(--color-teal)", "var(--color-indigo)", "var(--color-olive)"];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo inverted />
            <p className="mt-4 text-sm text-paper-soft leading-7">{site.shortDescription}</p>
            <div className="mt-5 flex items-center gap-1.5">
              {swatches.map((c) => (
                <span key={c} className="swatch-dot" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2.5 text-sm text-paper-soft">
              <li><Link href="/about" className="hover:text-primary-light">درباره ما</Link></li>
              <li><Link href="/products" className="hover:text-primary-light">محصولات</Link></li>
              <li><Link href="/catalogue" className="hover:text-primary-light">کاتالوگ‌ها</Link></li>
              <li><Link href="/blog" className="hover:text-primary-light">بلاگ</Link></li>
              <li><Link href="/careers" className="hover:text-primary-light">استخدام</Link></li>
              <li><Link href="/enquiry" className="hover:text-primary-light">درخواست استعلام</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">دسته‌بندی محصولات</h4>
            <ul className="space-y-2.5 text-sm text-paper-soft">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/products?category=${c.slug}`} className="hover:text-primary-light">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">اطلاعات تماس</h4>
            <ul className="space-y-2.5 text-sm text-paper-soft leading-6">
              <li>{site.address || "آدرس به‌زودی تکمیل می‌شود"}</li>
              <li>{site.phones.filter(Boolean).join(" - ") || "تلفن به‌زودی تکمیل می‌شود"}</li>
              <li>{site.email || "ایمیل به‌زودی تکمیل می‌شود"}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper-soft">
          <p>© {new Date().getFullYear()} {site.nameLatin}. تمامی حقوق محفوظ است.</p>
          <p>{site.nameFa} — {site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
