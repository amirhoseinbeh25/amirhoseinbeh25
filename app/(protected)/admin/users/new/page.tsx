import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/actions/admin";
import { UserForm } from "@/components/forms/UserForm";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  const [departments, managers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ایجاد کاربر جدید</h2>
      <UserForm mode="create" action={createUser} departments={departments} managers={managers} />
    </div>
  );
}
