import Link from "next/link";
import { getBrands } from "@/lib/repo";
import { deleteBrandAction } from "./actions";

export const metadata = { title: "برندها | Kemkan Admin" };

export default function AdminBrandsPage() {
  const brands = getBrands();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">برندهای همکار</h1>
        <Link
          href="/admin/brands/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
        >
          + برند جدید
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-paper-soft bg-paper divide-y divide-paper-soft overflow-hidden">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{b.name}</p>
              <p className="text-xs text-ink-soft truncate">{b.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/brands/${b.id}/edit`}
                className="rounded-full border border-paper-soft px-4 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink"
              >
                ویرایش
              </Link>
              <form action={deleteBrandAction}>
                <input type="hidden" name="id" value={b.id} />
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
        {brands.length === 0 && <p className="px-5 py-8 text-center text-ink-soft">هنوز برندی ثبت نشده است.</p>}
      </div>
    </div>
  );
}
