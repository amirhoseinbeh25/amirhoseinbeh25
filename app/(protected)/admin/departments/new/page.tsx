import { requireRole } from "@/lib/dal";
import { DepartmentForm } from "@/components/forms/DepartmentForm";

export default async function NewDepartmentPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ایجاد بخش جدید</h2>
      <DepartmentForm />
    </div>
  );
}
