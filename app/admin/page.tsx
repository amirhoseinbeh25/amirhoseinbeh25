import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function since(days: number) {
  return new Date(Date.now() - days * DAY);
}

type GroupColumn =
  | "country"
  | "countryCode"
  | "city"
  | "deviceType"
  | "browser"
  | "os"
  | "path"
  | "deviceModel";

/** ستون‌هایی که می‌توانند خالی باشند و باید از شمارش کنار بروند. */
const NULLABLE: GroupColumn[] = [
  "country",
  "countryCode",
  "city",
  "deviceType",
  "browser",
  "os",
  "deviceModel",
];

/** شمارش گروهی روی یک ستون، مرتب‌شده از پربازدیدترین. */
async function topBy(column: GroupColumn, from: Date, take = 8) {
  // فیلتر «خالی نباشد» فقط روی ستون nullable معتبر است؛ روی path که همیشه
  // مقدار دارد، Prisma آن را رد می‌کند.
  const where = NULLABLE.includes(column)
    ? { createdAt: { gte: from }, NOT: { [column]: null } }
    : { createdAt: { gte: from } };

  const rows = await db.pageView.groupBy({
    by: [column],
    where,
    _count: { _all: true },
    orderBy: { _count: { [column]: "desc" } },
    take,
  });
  return rows.map((row) => ({
    label: String(row[column] ?? "—"),
    count: row._count._all,
  }));
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

  const [
    views30,
    views7,
    views1,
    uniques30,
    countries,
    cities,
    devices,
    models,
    browsers,
    systems,
    pages,
    recent,
  ] = await Promise.all([
    db.pageView.count({ where: { createdAt: { gte: from30 } } }),
    db.pageView.count({ where: { createdAt: { gte: since(7) } } }),
    db.pageView.count({ where: { createdAt: { gte: since(1) } } }),
    db.pageView
      .findMany({
        where: { createdAt: { gte: from30 }, NOT: { visitorHash: null } },
        distinct: ["visitorHash"],
        select: { id: true },
      })
      .then((rows) => rows.length),
    topBy("country", from30),
    topBy("city", from30),
    topBy("deviceType", from30, 5),
    topBy("deviceModel", from30),
    topBy("browser", from30),
    topBy("os", from30),
    topBy("path", from30, 10),
    db.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        createdAt: true,
        path: true,
        ip: true,
        country: true,
        city: true,
        deviceType: true,
        deviceModel: true,
        browser: true,
        os: true,
      },
    }),
  ]);

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
          empty="هنوز داده‌ای ثبت نشده، یا سرویس موقعیت جغرافیایی تنظیم نشده است."
        />
        <Panel
          title="شهر"
          rows={cities}
          empty="شهر تنها وقتی ثبت می‌شود که سایت پشت CDN باشد یا GEO_API_URL تنظیم شده باشد."
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
                      {formatter.format(row.createdAt)}
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

      <p className="text-xs leading-6 text-muted">
        بازدیدها از سمت مرورگر ثبت می‌شوند، پس اگر بازدیدکننده مسدودکننده
        تبلیغات داشته باشد شمرده نمی‌شود و عدد واقعی کمی بیشتر از این است.
        نشانی IP و اطلاعات دستگاه داده شخصی به حساب می‌آید؛ بهتر است در صفحه‌ای
        از سایت به جمع‌آوری آن اشاره شود.
      </p>
    </div>
  );
}
