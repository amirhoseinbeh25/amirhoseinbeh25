import ProductForm from "../ProductForm";
import { createProductAction } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">محصول جدید</h1>
      <div className="mt-6">
        <ProductForm action={createProductAction} error={error} />
      </div>
    </div>
  );
}
