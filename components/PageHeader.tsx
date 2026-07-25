export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl leading-8 text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
