import Link from "next/link";
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
          <a
            href={`mailto:${contact.email}`}
            className="mt-3 inline-block text-sm text-accent hover:underline"
            dir="ltr"
          >
            {contact.email}
          </a>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="border-t border-border px-6 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} — تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
}
