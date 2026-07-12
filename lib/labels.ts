export const roleLabels: Record<string, string> = {
  ADMIN: "مدیر سیستم",
  MANAGER: "مدیر",
  EMPLOYEE: "کارمند",
};

export const letterTypeLabels: Record<string, string> = {
  IN: "وارده",
  OUT: "صادره",
};

export const letterStatusLabels: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "ثبت شده", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  REFERRED: { label: "ارجاع شده", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  IN_PROGRESS: { label: "در حال اقدام", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  CLOSED: { label: "بایگانی شده", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
};

export const referralStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار اقدام", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  IN_PROGRESS: { label: "در حال اقدام", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  DONE: { label: "انجام شد", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
};

export const taskStatusLabels: Record<string, { label: string; color: string }> = {
  TODO: { label: "انجام نشده", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  IN_PROGRESS: { label: "در حال انجام", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  DONE: { label: "انجام شده", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
};

export const taskPriorityLabels: Record<string, { label: string; color: string }> = {
  LOW: { label: "کم", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  MEDIUM: { label: "متوسط", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  HIGH: { label: "زیاد", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export const leaveTypeLabels: Record<string, string> = {
  DAILY: "مرخصی روزانه",
  MISSION: "ماموریت",
  HOURLY: "مرخصی ساعتی",
};

export const leaveStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار تایید", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  APPROVED: { label: "تایید شده", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  REJECTED: { label: "رد شده", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function formatPersianDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
