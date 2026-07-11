import Link from "next/link";
import { getCategories, getProducts, getBrands, getPosts } from "@/lib/repo";

export const metadata = { title: "داشبورد | Kemkan Admin" };

export default function AdminDashboard() {
  const cards = [
    { label: "محصولات", count: getProducts().length, href: "/admin/products" },
    { label: "دسته‌بندی‌ها", count: getCategories().length, href: "/admin/categories" },
    { label: "برندها", count: getBrands().length, href: "/admin/brands" },
    { label: "مقالات بلاگ", count: getPosts().length, href: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">داشبورد</h1>
      <p className="mt-2 text-ink-soft">مدیریت محتوای سایت Kemkan از همین جا انجام می‌شود.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-paper-soft bg-paper p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <p className="text-3xl font-extrabold text-primary-dark">{c.count}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-paper-soft bg-paper p-6">
        <h2 className="font-bold text-ink">راهنمای سریع</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft list-disc pr-5">
          <li>برای افزودن یا ویرایش محصولات به بخش «محصولات» بروید.</li>
          <li>اطلاعات تماس، آدرس و توضیحات شرکت در «تنظیمات سایت» ویرایش می‌شود.</li>
          <li>تغییرات بلافاصله در سایت اصلی نمایش داده می‌شوند.</li>
        </ul>
      </div>
    </div>
  );
}
