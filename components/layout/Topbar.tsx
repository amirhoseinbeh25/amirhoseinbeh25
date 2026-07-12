import { logout } from "@/lib/actions/auth";
import { roleLabels } from "@/lib/labels";

export function Topbar({ fullName, role }: { fullName: string; role: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-lg font-bold">اتوماسیون اداری</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {fullName} <span className="text-slate-400">({roleLabels[role] ?? role})</span>
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            خروج
          </button>
        </form>
      </div>
    </header>
  );
}
