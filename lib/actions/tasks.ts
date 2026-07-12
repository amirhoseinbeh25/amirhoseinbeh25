"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, verifySession } from "@/lib/dal";
import { createTaskSchema } from "@/lib/validation/task";

export type ActionState = { error?: string } | undefined;

export async function createTask(_state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    assignedToId: formData.get("assignedToId"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { title, description, priority, assignedToId, dueDate } = parsed.data;

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      assignedToId,
      createdById: session.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function createTaskFromReferral(referralId: string) {
  const session = await verifySession();

  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: { letter: true, task: true },
  });

  if (!referral || referral.toUserId !== session.userId || referral.task) {
    return;
  }

  await prisma.task.create({
    data: {
      title: `پیگیری: ${referral.letter.subject}`,
      description: referral.instruction,
      priority: "MEDIUM",
      assignedToId: session.userId,
      createdById: session.userId,
      dueDate: referral.dueDate,
      sourceReferralId: referral.id,
    },
  });

  revalidatePath(`/referrals/${referralId}`);
  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, status: "TODO" | "IN_PROGRESS" | "DONE") {
  const session = await verifySession();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.assignedToId !== session.userId) {
    return;
  }

  await prisma.task.update({ where: { id: taskId }, data: { status } });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
}
