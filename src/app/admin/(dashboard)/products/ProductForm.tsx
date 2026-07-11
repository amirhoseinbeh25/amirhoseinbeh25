import { getCategories, specsToText, type Product } from "@/lib/repo";

export default function ProductForm({
  product,
  action,
  error,
}: {
  product?: Product;
  action: (formData: FormData) => void;
  error?: string;
}) {
  const categories = getCategories();

  return (
    <form action={action} className="rounded-2xl border border-paper-soft bg-paper p-6 space-y-5 max-w-xl">
      {error && (
        <p className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2 text-sm text-coral">
          {error === "slug" ? "این نامک (slug) قبلاً استفاده شده است." : "عنوان و دسته‌بندی الزامی است."}
        </p>
      )}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">عنوان محصول *</label>
        <input required name="title" defaultValue={product?.title} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">نامک (slug)</label>
        <input name="slug" defaultValue={product?.slug} placeholder="در صورت خالی بودن، از عنوان ساخته می‌شود" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" dir="ltr" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">دسته‌بندی *</label>
        <select required name="categoryId" defaultValue={product?.categoryId} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary">
          <option value="">انتخاب کنید</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">برند</label>
        <input name="brand" defaultValue={product?.brand ?? "—"} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">توضیح کوتاه</label>
        <textarea name="summary" defaultValue={product?.summary} rows={3} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">مشخصات فنی</label>
        <textarea
          name="specsText"
          defaultValue={product ? specsToText(product.specs) : ""}
          rows={4}
          placeholder={"هر مشخصه در یک خط، به شکل:\nویسکوزیته: ۵۰۰-۷۰۰ cPs\nزمان ژل: ۲۰ دقیقه"}
          className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary"
        />
        <p className="mt-1.5 text-xs text-ink-soft">هر خط یک مشخصه است، به شکل «عنوان: مقدار»</p>
      </div>
      <button type="submit" className="rounded-full bg-primary px-7 py-2.5 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ذخیره
      </button>
    </form>
  );
}
