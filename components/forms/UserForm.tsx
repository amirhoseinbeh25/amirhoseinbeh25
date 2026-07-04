"use client";

import { useActionState } from "react";
import { TextField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ActionState = { error?: string } | undefined;
type Option = { id: string; name?: string; fullName?: string };

export function UserForm({
  mode,
  action,
  departments,
  managers,
  defaultValues,
}: {
  mode: "create" | "edit";
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  departments: Option[];
  managers: Option[];
  defaultValues?: {
    fullName: string;
    role: string;
    departmentId?: string | null;
    managerId?: string | null;
    isActive?: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <TextField label="نام کامل" name="fullName" defaultValue={defaultValues?.fullName} required />

      {mode === "create" && (
        <>
          <TextField label="نام کاربری" name="username" required />
          <TextField label="رمز عبور" name="password" type="password" required />
        </>
      )}

      <SelectField label="نقش" name="role" defaultValue={defaultValues?.role ?? "EMPLOYEE"} required>
        <option value="EMPLOYEE">کارمند</option>
        <option value="MANAGER">مدیر</option>
        <option value="ADMIN">مدیر سیستم</option>
      </SelectField>

      <SelectField label="بخش" name="departmentId" defaultValue={defaultValues?.departmentId ?? ""}>
        <option value="">بدون بخش</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </SelectField>

      <SelectField label="مدیر مستقیم" name="managerId" defaultValue={defaultValues?.managerId ?? ""}>
        <option value="">بدون مدیر</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </SelectField>

      {mode === "edit" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
          حساب کاربری فعال است
        </label>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : mode === "create" ? "ایجاد کاربر" : "ذخیره تغییرات"}
      </Button>
    </form>
  );
}
