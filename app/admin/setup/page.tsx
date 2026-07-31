import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SetupForm } from "@/components/admin/SetupForm";

export const dynamic = "force-dynamic";

/**
 * راه‌اندازی اولیه.
 *
 * تا وقتی هیچ حساب مدیری نیست، این صفحه باز است و اولین حساب را می‌سازد.
 * به‌محض ساخته‌شدن حساب، مسیر بسته می‌شود — وگرنه هر کسی می‌توانست حساب
 * مدیر تازه بسازد.
 */
export default async function SetupPage() {
  const count = await db.adminUser.count();
  if (count > 0) redirect("/admin/login");

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold">راه‌اندازی سایت</h1>
        <p className="mt-2 text-sm leading-7 text-muted">
          این اولین اجرای سایت است. حساب مدیر را همین‌جا بسازید؛ بعد از این،
          این صفحه بسته می‌شود.
        </p>
        <SetupForm />
      </div>
    </div>
  );
}
