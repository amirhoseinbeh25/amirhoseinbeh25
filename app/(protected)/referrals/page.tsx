import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";
import { referralStatusLabels, formatPersianDate } from "@/lib/labels";

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await getCurrentUser();
  const { view } = await searchParams;
  const showSent = view === "sent" && (user.role === "ADMIN" || user.role === "MANAGER");

  const referrals = await prisma.referral.findMany({
    where: showSent ? { fromUserId: user.id } : { toUserId: user.id },
    include: { letter: true, fromUser: true, toUser: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">ارجاعات</h2>
        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <div className="flex gap-2 text-sm">
            <Link href="/referrals" className={`rounded-md px-3 py-1.5 ${!showSent ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
              دریافتی
            </Link>
            <Link href="/referrals?view=sent" className={`rounded-md px-3 py-1.5 ${showSent ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
              ارسالی
            </Link>
          </div>
        )}
      </div>

      <Table>
        <TableHead>
          <Th>نامه</Th>
          <Th>{showSent ? "ارجاع به" : "ارجاع از"}</Th>
          <Th>دستور</Th>
          <Th>مهلت</Th>
          <Th>وضعیت</Th>
        </TableHead>
        <TableBody>
          {referrals.length === 0 && <EmptyRow colSpan={5} message="ارجاعی وجود ندارد." />}
          {referrals.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <Td>
                <Link href={`/referrals/${r.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                  {r.letter.subject}
                </Link>
              </Td>
              <Td>{showSent ? r.toUser.fullName : r.fromUser.fullName}</Td>
              <Td>{r.instruction}</Td>
              <Td>{formatPersianDate(r.dueDate)}</Td>
              <Td>
                <Badge {...referralStatusLabels[r.status]} />
              </Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
