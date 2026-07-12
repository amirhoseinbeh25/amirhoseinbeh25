"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { createLetterSchema } from "@/lib/validation/letter";
import { nextLetterRefNumber } from "@/lib/counters";
import { saveAttachmentFile } from "@/lib/attachments";

export type ActionState = { error?: string } | undefined;

export async function createLetter(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = createLetterSchema.safeParse({
    type: formData.get("type"),
    subject: formData.get("subject"),
    content: formData.get("content"),
    senderName: formData.get("senderName"),
    recipientName: formData.get("recipientName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { type, subject, content, senderName, recipientName } = parsed.data;

  const letter = await prisma.$transaction(async (tx) => {
    const { year, sequence, refNumber } = await nextLetterRefNumber(tx);
    return tx.letter.create({
      data: {
        refNumber,
        year,
        sequence,
        type,
        subject,
        content: content || null,
        senderName: senderName || null,
        recipientName: recipientName || null,
        createdById: session.userId,
      },
    });
  });

  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    const saved = await saveAttachmentFile(letter.id, file);
    await prisma.attachment.create({ data: { letterId: letter.id, ...saved } });
  }

  revalidatePath("/letters");
  redirect(`/letters/${letter.id}`);
}

export async function closeLetter(letterId: string) {
  await requireRole(["ADMIN", "MANAGER"]);

  await prisma.letter.update({
    where: { id: letterId },
    data: { status: "CLOSED" },
  });

  revalidatePath("/letters");
  revalidatePath(`/letters/${letterId}`);
}
