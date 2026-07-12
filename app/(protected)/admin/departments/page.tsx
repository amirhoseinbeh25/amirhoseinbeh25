import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";

export default async function DepartmentsPage() {
  await requireRole(["ADMIN"]);

  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">بخش‌ها</h2>
        <LinkButton href="/admin/departments/new">ایجاد بخش جدید</LinkButton>
      </div>

      <Table>
        <TableHead>
          <Th>نام بخش</Th>
          <Th>تعداد کاربران</Th>
        </TableHead>
        <TableBody>
          {departments.length === 0 && <EmptyRow colSpan={2} message="بخشی ثبت نشده است." />}
          {departments.map((d) => (
            <tr key={d.id}>
              <Td>{d.name}</Td>
              <Td>{d._count.users}</Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
