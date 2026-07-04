import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

export const verifySession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { department: true },
  });
  if (!user || !user.isActive) {
    redirect("/login");
  }
  return user;
});

export async function requireRole(allowedRoles: Role[]) {
  const session = await verifySession();
  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}
