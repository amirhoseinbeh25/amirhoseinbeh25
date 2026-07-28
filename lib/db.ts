import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma";

/**
 * یک نمونه Prisma برای کل برنامه.
 *
 * در حالت توسعه، هر بار که ماژول‌ها دوباره بارگذاری می‌شوند یک نمونه تازه
 * ساخته می‌شود و اتصال‌ها روی هم جمع می‌شوند؛ نگه‌داشتن نمونه روی globalThis
 * جلوی آن را می‌گیرد.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./data/site.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
