import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SearchBox } from "@/components/SearchBox";

export const metadata: Metadata = {
  title: "جستجو",
  description: "جستجو در مطالب سایت",
};

export default function SearchPage() {
  return (
    <>
      <PageHeader title="جستجو" description="در مطالب این سایت جستجو کنید." />

      <div className="mx-auto max-w-3xl px-6 py-14">
        <SearchBox autoFocus />
      </div>
    </>
  );
}
