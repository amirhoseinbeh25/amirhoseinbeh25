"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * ثبت بازدید از سمت مرورگر.
 *
 * روی هر تغییر مسیر یک‌بار ارسال می‌شود. مرجع `ref` جلوی ارسال دوباره در
 * رندر مجدد را می‌گیرد.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    // کار کردن با پنل مدیریت بازدید نیست و آمار را الکی بالا می‌برد
    if (pathname.startsWith("/admin")) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    });

    fetch("/api/collect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
