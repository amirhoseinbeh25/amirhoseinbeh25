import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";
import { getCategories, getSiteSettings } from "@/lib/repo";

export const metadata = { title: "درخواست استعلام | Kemkan" };

export default function EnquiryPage() {
  const categories = getCategories();
  const site = getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="استعلام قیمت"
        title="درخواست استعلام و مشاوره"
        description="فرم زیر را تکمیل کنید تا کارشناسان کم‌کان در سریع‌ترین زمان با شما تماس بگیرند."
      />
      <div className="mt-10">
        <EnquiryForm categories={categories} email={site.email} />
      </div>
    </div>
  );
}
