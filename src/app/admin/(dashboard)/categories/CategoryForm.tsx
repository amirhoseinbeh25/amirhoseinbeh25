import { COLORS, type Category } from "@/lib/repo";

const COLOR_LABELS: Record<string, string> = {
  amber: "کهربایی",
  coral: "مرجانی",
  teal: "فیروزه‌ای",
  indigo: "نیلی",
  olive: "زیتونی",
};

export default function CategoryForm({
  category,
  action,
  error,
}: {
  category?: Category;
  action: (formData: FormData) => void;
  error?: string;
}) {
  return (
    <form action={action} className="rounded-2xl border border-paper-soft bg-paper p-6 space-y-5 max-w-xl">
      {error && (
        <p className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2 text-sm text-coral">
          {error === "slug" ? "این نامک (slug) قبلاً استفاده شده است." : "عنوان الزامی است."}
        </p>
      )}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">عنوان *</label>
        <input required name="title" defaultValue={category?.title} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">نامک (slug)</label>
        <input name="slug" defaultValue={category?.slug} placeholder="در صورت خالی بودن، از عنوان ساخته می‌شود" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" dir="ltr" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">توضیح کوتاه</label>
        <textarea name="description" defaultValue={category?.description} rows={3} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">رنگ نماد</label>
        <select name="color" defaultValue={category?.color ?? "amber"} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary">
          {COLORS.map((c) => (
            <option key={c} value={c}>{COLOR_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="rounded-full bg-primary px-7 py-2.5 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ذخیره
      </button>
    </form>
  );
}
