"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action={formAction} className="w-full">
        <h1 className="text-2xl font-bold">ورود به پنل مدیریت</h1>
        <p className="mt-2 text-sm text-muted">
          این صفحه فقط برای مدیر سایت است.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              ایمیل
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
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
          {pending ? "در حال ورود…" : "ورود"}
        </button>
      </form>
    </div>
  );
}
