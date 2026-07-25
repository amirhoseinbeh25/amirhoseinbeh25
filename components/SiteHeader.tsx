"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { navigation, profile } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="leading-tight" onClick={() => setOpen(false)}>
          <span className="block text-base font-bold">{profile.name}</span>
          <span className="block text-xs text-muted">{profile.role}</span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {navigation.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="منوی ناوبری"
          className="rounded-lg border border-border px-3 py-2 text-sm md:hidden"
        >
          {open ? "بستن" : "منو"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-3 md:hidden">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              pathname={pathname}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent-soft font-semibold text-accent"
          : "text-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
