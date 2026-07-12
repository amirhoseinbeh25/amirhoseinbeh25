import Link from "next/link";
import PaintDrop from "@/components/PaintDrop";

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-xl px-4 sm:px-6 py-24 text-center overflow-hidden">
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <PaintDrop glossy className="animate-float relative mx-auto w-14 h-16" />
      <h1 className="mt-6 text-3xl font-extrabold text-ink">صفحه مورد نظر یافت نشد</h1>
      <p className="mt-3 text-ink-soft">ممکن است آدرس اشتباه باشد یا صفحه جابه‌جا شده باشد.</p>
      <Link href="/" className="btn-primary mt-8">
        بازگشت به خانه
      </Link>
    </div>
  );
}
