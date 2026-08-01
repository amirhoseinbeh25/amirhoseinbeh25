import { redirect } from "next/navigation";
import { pageViews } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ClearStatsButton } from "@/components/admin/ClearStatsButton";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function since(days: number) {
  return new Date(Date.now() - days * DAY);
}

function Panel({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; count: number }[];
  empty: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-bold">{title}</h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="tabular-nums text-muted">{row.count}</span>
              </div>
              <div
                aria-hidden
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent-soft"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const from30 = since(30);

  // پرس‌وجوها همگام‌اند، پس نیازی به Promise.all نیست
  const views30 = pageViews.countSince(from30);
  const views7 = pageViews.countSince(since(7));
  const views1 = pageViews.countSince(since(1));
  const uniques30 = pageViews.uniqueVisitorsSince(from30);

  const countries = pageViews.topBy("country", from30);
  const cities = pageViews.topBy("city", from30);
  const devices = pageViews.topBy("deviceType", from30, 5);
  const models = pageViews.topBy("deviceModel", from30);
  const browsers = pageViews.topBy("browser", from30);
  const systems = pageViews.topBy("os", from30);
  const pages = pageViews.topBy("path", from30, 10);
  const recent = pageViews.recent(25);

  const totals = [
    { label: "بازدید امروز", value: views1 },
    { label: "۷ روز گذشته", value: views7 },
    { label: "۳۰ روز گذشته", value: views30 },
    { label: "بازدیدکننده یکتا (۳۰ روز)", value: uniques30 },
  ];

  const formatter = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {totals.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <dt className="text-2xl font-bold tabular-nums text-accent">
              {item.value.toLocaleString("fa-IR")}
            </dt>
            <dd className="mt-1 text-sm text-muted">{item.label}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="کشور"
          rows={countries}
          empty="هنوز بازدیدی از بیرون ثبت نشده است."
        />
        <Panel
          title="شهر"
          rows={cities}
          empty="اگر بعد از چند بازدید هم خالی ماند، یعنی سرور به سرویس موقعیت‌یابی دسترسی ندارد."
        />
        <Panel title="نوع دستگاه" rows={devices} empty="هنوز داده‌ای نیست." />
        <Panel
          title="مدل دستگاه"
          rows={models}
          empty="اندروید مدل را اعلام می‌کند؛ iOS فقط «iPhone» می‌گوید."
        />
        <Panel title="مرورگر" rows={browsers} empty="هنوز داده‌ای نیست." />
        <Panel title="سیستم‌عامل" rows={systems} empty="هنوز داده‌ای نیست." />
      </div>

      <Panel
        title="پربازدیدترین صفحات"
        rows={pages}
        empty="هنوز بازدیدی ثبت نشده است."
      />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-bold">آخرین بازدیدها</h2>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">هنوز بازدیدی ثبت نشده است.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-start text-sm">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  <th className="p-2 text-start font-medium">زمان</th>
                  <th className="p-2 text-start font-medium">صفحه</th>
                  <th className="p-2 text-start font-medium">مکان</th>
                  <th className="p-2 text-start font-medium">دستگاه</th>
                  <th className="p-2 text-start font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="whitespace-nowrap p-2 text-muted">
                      {formatter.format(new Date(row.createdAt))}
                    </td>
                    <td className="p-2">{row.path}</td>
                    <td className="p-2">
                      {[row.city, row.country].filter(Boolean).join("، ") || "—"}
                    </td>
                    <td className="p-2">
                      {[row.deviceModel ?? row.deviceType, row.os, row.browser]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td className="p-2 tabular-nums text-muted" dir="ltr">
                      {row.ip ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-xl text-xs leading-6 text-muted">
          بازدید خودتان شمرده نمی‌شود: تا وقتی در پنل وارد شده‌اید، باز کردن
          سایت آمار را بالا نمی‌برد و صفحات پنل هم اصلاً ثبت نمی‌شوند. بازدیدها
          از سمت مرورگر ثبت می‌شوند، پس اگر بازدیدکننده‌ای مسدودکننده تبلیغات
          داشته باشد شمرده نمی‌شود و عدد واقعی کمی بیشتر از این است. نشانی IP و
          اطلاعات دستگاه داده شخصی به حساب می‌آید؛ بهتر است در صفحه‌ای از سایت
          به جمع‌آوری آن اشاره شود.
        </p>
        <ClearStatsButton />
      </div>
    </div>
  );
}
