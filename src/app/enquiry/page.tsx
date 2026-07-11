import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata = { title: "درخواست استعلام | Kemkan" };

export default function EnquiryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <SectionHeading
        eyebrow="استعلام قیمت"
        title="درخواست استعلام و مشاوره"
        description="فرم زیر را تکمیل کنید تا کارشناسان کم‌کان در سریع‌ترین زمان با شما تماس بگیرند."
      />
      <div className="mt-10">
        <EnquiryForm />
      </div>
    </div>
  );
}
