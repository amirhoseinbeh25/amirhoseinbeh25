import Link from "next/link";
import PaintDrop from "@/components/PaintDrop";
import { logout } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/brands", label: "برندها" },
  { href: "/admin/blog", label: "بلاگ" },
  { href: "/admin/settings", label: "تنظیمات سایت" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" dir="rtl">
      <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <PaintDrop className="w-6 h-7" />
          <span className="font-extrabold">Kemkan Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-paper-soft hover:bg-white/10 hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-paper-soft hover:bg-white/10 hover:text-paper transition-colors"
          >
            مشاهده سایت ↗
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-right rounded-lg px-3 py-2.5 text-sm font-medium text-paper-soft hover:bg-white/10 hover:text-paper transition-colors"
            >
              خروج
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-paper-soft/40 overflow-x-hidden">
        <div className="max-w-4xl px-6 sm:px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
