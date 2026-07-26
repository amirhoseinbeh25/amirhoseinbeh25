import { UrmiaBand } from "@/components/scene/UrmiaScene";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      className="scene relative isolate -mt-[var(--header-h)] overflow-hidden border-b border-border"
      style={{ background: "var(--hero-bg-1)" }}
    >
      <UrmiaBand />

      <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-[calc(var(--header-h)+3rem)]">
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: "var(--hero-fg)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-3 max-w-2xl leading-8"
            style={{ color: "var(--hero-muted)" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
