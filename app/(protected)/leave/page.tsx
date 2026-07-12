import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";
import { leaveTypeLabels, leaveStatusLabels, formatPersianDate } from "@/lib/labels";

export default async function LeavePage() {
  const user = await getCurrentUser();

  const requests = await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    include: { approver: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">درخواست‌های مرخصی من</h2>
        <LinkButton href="/leave/new">ثبت درخواست جدید</LinkButton>
      </div>

      <Table>
        <TableHead>
          <Th>نوع</Th>
          <Th>از تاریخ</Th>
          <Th>تا تاریخ</Th>
          <Th>تایید کننده</Th>
          <Th>وضعیت</Th>
        </TableHead>
        <TableBody>
          {requests.length === 0 && <EmptyRow colSpan={5} message="درخواستی ثبت نشده است." />}
          {requests.map((r) => (
            <tr key={r.id}>
              <Td>{leaveTypeLabels[r.type]}</Td>
              <Td>{formatPersianDate(r.startDate)}</Td>
              <Td>{formatPersianDate(r.endDate)}</Td>
              <Td>{r.approver?.fullName ?? "-"}</Td>
              <Td>
                <Badge {...leaveStatusLabels[r.status]} />
              </Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
