import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800";

function FieldWrapper({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function TextField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <FieldWrapper label={label} htmlFor={props.id ?? props.name!} error={error}>
      <input id={props.id ?? props.name} className={fieldClasses} {...props} />
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <FieldWrapper label={label} htmlFor={props.id ?? props.name!} error={error}>
      <textarea id={props.id ?? props.name} rows={4} className={fieldClasses} {...props} />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode }) {
  return (
    <FieldWrapper label={label} htmlFor={props.id ?? props.name!} error={error}>
      <select id={props.id ?? props.name} className={fieldClasses} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
