"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "نام کاربری و رمز عبور را وارد کنید." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    return { error: "نام کاربری یا رمز عبور اشتباه است." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "نام کاربری یا رمز عبور اشتباه است." };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
