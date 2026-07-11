import { getSiteSettings } from "@/lib/repo";
import { updateSettingsAction } from "./actions";

export const metadata = { title: "تنظیمات سایت | Kemkan Admin" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const site = getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">تنظیمات سایت</h1>
      <p className="mt-2 text-ink-soft">اطلاعات عمومی و تماس که در سراسر سایت نمایش داده می‌شود.</p>

      {saved && (
        <p className="mt-4 rounded-lg bg-teal/10 border border-teal/30 px-3 py-2 text-sm text-teal max-w-xl">
          تغییرات با موفقیت ذخیره شد.
        </p>
      )}

      <form action={updateSettingsAction} className="mt-6 rounded-2xl border border-paper-soft bg-paper p-6 space-y-5 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">نام لاتین برند</label>
            <input name="nameLatin" defaultValue={site.nameLatin} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">نام فارسی برند</label>
            <input name="nameFa" defaultValue={site.nameFa} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">شعار / تگ‌لاین</label>
          <input name="tagline" defaultValue={site.tagline} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">توضیح کوتاه شرکت</label>
          <textarea name="shortDescription" defaultValue={site.shortDescription} rows={3} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">تلفن ۱</label>
            <input name="phone1" defaultValue={site.phone1} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">تلفن ۲</label>
            <input name="phone2" defaultValue={site.phone2} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">ایمیل</label>
          <input name="email" type="email" defaultValue={site.email} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">آدرس</label>
          <textarea name="address" defaultValue={site.address} rows={2} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">ساعات کاری</label>
          <input name="workHours" defaultValue={site.workHours} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">لینک نقشه (Embed)</label>
          <input name="mapEmbedUrl" defaultValue={site.mapEmbedUrl} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">تلگرام</label>
            <input name="socialTelegram" defaultValue={site.socialTelegram} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">اینستاگرام</label>
            <input name="socialInstagram" defaultValue={site.socialInstagram} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">واتساپ</label>
            <input name="socialWhatsapp" defaultValue={site.socialWhatsapp} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">لینکدین</label>
            <input name="socialLinkedin" defaultValue={site.socialLinkedin} dir="ltr" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
          </div>
        </div>

        <button type="submit" className="rounded-full bg-primary px-7 py-2.5 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}
