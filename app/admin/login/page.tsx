import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // اولین اجرا: هنوز حسابی نیست، پس باید اول ساخته شود
  if ((await db.adminUser.count()) === 0) redirect("/admin/setup");

  return <LoginForm />;
}
