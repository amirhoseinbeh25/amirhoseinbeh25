"use client";

import { useState, useTransition } from "react";
import { clearStats } from "@/app/admin/actions";

/**
 * پاک کردن آمار.
 *
 * دو مرحله‌ای است چون برگشت‌پذیر نیست: کلیک اول دکمه را به حالت تأیید
 * می‌برد و کلیک دوم پاک می‌کند.
 */
export function ClearStatsButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
      >
        پاک کردن آمار
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-muted">همه بازدیدها پاک شوند؟</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await clearStats();
            setConfirming(false);
          });
        }}
        className="rounded-lg border border-red-500 px-3 py-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-60"
      >
        {pending ? "…" : "بله، پاک کن"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-border px-3 py-2 transition-colors hover:border-accent"
      >
        انصراف
      </button>
    </span>
  );
}
