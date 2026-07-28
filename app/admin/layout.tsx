import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  // پنل هرگز نباید در نتایج جستجو بیاید
  robots: { index: false, follow: false },
};

const tabs = [
  { href: "/admin", label: "آمار بازدید" },
  { href: "/admin/content", label: "محتوای سایت" },
  { href: "/admin/media", label: "فایل‌ها" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // صفحه ورود چیدمان خودش را دارد و نباید نوار مدیریت را ببیند
  if (!user) return <>{children}</>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold">پنل مدیریت</h1>
          <p className="mt-1 text-sm text-muted">{user.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            دیدن سایت
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
