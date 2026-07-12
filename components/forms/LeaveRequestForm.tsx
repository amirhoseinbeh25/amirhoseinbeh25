"use client";

import { useActionState } from "react";
import { createLeaveRequest } from "@/lib/actions/leave";
import { TextField, TextareaField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function LeaveRequestForm() {
  const [state, formAction, pending] = useActionState(createLeaveRequest, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <SelectField label="نوع درخواست" name="type" defaultValue="DAILY" required>
        <option value="DAILY">مرخصی روزانه</option>
        <option value="MISSION">ماموریت</option>
        <option value="HOURLY">مرخصی ساعتی</option>
      </SelectField>

      <TextField label="تاریخ شروع" name="startDate" type="date" required />
      <TextField label="تاریخ پایان" name="endDate" type="date" required />
      <TextareaField label="علت درخواست" name="reason" />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت درخواست"}
      </Button>
    </form>
  );
}
