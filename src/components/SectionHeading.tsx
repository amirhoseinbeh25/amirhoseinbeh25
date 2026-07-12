export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary-dark">
          <span className="swatch-dot bg-primary" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-ink">{title}</h2>
      <span
        className={`mt-3 block h-1 w-14 rounded-full bg-gradient-to-l from-primary to-coral ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
      {description && <p className="mt-3 text-ink-soft leading-7">{description}</p>}
    </div>
  );
}
