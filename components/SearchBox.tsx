"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildSearchIndex, searchEntries } from "@/lib/searchIndex";

/**
 * جستجوی سمت کلاینت روی نمایه‌ای که از داده خود سایت ساخته می‌شود.
 * سایت استاتیک است و سرور جستجو ندارد؛ نمایه کوچک است و همه کار در مرورگر
 * انجام می‌شود.
 */
export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchEntries(index, query), [index, query]);
  const searched = query.trim().length >= 2;

  return (
    <div>
      <label htmlFor="site-search" className="sr-only">
        جستجو در سایت
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجو مطالب…"
        className="w-full rounded-xl border border-border bg-surface px-5 py-3.5 text-base outline-none transition-colors focus-visible:border-accent"
      />

      {searched && (
        <p className="mt-4 text-sm text-muted">
          {results.length > 0
            ? `${results.length} نتیجه`
            : "نتیجه‌ای پیدا نشد."}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((entry) => (
            <li key={`${entry.section}-${entry.title}-${entry.href}`}>
              <Link
                href={entry.href}
                className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
              >
                <span className="text-xs text-accent">{entry.section}</span>
                <span className="mt-1 block font-medium">{entry.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
