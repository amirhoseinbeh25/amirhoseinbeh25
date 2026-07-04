import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, Th, Td, EmptyRow } from "@/components/ui/Table";
import { letterTypeLabels, letterStatusLabels } from "@/lib/labels";
import type { LetterStatus, LetterType } from "@/app/generated/prisma/client";

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  const { type, status } = await searchParams;

  const letters = await prisma.letter.findMany({
    where: {
      type: type ? (type as LetterType) : undefined,
      status: status ? (status as LetterStatus) : undefined,
    },
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  });

  const canCreate = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">دبیرخانه</h2>
        {canCreate && <LinkButton href="/letters/new">ثبت نامه جدید</LinkButton>}
      </div>

      <div className="flex gap-2 text-sm">
        <Link href="/letters" className={`rounded-md px-3 py-1.5 ${!type ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
          همه
        </Link>
        <Link href="/letters?type=IN" className={`rounded-md px-3 py-1.5 ${type === "IN" ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
          وارده
        </Link>
        <Link href="/letters?type=OUT" className={`rounded-md px-3 py-1.5 ${type === "OUT" ? "bg-slate-900 text-white" : "border border-slate-300"}`}>
          صادره
        </Link>
      </div>

      <Table>
        <TableHead>
          <Th>شماره نامه</Th>
          <Th>نوع</Th>
          <Th>موضوع</Th>
          <Th>وضعیت</Th>
          <Th>ثبت‌کننده</Th>
        </TableHead>
        <TableBody>
          {letters.length === 0 && <EmptyRow colSpan={5} message="نامه‌ای ثبت نشده است." />}
          {letters.map((letter) => (
            <tr key={letter.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
              <Td>
                <Link href={`/letters/${letter.id}`} className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                  {letter.refNumber}
                </Link>
              </Td>
              <Td>{letterTypeLabels[letter.type]}</Td>
              <Td>{letter.subject}</Td>
              <Td>
                <Badge {...letterStatusLabels[letter.status]} />
              </Td>
              <Td>{letter.createdBy.fullName}</Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
