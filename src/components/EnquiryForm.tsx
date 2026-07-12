"use client";

import { useState } from "react";

export default function EnquiryForm({
  categories,
  email,
}: {
  categories: { slug: string; title: string }[];
  email: string;
}) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `درخواست استعلام - ${data.get("category") || ""}`;
    const body = [
      `نام: ${data.get("name")}`,
      `تلفن: ${data.get("phone")}`,
      `شرکت: ${data.get("company")}`,
      `دسته محصول: ${data.get("category")}`,
      `توضیحات: ${data.get("message")}`,
    ].join("\n");
    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-paper-soft bg-paper p-8 text-center">
        <p className="text-lg font-bold text-ink">درخواست شما ثبت شد</p>
        <p className="mt-2 text-sm text-ink-soft">
          کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-paper-soft bg-paper p-6 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">نام و نام خانوادگی *</label>
          <input required name="name" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">شماره تماس *</label>
          <input required name="phone" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">نام شرکت</label>
          <input name="company" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">دسته محصول</label>
          <select name="category" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15">
            {categories.map((c) => (
              <option key={c.slug} value={c.title}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">توضیحات درخواست *</label>
        <textarea required name="message" rows={5} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15" />
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto">
        ارسال درخواست
      </button>
      <p className="text-xs text-ink-soft">
        این فرم نمونه است؛ اتصال آن به ایمیل یا سامانه ثبت درخواست پس از تکمیل اطلاعات تماس شرکت انجام می‌شود.
      </p>
    </form>
  );
}
