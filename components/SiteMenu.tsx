"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SearchBox } from "@/components/SearchBox";
import { menuSections, profile } from "@/lib/site";

/**
 * منوی کامل سایت روی تمام صفحه.
 *
 * با شانزده صفحه، نوار بالای صفحه جای همه را ندارد؛ نوار فقط بخش‌های اصلی
 * را نگه می‌دارد و بقیه از این‌جا باز می‌شوند.
 */
export function SiteMenu({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // تا وقتی منو باز است، صفحه پشتش نباید اسکرول شود
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panel.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-30 overflow-y-auto bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="منوی سایت"
    >
      <div
        ref={panel}
        tabIndex={-1}
        className="mx-auto max-w-5xl px-6 py-6 outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <Link href="/" onClick={onClose} className="leading-tight">
            <span className="block text-base font-bold">{profile.name}</span>
            <span className="block text-xs text-muted">{profile.role}</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            بستن
          </button>
        </div>

        <div className="mt-8">
          <SearchBox autoFocus />
        </div>

        <nav className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "block rounded-lg bg-accent-soft px-3 py-2 font-semibold text-accent"
                            : "block rounded-lg px-3 py-2 text-muted transition-colors hover:text-foreground"
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
