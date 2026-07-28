"use client";

import { useState } from "react";

/** نشانی فایل باید در ویرایشگر محتوا چسبانده شود، پس کپی‌کردنش یک کلیک است. */
export function CopyPath({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(path);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:border-accent hover:text-accent"
      dir="ltr"
    >
      {copied ? "کپی شد" : path}
    </button>
  );
}
