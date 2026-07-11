import BrandForm from "../BrandForm";
import { createBrandAction } from "../actions";

export default async function NewBrandPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">برند جدید</h1>
      <div className="mt-6">
        <BrandForm action={createBrandAction} error={error} />
      </div>
    </div>
  );
}
