import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";
import { roleLabels } from "@/lib/labels";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">کاربران</h2>
        <LinkButton href="/admin/users/new">ایجاد کاربر جدید</LinkButton>
      </div>

      <Table>
        <TableHead>
          <Th>نام</Th>
          <Th>نام کاربری</Th>
          <Th>نقش</Th>
          <Th>بخش</Th>
          <Th>وضعیت</Th>
        </TableHead>
        <TableBody>
          {users.length === 0 && <EmptyRow colSpan={5} message="کاربری وجود ندارد." />}
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <Td>
                <Link href={`/admin/users/${u.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                  {u.fullName}
                </Link>
              </Td>
              <Td>{u.username}</Td>
              <Td>{roleLabels[u.role]}</Td>
              <Td>{u.department?.name ?? "-"}</Td>
              <Td>
                <Badge
                  label={u.isActive ? "فعال" : "غیرفعال"}
                  color={
                    u.isActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }
                />
              </Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
