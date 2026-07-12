"use client";

import { useActionState } from "react";
import { TextField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ActionState = { error?: string } | undefined;

export function ReferralForm({
  action,
  users,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  users: { id: string; fullName: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-medium">ارجاع نامه</h3>

      <SelectField label="ارجاع به" name="toUserId" required defaultValue="">
        <option value="" disabled>
          انتخاب کنید
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.fullName}
          </option>
        ))}
      </SelectField>

      <TextField label="دستور / توضیح" name="instruction" required />
      <TextField label="مهلت اقدام" name="dueDate" type="date" />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ارجاع..." : "ارجاع نامه"}
      </Button>
    </form>
  );
}
