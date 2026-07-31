"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { clientIpFrom } from "@/lib/analytics";
import { setContent, type ContentKey } from "@/lib/content";

export type LoginState = { error?: string };
export type SetupState = { error?: string };

/**
 * ساخت اولین حساب مدیر.
 *
 * فقط تا وقتی هیچ حسابی وجود ندارد کار می‌کند؛ بررسی این شرط دوباره در خود
 * اکشن انجام می‌شود، نه فقط در صفحه، تا کسی نتواند با ارسال مستقیم فرم
 * حساب تازه بسازد.
 */
export async function createFirstAdmin(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  if ((await db.adminUser.count()) > 0) {
    return { error: "حساب مدیر از قبل ساخته شده است." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) {
    return { error: "همه فیلدها را پر کنید." };
  }
  if (password.length < 10) {
    return { error: "رمز عبور باید دست‌کم ۱۰ نویسه باشد." };
  }
  if (password !== confirm) {
    return { error: "رمز عبور و تکرارش یکی نیستند." };
  }

  const user = await db.adminUser.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });

  const headerList = await headers();
  await createSession(user.id, {
    ip: clientIpFrom(headerList),
    userAgent: headerList.get("user-agent"),
  });

  redirect("/admin");
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "ایمیل و رمز عبور را وارد کنید." };
  }

  const user = await db.adminUser.findUnique({ where: { email } });

  // پیام یکسان برای کاربر ناموجود و رمز غلط، تا نشود فهمید کدام ایمیل ثبت است
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    return { error: "ایمیل یا رمز عبور درست نیست." };
  }

  const headerList = await headers();
  await createSession(user.id, {
    ip: clientIpFrom(headerList),
    userAgent: headerList.get("user-agent"),
  });
  await db.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/** ذخیره یک بخش از محتوای سایت. */
export async function saveContent(key: ContentKey, value: unknown) {
  const user = await getCurrentUser();
  if (!user) throw new Error("اجازه دسترسی ندارید.");

  await setContent(key, value);

  // صفحات عمومی باید محتوای تازه را نشان دهند
  revalidatePath("/", "layout");
  return { ok: true as const };
}
