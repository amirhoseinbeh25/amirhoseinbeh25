import Link from "next/link";
import { getProducts } from "@/lib/repo";
import { deleteProductAction } from "./actions";

export const metadata = { title: "محصولات | Kemkan Admin" };

export default function AdminProductsPage() {
  const products = getProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">محصولات</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
        >
          + محصول جدید
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-paper-soft bg-paper divide-y divide-paper-soft overflow-hidden">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{p.title}</p>
              <p className="text-xs text-ink-soft truncate">{p.categoryTitle} · {p.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="rounded-full border border-paper-soft px-4 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink"
              >
                ویرایش
              </Link>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
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
        {products.length === 0 && <p className="px-5 py-8 text-center text-ink-soft">هنوز محصولی ثبت نشده است.</p>}
      </div>
    </div>
  );
}
