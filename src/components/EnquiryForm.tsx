"use client";

import { useState } from "react";
import { categories } from "@/data/products";
import { site } from "@/data/site";

export default function EnquiryForm() {
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
    if (site.email) {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
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
          <input required name="name" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">شماره تماس *</label>
          <input required name="phone" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">نام شرکت</label>
          <input name="company" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">دسته محصول</label>
          <select name="category" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary">
            {categories.map((c) => (
              <option key={c.slug} value={c.title}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">توضیحات درخواست *</label>
        <textarea required name="message" rows={5} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>

      <button type="submit" className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ارسال درخواست
      </button>
      <p className="text-xs text-ink-soft">
        این فرم نمونه است؛ اتصال آن به ایمیل یا سامانه ثبت درخواست پس از تکمیل اطلاعات تماس شرکت انجام می‌شود.
      </p>
    </form>
  );
}
