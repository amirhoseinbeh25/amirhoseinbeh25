import CategoryForm from "../CategoryForm";
import { createCategoryAction } from "../actions";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">دسته‌بندی جدید</h1>
      <div className="mt-6">
        <CategoryForm action={createCategoryAction} error={error} />
      </div>
    </div>
  );
}
