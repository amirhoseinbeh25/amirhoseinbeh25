import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "تماس",
  description: "راه‌های ارتباطی، محل دفتر و ساعات ملاقات",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="تماس"
        description="برای هماهنگی جلسه، همکاری پژوهشی یا پیگیری امور دانشجویی."
      />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <dl className="grid gap-4 sm:grid-cols-2">
          {contact.email && (
            <ContactItem label="ایمیل">
              <a
                href={`mailto:${contact.email}`}
                dir="ltr"
                className="text-accent hover:underline"
              >
                {contact.email}
              </a>
            </ContactItem>
          )}

          {contact.phone && (
            <ContactItem label="تلفن">
              <a href={`tel:${contact.phone}`} dir="ltr" className="text-accent hover:underline">
                {contact.phone}
              </a>
            </ContactItem>
          )}

          {contact.office && (
            <ContactItem label="دفتر">{contact.office}</ContactItem>
          )}

          {contact.officeHours && (
            <ContactItem label="ساعات ملاقات">{contact.officeHours}</ContactItem>
          )}
        </dl>

        {contact.links.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">پیوندها</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {contact.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function ContactItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 font-medium">{children}</dd>
    </div>
  );
}
