import Link from "next/link";
import { ScholarlyProfiles } from "@/components/ScholarlyProfiles";
import { contact, menuSections, profile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <p className="font-bold">{profile.name}</p>
          <p className="mt-1 text-sm text-muted">
            {profile.role} — {profile.organization}
          </p>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-block text-sm text-accent hover:underline"
              dir="ltr"
            >
              {contact.email}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <nav className="grid gap-x-8 gap-y-2 text-sm text-muted sm:grid-cols-2 sm:text-end lg:grid-cols-4">
            {menuSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-xs font-bold text-foreground">
                  {section.title}
                </p>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-foreground">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <ScholarlyProfiles />
        </div>
      </div>

      {/* سال عمداً نوشته نشده: صفحات استاتیک‌اند و سال در زمان build ثابت
          می‌شد و کهنه می‌ماند؛ ضمن اینکه میلادی بود و بقیه سایت شمسی است. */}
      <p className="border-t border-border px-6 py-4 text-center text-xs text-muted">
        © تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
}
