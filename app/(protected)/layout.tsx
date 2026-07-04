import { getCurrentUser } from "@/lib/dal";
import { Shell } from "@/components/layout/Shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <Shell fullName={user.fullName} role={user.role}>
      {children}
    </Shell>
  );
}
