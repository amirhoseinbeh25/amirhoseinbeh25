import { login } from "@/lib/auth-actions";
import PaintDrop from "@/components/PaintDrop";

export const metadata = { title: "ورود ادمین | Kemkan" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <PaintDrop className="w-10 h-12" />
          <h1 className="mt-3 text-xl font-extrabold text-paper">پنل مدیریت Kemkan</h1>
        </div>

        <form action={login} className="rounded-2xl bg-paper p-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2 text-sm text-coral">
              نام کاربری یا رمز عبور اشتباه است.
            </p>
          )}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">نام کاربری</label>
            <input
              required
              name="username"
              autoComplete="username"
              className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">رمز عبور</label>
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
          >
            ورود
          </button>
        </form>
      </div>
    </div>
  );
}
