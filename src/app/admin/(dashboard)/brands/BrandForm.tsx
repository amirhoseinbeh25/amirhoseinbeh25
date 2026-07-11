import type { Brand } from "@/lib/repo";

export default function BrandForm({
  brand,
  action,
  error,
}: {
  brand?: Brand;
  action: (formData: FormData) => void;
  error?: string;
}) {
  return (
    <form action={action} className="rounded-2xl border border-paper-soft bg-paper p-6 space-y-5 max-w-xl">
      {error && (
        <p className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2 text-sm text-coral">
          {error === "slug" ? "این نامک (slug) قبلاً استفاده شده است." : "نام برند الزامی است."}
        </p>
      )}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">نام برند *</label>
        <input required name="name" defaultValue={brand?.name} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">نامک (slug)</label>
        <input name="slug" defaultValue={brand?.slug} placeholder="در صورت خالی بودن، از نام ساخته می‌شود" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" dir="ltr" />
      </div>
      <button type="submit" className="rounded-full bg-primary px-7 py-2.5 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ذخیره
      </button>
    </form>
  );
}
