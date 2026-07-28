/**
 * حالت خالی فهرست‌ها.
 *
 * صفحه‌ای که هنوز محتوا ندارد نباید شکسته یا نیمه‌کاره به‌نظر برسد؛ این کادر
 * صریح می‌گوید چیزی ثبت نشده و در صورت لزوم راه جایگزین را نشان می‌دهد.
 */
export function EmptyState({
  title = "هنوز موردی ثبت نشده است",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
