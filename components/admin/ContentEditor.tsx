"use client";

import { useState, useTransition } from "react";
import { saveContent } from "@/app/admin/actions";
import type { ContentKey } from "@/lib/content";

type Primitive = string | number | boolean;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * ویرایشگر عمومی محتوا.
 *
 * به‌جای نوشتن یک فرم دستی برای هر کدام از نوزده بخش سایت، فرم از روی شکل
 * خود داده ساخته می‌شود: رشته و عدد و بولین فیلد می‌گیرند، آرایه‌ها ردیف
 * اضافه/حذف/جابه‌جا دارند و شیءهای تودرتو بازگشتی رندر می‌شوند. پس هر بخش
 * تازه‌ای که به محتوا اضافه شود، بدون کد جدید در پنل قابل ویرایش است.
 */
export function ContentEditor({
  contentKey,
  label,
  initialValue,
}: {
  contentKey: ContentKey;
  label: string;
  initialValue: unknown;
}) {
  const [value, setValue] = useState<unknown>(initialValue);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (next: unknown) => {
    setValue(next);
    setSaved(false);
  };

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await saveContent(contentKey, value);
        setSaved(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "ذخیره نشد.");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{label}</h2>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-accent">ذخیره شد</span>}
          {error && <span className="text-sm text-accent">{error}</span>}
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "در حال ذخیره…" : "ذخیره"}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <Node value={value} onChange={update} path={contentKey} />
      </div>
    </section>
  );
}

function Node({
  value,
  onChange,
  path,
  label,
}: {
  value: unknown;
  onChange: (next: unknown) => void;
  path: string;
  label?: string;
}) {
  if (Array.isArray(value)) {
    return <ArrayNode value={value} onChange={onChange} path={path} label={label} />;
  }

  if (isPlainObject(value)) {
    return (
      <div className="space-y-4">
        {label && <p className="text-sm font-semibold">{label}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(value).map(([key, child]) => (
            <div
              key={key}
              className={
                Array.isArray(child) || isPlainObject(child) ? "sm:col-span-2" : ""
              }
            >
              <Node
                value={child}
                label={FIELD_LABELS[key] ?? key}
                path={`${path}.${key}`}
                onChange={(next) => onChange({ ...value, [key]: next })}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <FieldNode
      value={value as Primitive | null}
      onChange={onChange}
      path={path}
      label={label}
    />
  );
}

function ArrayNode({
  value,
  onChange,
  path,
  label,
}: {
  value: unknown[];
  onChange: (next: unknown) => void;
  path: string;
  label?: string;
}) {
  const addItem = () => {
    // ردیف تازه از روی شکل ردیف اول ساخته می‌شود تا فیلدها یکسان بمانند
    const template = value[0];
    const blank = isPlainObject(template)
      ? Object.fromEntries(
          Object.entries(template).map(([key, child]) => [
            key,
            typeof child === "number" ? 0 : typeof child === "boolean" ? false : "",
          ]),
        )
      : "";
    onChange([...value, blank]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        {label && <p className="text-sm font-semibold">{label}</p>}
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
        >
          افزودن مورد
        </button>
      </div>

      {value.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          خالی است. با «افزودن مورد» شروع کنید.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {value.map((item, index) => (
            <li key={`${path}-${index}`} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">ردیف {index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...value];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                    className="rounded px-2 py-1 text-xs text-muted hover:text-foreground disabled:opacity-40"
                  >
                    بالا
                  </button>
                  <button
                    type="button"
                    disabled={index === value.length - 1}
                    onClick={() => {
                      const next = [...value];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      onChange(next);
                    }}
                    className="rounded px-2 py-1 text-xs text-muted hover:text-foreground disabled:opacity-40"
                  >
                    پایین
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    className="rounded px-2 py-1 text-xs text-accent"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <Node
                value={item}
                path={`${path}[${index}]`}
                onChange={(next) => {
                  const copy = [...value];
                  copy[index] = next;
                  onChange(copy);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldNode({
  value,
  onChange,
  path,
  label,
}: {
  value: Primitive | null;
  onChange: (next: unknown) => void;
  path: string;
  label?: string;
}) {
  const id = `field-${path.replace(/[^\w-]/g, "-")}`;

  if (typeof value === "boolean") {
    return (
      <label htmlFor={id} className="flex items-center gap-3 text-sm">
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4"
        />
        <span>{label}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium">
            {label}
          </label>
        )}
        <input
          id={id}
          type="number"
          step="any"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
        />
      </div>
    );
  }

  const text = String(value ?? "");
  const isLong = text.length > 80;
  const isLtr = /^(https?:|\/|[\w.+-]+@)/.test(text);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      {isLong ? (
        <textarea
          id={id}
          value={text}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-7 outline-none focus-visible:border-accent"
        />
      ) : (
        <input
          id={id}
          type="text"
          dir={isLtr ? "ltr" : undefined}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
        />
      )}
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  name: "نام",
  nameLines: "نام در تیتر (هر سطر جدا)",
  title: "عنوان",
  field: "گرایش",
  role: "سمت",
  organization: "سازمان",
  birth: "تولد",
  photo: "عکس",
  tagline: "معرفی کوتاه",
  summary: "درباره من",
  email: "ایمیل",
  phone: "تلفن",
  office: "دفتر",
  officeHours: "ساعات ملاقات",
  links: "پیوندها",
  label: "برچسب",
  href: "نشانی",
  kind: "نوع",
  value: "مقدار",
  degree: "مقطع",
  institution: "دانشگاه",
  years: "سال‌ها",
  details: "شرح",
  level: "مقطع",
  venue: "محل انتشار",
  year: "سال",
  authors: "نویسندگان",
  description: "توضیح",
  date: "تاریخ",
  source: "منبع",
  quote: "نقل‌قول",
  author: "گوینده",
  src: "فایل",
  poster: "پوستر",
  videoWebm: "ویدئو (WebM)",
  videoMp4: "ویدئو (MP4)",
  showScene: "نمایش لایه سه‌بعدی",
  sceneOpacity: "شفافیت لایه سه‌بعدی",
};
