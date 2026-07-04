import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isManagerLike = user.role === "ADMIN" || user.role === "MANAGER";

  const [pendingReferrals, openTasks, myPendingLeave, approvalsPending] = await Promise.all([
    prisma.referral.count({ where: { toUserId: user.id, status: "PENDING" } }),
    prisma.task.count({ where: { assignedToId: user.id, status: { not: "DONE" } } }),
    prisma.leaveRequest.count({ where: { userId: user.id, status: "PENDING" } }),
    isManagerLike
      ? prisma.leaveRequest.count({
          where: {
            status: "PENDING",
            ...(user.role === "ADMIN" ? {} : { approverId: user.id }),
          },
        })
      : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">خوش آمدید، {user.fullName}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="ارجاعات در انتظار اقدام" value={pendingReferrals} href="/referrals" />
        <StatCard label="کارهای باز" value={openTasks} href="/tasks" />
        <StatCard label="درخواست‌های مرخصی من (در انتظار)" value={myPendingLeave} href="/leave" />
        {isManagerLike && (
          <StatCard label="مرخصی‌های در انتظار تایید" value={approvalsPending} href="/leave/approve" />
        )}
      </div>
    </div>
  );
}
