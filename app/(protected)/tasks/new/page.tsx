import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/forms/TaskForm";

export default async function NewTaskPage() {
  await requireRole(["ADMIN", "MANAGER"]);
  const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ایجاد کار جدید</h2>
      <TaskForm users={users} />
    </div>
  );
}
