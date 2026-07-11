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
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-primary-dark uppercase">
          <span className="swatch-dot bg-primary" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{title}</h2>
      {description && <p className="mt-3 text-ink-soft leading-7">{description}</p>}
    </div>
  );
}
