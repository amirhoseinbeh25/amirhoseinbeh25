import Link from "next/link";
import type { Role } from "@/app/generated/prisma/client";

type NavItem = { href: string; label: string; roles?: Role[] };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/letters", label: "دبیرخانه" },
  { href: "/referrals", label: "ارجاعات" },
  { href: "/tasks", label: "کارها" },
  { href: "/leave", label: "مرخصی" },
  { href: "/leave/approve", label: "تایید مرخصی", roles: ["ADMIN", "MANAGER"] },
  { href: "/admin/users", label: "کاربران", roles: ["ADMIN"] },
  { href: "/admin/departments", label: "بخش‌ها", roles: ["ADMIN"] },
];

export function Sidebar({ role }: { role: Role }) {
  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="w-56 shrink-0 border-l border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
