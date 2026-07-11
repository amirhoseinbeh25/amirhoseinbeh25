import Link from "next/link";
import PaintDrop from "@/components/PaintDrop";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-24 text-center">
      <PaintDrop className="w-14 h-16 mx-auto" />
      <h1 className="mt-6 text-3xl font-extrabold text-ink">صفحه مورد نظر یافت نشد</h1>
      <p className="mt-3 text-ink-soft">ممکن است آدرس اشتباه باشد یا صفحه جابه‌جا شده باشد.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-primary px-7 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors"
      >
        بازگشت به خانه
      </Link>
    </div>
  );
}
