import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { createReferral } from "@/lib/actions/referrals";
import { closeLetter } from "@/lib/actions/letters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReferralForm } from "@/components/forms/ReferralForm";
import { letterTypeLabels, letterStatusLabels, referralStatusLabels, formatPersianDate } from "@/lib/labels";

export default async function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const letter = await prisma.letter.findUnique({
    where: { id },
    include: {
      createdBy: true,
      referrals: { include: { fromUser: true, toUser: true }, orderBy: { createdAt: "desc" } },
      attachments: true,
    },
  });

  if (!letter) notFound();

  const canManage = user.role === "ADMIN" || user.role === "MANAGER";
  const users = canManage
    ? await prisma.user.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } })
    : [];

  const referAction = createReferral.bind(null, letter.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{letter.subject}</h2>
          <p className="mt-1 text-sm text-slate-500">
            شماره: {letter.refNumber} | نوع: {letterTypeLabels[letter.type]}
          </p>
        </div>
        <Badge {...letterStatusLabels[letter.status]} />
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
        {letter.senderName && <p>فرستنده: {letter.senderName}</p>}
        {letter.recipientName && <p>گیرنده: {letter.recipientName}</p>}
        <p>ثبت‌کننده: {letter.createdBy.fullName}</p>
        <p>تاریخ ثبت: {formatPersianDate(letter.createdAt)}</p>
        {letter.content && <p className="whitespace-pre-wrap pt-2">{letter.content}</p>}
      </div>

      {letter.attachments.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">پیوست‌ها</h3>
          <ul className="space-y-1 text-sm">
            {letter.attachments.map((a) => (
              <li key={a.id}>
                <a href={`/api/attachments/${a.id}`} className="text-blue-700 hover:underline dark:text-blue-400">
                  {a.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-medium">تاریخچه ارجاعات</h3>
        {letter.referrals.length === 0 && <p className="text-sm text-slate-500">هنوز ارجاعی ثبت نشده است.</p>}
        <ul className="space-y-2">
          {letter.referrals.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div>
                <p>
                  از <span className="font-medium">{r.fromUser.fullName}</span> به{" "}
                  <span className="font-medium">{r.toUser.fullName}</span>
                </p>
                <p className="mt-1 text-slate-500">{r.instruction}</p>
                {r.dueDate && <p className="text-xs text-slate-400">مهلت: {formatPersianDate(r.dueDate)}</p>}
              </div>
              <Badge {...referralStatusLabels[r.status]} />
            </li>
          ))}
        </ul>
      </div>

      {canManage && (
        <>
          <ReferralForm action={referAction} users={users} />
          {letter.status !== "CLOSED" && (
            <form action={closeLetter.bind(null, letter.id)}>
              <Button type="submit" variant="secondary">
                بایگانی نامه
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
