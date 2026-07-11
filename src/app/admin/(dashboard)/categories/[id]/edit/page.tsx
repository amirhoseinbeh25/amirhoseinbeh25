import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/repo";
import CategoryForm from "../../CategoryForm";
import { updateCategoryAction } from "../../actions";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const category = getCategoryById(Number(id));
  if (!category) notFound();

  const action = updateCategoryAction.bind(null, category.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">ویرایش دسته‌بندی</h1>
      <div className="mt-6">
        <CategoryForm category={category} action={action} error={error} />
      </div>
    </div>
  );
}
