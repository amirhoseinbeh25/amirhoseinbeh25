"use client";

import { useActionState } from "react";
import { createDepartment } from "@/lib/actions/admin";
import { TextField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function DepartmentForm() {
  const [state, formAction, pending] = useActionState(createDepartment, undefined);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <TextField label="نام بخش" name="name" required />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ایجاد بخش"}
      </Button>
    </form>
  );
}
