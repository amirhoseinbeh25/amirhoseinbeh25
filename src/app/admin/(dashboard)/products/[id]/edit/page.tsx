import { notFound } from "next/navigation";
import { getProductById } from "@/lib/repo";
import ProductForm from "../../ProductForm";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const product = getProductById(Number(id));
  if (!product) notFound();

  const action = updateProductAction.bind(null, product.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">ویرایش محصول</h1>
      <div className="mt-6">
        <ProductForm product={product} action={action} error={error} />
      </div>
    </div>
  );
}
