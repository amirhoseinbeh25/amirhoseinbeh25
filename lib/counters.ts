import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function nextLetterRefNumber(tx: Prisma.TransactionClient = prisma) {
  const year = new Date().getFullYear();
  const count = await tx.letter.count({ where: { year } });
  const sequence = count + 1;
  const refNumber = `${year}/${String(sequence).padStart(6, "0")}`;
  return { year, sequence, refNumber };
}
