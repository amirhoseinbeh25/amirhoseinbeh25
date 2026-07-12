import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { taskStatusLabels, taskPriorityLabels, formatPersianDate } from "@/lib/labels";

const statusFlow: Record<string, { next: "TODO" | "IN_PROGRESS" | "DONE"; label: string }[]> = {
  TODO: [{ next: "IN_PROGRESS", label: "شروع انجام" }],
  IN_PROGRESS: [{ next: "DONE", label: "اتمام کار" }],
  DONE: [],
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignedTo: true, createdBy: true },
  });

  if (!task) notFound();

  const isAssignee = task.assignedToId === user.id;
  const actions = isAssignee ? statusFlow[task.status] : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold">{task.title}</h2>
        <Badge {...taskStatusLabels[task.status]} />
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
        <p>مسئول: {task.assignedTo.fullName}</p>
        <p>ایجادکننده: {task.createdBy.fullName}</p>
        <p>
          اولویت: <Badge {...taskPriorityLabels[task.priority]} />
        </p>
        {task.dueDate && <p>مهلت انجام: {formatPersianDate(task.dueDate)}</p>}
        {task.description && <p className="whitespace-pre-wrap pt-2">{task.description}</p>}
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((a) => (
            <form key={a.next} action={updateTaskStatus.bind(null, task.id, a.next)}>
              <Button type="submit">{a.label}</Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
