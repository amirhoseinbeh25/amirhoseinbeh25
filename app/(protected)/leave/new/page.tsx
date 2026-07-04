import { LeaveRequestForm } from "@/components/forms/LeaveRequestForm";

export default function NewLeaveRequestPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ثبت درخواست مرخصی</h2>
      <LeaveRequestForm />
    </div>
  );
}
