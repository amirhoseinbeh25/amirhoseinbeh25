import { requireRole } from "@/lib/dal";
import { LetterForm } from "@/components/forms/LetterForm";

export default async function NewLetterPage() {
  await requireRole(["ADMIN", "MANAGER"]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ثبت نامه جدید</h2>
      <LetterForm />
    </div>
  );
}
