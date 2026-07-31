import { redirect } from "next/navigation";
import { adminUsers } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // اولین اجرا: هنوز حسابی نیست، پس باید اول ساخته شود
  if (adminUsers.count() === 0) redirect("/admin/setup");

  return <LoginForm />;
}
