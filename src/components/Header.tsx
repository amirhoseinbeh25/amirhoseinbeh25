"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/about", label: "درباره ما" },
  { href: "/products", label: "محصولات" },
  { href: "/catalogue", label: "کاتالوگ‌ها" },
  { href: "/blog", label: "بلاگ" },
  { href: "/careers", label: "استخدام" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Header({ nameLatin, tagline }: { nameLatin: string; tagline: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-paper-soft shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Logo nameLatin={nameLatin} tagline={tagline} />

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/enquiry"
              className="shadow-glow-primary rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-primary-dark hover:text-paper"
            >
              درخواست استعلام
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-ink"
            aria-label="باز کردن منو"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-paper-soft bg-paper">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-paper-soft hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/enquiry"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-bold text-ink"
            >
              درخواست استعلام
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
