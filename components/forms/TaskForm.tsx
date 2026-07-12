"use client";

import { useActionState } from "react";
import { createTask } from "@/lib/actions/tasks";
import { TextField, TextareaField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function TaskForm({ users }: { users: { id: string; fullName: string }[] }) {
  const [state, formAction, pending] = useActionState(createTask, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <TextField label="عنوان کار" name="title" required />
      <TextareaField label="توضیحات" name="description" />

      <SelectField label="مسئول انجام" name="assignedToId" required defaultValue="">
        <option value="" disabled>
          انتخاب کنید
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.fullName}
          </option>
        ))}
      </SelectField>

      <SelectField label="اولویت" name="priority" defaultValue="MEDIUM" required>
        <option value="LOW">کم</option>
        <option value="MEDIUM">متوسط</option>
        <option value="HIGH">زیاد</option>
      </SelectField>

      <TextField label="مهلت انجام" name="dueDate" type="date" />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ایجاد کار"}
      </Button>
    </form>
  );
}
