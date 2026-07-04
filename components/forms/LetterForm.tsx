"use client";

import { useActionState } from "react";
import { createLetter } from "@/lib/actions/letters";
import { TextField, TextareaField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function LetterForm() {
  const [state, formAction, pending] = useActionState(createLetter, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <SelectField label="نوع نامه" name="type" defaultValue="IN" required>
        <option value="IN">وارده</option>
        <option value="OUT">صادره</option>
      </SelectField>

      <TextField label="موضوع" name="subject" required />

      <TextField label="نام فرستنده (برای نامه وارده)" name="senderName" />
      <TextField label="نام گیرنده (برای نامه صادره)" name="recipientName" />

      <TextareaField label="متن نامه" name="content" />

      <div className="space-y-1">
        <label htmlFor="attachment" className="block text-sm font-medium">
          پیوست (اختیاری)
        </label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          className="block w-full text-sm file:me-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm dark:file:bg-slate-800"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت نامه"}
      </Button>
    </form>
  );
}
