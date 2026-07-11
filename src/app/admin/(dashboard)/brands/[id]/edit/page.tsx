import { notFound } from "next/navigation";
import { getBrandById } from "@/lib/repo";
import BrandForm from "../../BrandForm";
import { updateBrandAction } from "../../actions";

export default async function EditBrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const brand = getBrandById(Number(id));
  if (!brand) notFound();

  const action = updateBrandAction.bind(null, brand.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">ویرایش برند</h1>
      <div className="mt-6">
        <BrandForm brand={brand} action={action} error={error} />
      </div>
    </div>
  );
}
