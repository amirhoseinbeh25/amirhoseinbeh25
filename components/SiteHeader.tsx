"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { navigation, profile } from "@/lib/site";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * هدر تا وقتی نوار تیره صحنه زیرش هست شفاف می‌ماند و تنها بعد از رد شدن از
 * آن پس‌زمینه می‌گیرد. اگر به‌جایش آستانه ثابت چند پیکسلی می‌گذاشتیم، یک
 * نوار روشنِ نیمه‌شفاف وسط صحنه تیره می‌نشست و کدر دیده می‌شد.
 */
function pastScene() {
  const scene = document.querySelector(".scene");
  if (!scene) return window.scrollY > 24;
  const header = document.querySelector("header");
  const headerH = header ? header.getBoundingClientRect().height : 72;
  return scene.getBoundingClientRect().bottom <= headerH;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // موقعیت اسکرول یک منبع بیرون از React است، پس با useSyncExternalStore
  // خوانده می‌شود؛ اسنپ‌شات سمت سرور همیشه «بالای صفحه» است.
  const scrolled = useSyncExternalStore(subscribeToScroll, pastScene, () => false);

  // هر صفحه با یک نوار تیره صحنه شروع می‌شود، پس هدر تا قبل از اسکرول
  // شفاف می‌ماند و صحنه را نمی‌بُرد.
  const overHero = !scrolled && !open;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-20 transition-colors duration-300",
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border bg-background/85 backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="leading-tight" onClick={() => setOpen(false)}>
          <span
            className={clsx(
              "block text-base font-bold transition-colors",
              overHero && "text-[color:var(--hero-fg,#eaf5f1)]",
            )}
          >
            {profile.name}
          </span>
          <span
            className={clsx(
              "block text-xs transition-colors",
              overHero ? "text-[color:var(--hero-muted,#a9c4bd)]" : "text-muted",
            )}
          >
            {profile.role}
          </span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              pathname={pathname}
              overHero={overHero}
            />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="منوی ناوبری"
          className={clsx(
            "rounded-lg border px-3 py-2 text-sm transition-colors md:hidden",
            overHero
              ? "border-[color:var(--hero-line,#2e4f49)] text-[color:var(--hero-fg,#eaf5f1)]"
              : "border-border",
          )}
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
  overHero = false,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
  overHero?: boolean;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "rounded-lg px-3 py-2 text-sm transition-colors",
        overHero
          ? active
            ? "font-semibold text-[color:var(--hero-accent,#6fd3c2)]"
            : "text-[color:var(--hero-muted,#a9c4bd)] hover:text-[color:var(--hero-fg,#eaf5f1)]"
          : active
            ? "bg-accent-soft font-semibold text-accent"
            : "text-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
