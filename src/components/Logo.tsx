import Link from "next/link";
import PaintDrop from "./PaintDrop";

export default function Logo({
  nameLatin,
  tagline,
  inverted = false,
}: {
  nameLatin: string;
  tagline: string;
  inverted?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="relative flex items-center justify-center">
        <PaintDrop className="w-7 h-8" color="var(--color-primary)" />
        <PaintDrop className="w-4 h-5 absolute -left-2 top-1" color="var(--color-coral)" />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`font-extrabold text-xl tracking-tight ${
            inverted ? "text-paper" : "text-ink"
          }`}
        >
          {nameLatin}
        </span>
        <span
          className={`text-[11px] ${inverted ? "text-paper-soft" : "text-ink-soft"}`}
        >
          {tagline}
        </span>
      </span>
    </Link>
  );
}
