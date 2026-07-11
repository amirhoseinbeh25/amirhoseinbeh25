import type { Post } from "@/lib/repo";

export default function PostForm({
  post,
  action,
  error,
}: {
  post?: Post;
  action: (formData: FormData) => void;
  error?: string;
}) {
  return (
    <form action={action} className="rounded-2xl border border-paper-soft bg-paper p-6 space-y-5 max-w-xl">
      {error && (
        <p className="rounded-lg bg-coral/10 border border-coral/30 px-3 py-2 text-sm text-coral">
          {error === "slug" ? "این نامک (slug) قبلاً استفاده شده است." : "عنوان الزامی است."}
        </p>
      )}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">عنوان *</label>
        <input required name="title" defaultValue={post?.title} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">نامک (slug)</label>
        <input name="slug" defaultValue={post?.slug} placeholder="در صورت خالی بودن، از عنوان ساخته می‌شود" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" dir="ltr" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">تاریخ</label>
        <input name="date" defaultValue={post?.date} placeholder="مثلاً ۱۴۰۴/۰۲/۲۰" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">خلاصه</label>
        <textarea name="excerpt" defaultValue={post?.excerpt} rows={2} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">متن مقاله</label>
        <textarea
          name="content"
          defaultValue={post?.content}
          rows={8}
          placeholder="هر پاراگراف را با یک خط خالی از پاراگراف بعدی جدا کنید"
          className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary"
        />
      </div>
      <button type="submit" className="rounded-full bg-primary px-7 py-2.5 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ذخیره
      </button>
    </form>
  );
}
