import SectionHeading from "@/components/SectionHeading";
import { site } from "@/data/site";

export const metadata = { title: "استخدام | Kemkan" };

const positions: { title: string; type: string; location: string }[] = [
  // TODO: موقعیت‌های شغلی واقعی جایگزین شود
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="فرصت‌های شغلی"
        title="به تیم کم‌کان بپیوندید"
        description="به‌دنبال افراد متعهد و علاقه‌مند به صنعت رنگ و رزین هستیم."
      />

      <div className="mt-10">
        {positions.length === 0 ? (
          <div className="rounded-2xl border border-paper-soft bg-paper p-8 text-center">
            <p className="text-ink-soft">در حال حاضر موقعیت شغلی فعالی ثبت نشده است.</p>
            <p className="mt-2 text-sm text-ink-soft">
              رزومه خود را به{" "}
              <span className="font-semibold text-ink">{site.email || "ایمیل شرکت"}</span> ارسال کنید.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {positions.map((p) => (
              <li key={p.title} className="rounded-2xl border border-paper-soft bg-paper p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-ink">{p.title}</h3>
                  <p className="text-sm text-ink-soft mt-1">{p.type} · {p.location}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
