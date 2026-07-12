import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { updateUser } from "@/lib/actions/admin";
import { UserForm } from "@/components/forms/UserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  const [user, departments, managers] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { isActive: true, id: { not: id } }, orderBy: { fullName: "asc" } }),
  ]);

  if (!user) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ویرایش کاربر: {user.fullName}</h2>
      <UserForm
        mode="edit"
        action={updateUser.bind(null, user.id)}
        departments={departments}
        managers={managers}
        defaultValues={{
          fullName: user.fullName,
          role: user.role,
          departmentId: user.departmentId,
          managerId: user.managerId,
          isActive: user.isActive,
        }}
      />
    </div>
  );
}
