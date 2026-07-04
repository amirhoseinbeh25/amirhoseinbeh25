"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { createUserSchema, updateUserSchema, createDepartmentSchema } from "@/lib/validation/user";

export type ActionState = { error?: string } | undefined;

export async function createUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
    managerId: formData.get("managerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { fullName, username, password, role, departmentId, managerId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "این نام کاربری قبلاً استفاده شده است." };
  }

  await prisma.user.create({
    data: {
      fullName,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      departmentId: departmentId || null,
      managerId: managerId || null,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(userId: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const parsed = updateUserSchema.safeParse({
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
    managerId: formData.get("managerId"),
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده نامعتبر است." };
  }

  const { fullName, role, departmentId, managerId, isActive } = parsed.data;

  if (managerId === userId) {
    return { error: "کاربر نمی‌تواند مدیر خودش باشد." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      fullName,
      role,
      departmentId: departmentId || null,
      managerId: managerId || null,
      isActive: isActive === "on",
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function createDepartment(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const parsed = createDepartmentSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "نام بخش نامعتبر است." };
  }

  const existing = await prisma.department.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return { error: "بخشی با این نام قبلاً ثبت شده است." };
  }

  await prisma.department.create({ data: { name: parsed.data.name } });

  revalidatePath("/admin/departments");
  redirect("/admin/departments");
}
