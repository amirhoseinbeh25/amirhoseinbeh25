import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { decideLeaveRequest } from "@/lib/actions/leave";
import { Button } from "@/components/ui/Button";
import { leaveTypeLabels, formatPersianDate } from "@/lib/labels";

export default async function ApproveLeavePage() {
  const session = await requireRole(["ADMIN", "MANAGER"]);

  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: "PENDING",
      ...(session.role === "ADMIN" ? {} : { approverId: session.userId }),
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">تایید درخواست‌های مرخصی</h2>

      {requests.length === 0 && <p className="text-sm text-slate-500">درخواست در انتظاری وجود ندارد.</p>}

      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm">
              <p className="font-medium">{r.user.fullName}</p>
              <p className="text-slate-500">
                {leaveTypeLabels[r.type]} | {formatPersianDate(r.startDate)} تا {formatPersianDate(r.endDate)}
              </p>
              {r.reason && <p className="mt-1">علت: {r.reason}</p>}
            </div>

            <form action={decideLeaveRequest.bind(null, r.id, "APPROVED")} className="flex flex-wrap items-end gap-2">
              <input
                type="text"
                name="decisionNote"
                placeholder="توضیح (اختیاری)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <Button type="submit">تایید</Button>
              <button
                type="submit"
                formAction={decideLeaveRequest.bind(null, r.id, "REJECTED")}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                رد
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
