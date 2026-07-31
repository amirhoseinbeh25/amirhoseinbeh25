"use client";

import { useActionState } from "react";
import { createFirstAdmin, type SetupState } from "@/app/admin/actions";

const initial: SetupState = {};

export function SetupForm() {
  const [state, formAction, pending] = useActionState(createFirstAdmin, initial);

  return (
    <form action={formAction} className="mt-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            نام شما
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus-visible:border-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            ایمیل (برای ورود)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            dir="ltr"
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus-visible:border-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            رمز عبور — دست‌کم ۱۰ نویسه
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            dir="ltr"
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus-visible:border-accent"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            تکرار رمز عبور
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            dir="ltr"
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus-visible:border-accent"
          />
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-accent"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-accent px-5 py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "در حال ساخت…" : "ساخت حساب و ورود"}
      </button>
    </form>
  );
}
