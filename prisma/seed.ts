/**
 * ساخت حساب مدیر اولیه از روی متغیرهای محیطی.
 * اجرا: npm run seed
 */
import { config } from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { hashPassword } from "../lib/auth-hash.js";

config();

const url = process.env.DATABASE_URL ?? "file:./data/site.db";
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME ?? "مدیر سایت";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL و ADMIN_PASSWORD را در .env تنظیم کنید.");
  }
  if (password.length < 10) {
    throw new Error("رمز عبور باید دست‌کم ۱۰ نویسه باشد.");
  }

  const passwordHash = await hashPassword(password);

  const user = await db.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });

  console.log(`حساب مدیر آماده است: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
