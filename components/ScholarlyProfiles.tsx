import { getAllContent } from "@/lib/content";
import type { ScholarlyProfile } from "@/lib/site";

type Kind = ScholarlyProfile["kind"];

function ProfileIcon({ kind }: { kind: Kind }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "scholar") {
    // کلاه فارغ‌التحصیلی — نشان آشنای گوگل اسکولر
    return (
      <svg {...common}>
        <path d="M12 4 22 9l-10 5L2 9l10-5Z" />
        <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
      </svg>
    );
  }

  if (kind === "researchgate") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 16V8h2.6a2.2 2.2 0 0 1 0 4.4H9" />
        <path d="M12.2 12.4 15 16" />
      </svg>
    );
  }

  // صفحه دانشگاه
  return (
    <svg {...common}>
      <path d="M3 10 12 5l9 5" />
      <path d="M5 10v9M19 10v9M9 19v-5h6v5" />
      <path d="M3 19h18" />
    </svg>
  );
}

export async function ScholarlyProfiles({
  className = "",
  tone = "light",
}: {
  className?: string;
  /** روی صحنه تیره از پالت هیرو استفاده می‌شود، نه رنگ‌های تم. */
  tone?: "light" | "hero";
}) {
  const content = await getAllContent();
  const scholarlyProfiles = content.scholarlyProfiles as ScholarlyProfile[];
  if (scholarlyProfiles.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {scholarlyProfiles.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={
              tone === "hero"
                ? "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
                : "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            }
            style={
              tone === "hero"
                ? {
                    borderColor: "var(--hero-line)",
                    color: "var(--hero-fg)",
                  }
                : undefined
            }
          >
            <ProfileIcon kind={item.kind} />
            <span>{item.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
