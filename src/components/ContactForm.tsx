"use client";

import { useState } from "react";

export default function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `پیام از فرم تماس - ${data.get("name")}`;
    const body = [
      `نام: ${data.get("name")}`,
      `ایمیل: ${data.get("email")}`,
      `تلفن: ${data.get("phone")}`,
      `پیام: ${data.get("message")}`,
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
        <p className="text-lg font-bold text-ink">پیام شما ارسال شد</p>
        <p className="mt-2 text-sm text-ink-soft">به‌زودی با شما تماس خواهیم گرفت.</p>
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
          <label className="block text-sm font-semibold text-ink mb-1.5">شماره تماس</label>
          <input name="phone" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">ایمیل *</label>
        <input required type="email" name="email" className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">پیام شما *</label>
        <textarea required name="message" rows={5} className="w-full rounded-xl border border-paper-soft bg-background px-4 py-2.5 outline-none focus:border-primary" />
      </div>
      <button type="submit" className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 font-bold text-ink hover:bg-primary-dark hover:text-paper transition-colors">
        ارسال پیام
      </button>
      <p className="text-xs text-ink-soft">
        این فرم نمونه است؛ اتصال آن به ایمیل یا سامانه پیام‌رسانی پس از تکمیل اطلاعات تماس شرکت انجام می‌شود.
      </p>
    </form>
  );
}
