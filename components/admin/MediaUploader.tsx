"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function MediaUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "بارگذاری نشد.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "بارگذاری نشد.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
      <input
        ref={input}
        type="file"
        accept="image/*,video/mp4,video/webm,application/pdf"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
        className="mx-auto block text-sm"
      />
      <p className="mt-3 text-xs text-muted">
        عکس، ویدئو (MP4 و WebM) و PDF — تا ۶۴ مگابایت.
      </p>
      {busy && <p className="mt-3 text-sm text-accent">در حال بارگذاری…</p>}
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </div>
  );
}
