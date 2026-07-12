"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession, requireRole } from "@/lib/dal";
import { createLeaveRequestSchema } from "@/lib/validation/leave";

export type ActionState = { error?: string } | undefined;

export async function createLeaveRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();

  const parsed = createLeaveRequestSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { type, startDate, endDate, reason } = parsed.data;

  const requester = await prisma.user.findUnique({ where: { id: session.userId } });
  let approverId = requester?.managerId ?? null;
  if (!approverId) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    approverId = admin?.id ?? null;
  }

  await prisma.leaveRequest.create({
    data: {
      userId: session.userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || null,
      approverId,
    },
  });

  revalidatePath("/leave");
  redirect("/leave");
}

export async function decideLeaveRequest(leaveRequestId: string, decision: "APPROVED" | "REJECTED", formData: FormData) {
  const session = await requireRole(["ADMIN", "MANAGER"]);

  const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id: leaveRequestId } });
  if (!leaveRequest || leaveRequest.status !== "PENDING") return;
  if (session.role !== "ADMIN" && leaveRequest.approverId !== session.userId) return;

  const decisionNote = String(formData.get("decisionNote") ?? "").trim();

  await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: {
      status: decision,
      decisionNote: decisionNote || null,
      approverId: session.userId,
      decidedAt: new Date(),
    },
  });

  revalidatePath("/leave");
  revalidatePath("/leave/approve");
}
