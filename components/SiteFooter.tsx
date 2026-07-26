import Link from "next/link";
import { ScholarlyProfiles } from "@/components/ScholarlyProfiles";
import { contact, navigation, profile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
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

        <div className="flex flex-col gap-5 sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
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
