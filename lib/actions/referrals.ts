"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, verifySession } from "@/lib/dal";
import { createReferralSchema } from "@/lib/validation/referral";

export type ActionState = { error?: string } | undefined;

export async function createReferral(letterId: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = createReferralSchema.safeParse({
    toUserId: formData.get("toUserId"),
    instruction: formData.get("instruction"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { toUserId, instruction, dueDate } = parsed.data;

  await prisma.$transaction([
    prisma.referral.create({
      data: {
        letterId,
        fromUserId: session.userId,
        toUserId,
        instruction,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    }),
    prisma.letter.update({
      where: { id: letterId },
      data: { status: "REFERRED" },
    }),
  ]);

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/letters");
  revalidatePath("/referrals");
}

export async function updateReferralStatus(referralId: string, status: "IN_PROGRESS" | "DONE") {
  const session = await verifySession();

  const referral = await prisma.referral.findUnique({ where: { id: referralId } });
  if (!referral || referral.toUserId !== session.userId) {
    return;
  }

  await prisma.referral.update({
    where: { id: referralId },
    data: { status, respondedAt: status === "DONE" ? new Date() : referral.respondedAt },
  });

  if (status === "IN_PROGRESS") {
    await prisma.letter.update({ where: { id: referral.letterId }, data: { status: "IN_PROGRESS" } });
  }

  revalidatePath("/referrals");
  revalidatePath(`/referrals/${referralId}`);
  revalidatePath(`/letters/${referral.letterId}`);
}
