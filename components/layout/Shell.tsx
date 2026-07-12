import type { Role } from "@/app/generated/prisma/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function Shell({
  fullName,
  role,
  children,
}: {
  fullName: string;
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar fullName={fullName} role={role} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
