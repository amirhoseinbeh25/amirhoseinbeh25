import Link from "next/link";
import { getCategories } from "@/lib/repo";
import { deleteCategoryAction } from "./actions";

export const metadata = { title: "دسته‌بندی‌ها | Kemkan Admin" };

export default function AdminCategoriesPage() {
  const categories = getCategories();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">دسته‌بندی‌ها</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
        >
          + دسته‌بندی جدید
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-paper-soft bg-paper divide-y divide-paper-soft overflow-hidden">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="swatch-dot shrink-0"
                style={{ backgroundColor: `var(--color-${c.color})`, width: "1.25rem", height: "1.25rem" }}
              />
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{c.title}</p>
                <p className="text-xs text-ink-soft truncate">{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/categories/${c.id}/edit`}
                className="rounded-full border border-paper-soft px-4 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink"
              >
                ویرایش
              </Link>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="rounded-full border border-coral/40 px-4 py-1.5 text-xs font-semibold text-coral hover:bg-coral/10"
                >
                  حذف
                </button>
              </form>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="px-5 py-8 text-center text-ink-soft">هنوز دسته‌بندی‌ای ثبت نشده است.</p>}
      </div>
    </div>
  );
}
