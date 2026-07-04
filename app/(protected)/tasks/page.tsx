import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";
import { taskStatusLabels, taskPriorityLabels, formatPersianDate } from "@/lib/labels";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await getCurrentUser();
  const { view } = await searchParams;
  const showCreated = view === "created" && (user.role === "ADMIN" || user.role === "MANAGER");

  const tasks = await prisma.task.findMany({
    where: showCreated ? { createdById: user.id } : { assignedToId: user.id },
    include: { assignedTo: true, createdBy: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const canCreate = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">کارها</h2>
        {canCreate && <LinkButton href="/tasks/new">ایجاد کار جدید</LinkButton>}
      </div>

      {canCreate && (
        <div className="flex gap-2 text-sm">
          <Link href="/tasks" className={`rounded-md px-3 py-1.5 ${!showCreated ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
            کارهای من
          </Link>
          <Link href="/tasks?view=created" className={`rounded-md px-3 py-1.5 ${showCreated ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
            ایجاد شده توسط من
          </Link>
        </div>
      )}

      <Table>
        <TableHead>
          <Th>عنوان</Th>
          <Th>{showCreated ? "مسئول" : "ایجادکننده"}</Th>
          <Th>اولویت</Th>
          <Th>مهلت</Th>
          <Th>وضعیت</Th>
        </TableHead>
        <TableBody>
          {tasks.length === 0 && <EmptyRow colSpan={5} message="کاری وجود ندارد." />}
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <Td>
                <Link href={`/tasks/${t.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                  {t.title}
                </Link>
              </Td>
              <Td>{showCreated ? t.assignedTo.fullName : t.createdBy.fullName}</Td>
              <Td>
                <Badge {...taskPriorityLabels[t.priority]} />
              </Td>
              <Td>{formatPersianDate(t.dueDate)}</Td>
              <Td>
                <Badge {...taskStatusLabels[t.status]} />
              </Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
