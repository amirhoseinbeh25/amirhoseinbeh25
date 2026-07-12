import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { updateReferralStatus } from "@/lib/actions/referrals";
import { createTaskFromReferral } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { referralStatusLabels, formatPersianDate } from "@/lib/labels";

export default async function ReferralDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: { letter: true, fromUser: true, toUser: true, task: true },
  });

  if (!referral) notFound();

  const isRecipient = referral.toUserId === user.id;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">
            <Link href={`/letters/${referral.letterId}`} className="text-blue-700 hover:underline dark:text-blue-400">
              {referral.letter.subject}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-slate-500">شماره نامه: {referral.letter.refNumber}</p>
        </div>
        <Badge {...referralStatusLabels[referral.status]} />
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
        <p>از: {referral.fromUser.fullName}</p>
        <p>به: {referral.toUser.fullName}</p>
        <p>دستور: {referral.instruction}</p>
        {referral.dueDate && <p>مهلت: {formatPersianDate(referral.dueDate)}</p>}
        <p>تاریخ ارجاع: {formatPersianDate(referral.createdAt)}</p>
      </div>

      {isRecipient && referral.status !== "DONE" && (
        <div className="flex flex-wrap gap-2">
          {referral.status === "PENDING" && (
            <form action={updateReferralStatus.bind(null, referral.id, "IN_PROGRESS")}>
              <Button type="submit" variant="secondary">
                شروع اقدام
              </Button>
            </form>
          )}
          <form action={updateReferralStatus.bind(null, referral.id, "DONE")}>
            <Button type="submit">اتمام ارجاع</Button>
          </form>
          {!referral.task && (
            <form action={createTaskFromReferral.bind(null, referral.id)}>
              <Button type="submit" variant="secondary">
                ایجاد کار از این ارجاع
              </Button>
            </form>
          )}
        </div>
      )}

      {referral.task && (
        <p className="text-sm text-slate-500">
          کار مرتبط:{" "}
          <Link href={`/tasks/${referral.task.id}`} className="text-blue-700 hover:underline dark:text-blue-400">
            {referral.task.title}
          </Link>
        </p>
      )}
    </div>
  );
}
