import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * در Prisma 7 نشانی اتصال دیگر در schema نوشته نمی‌شود و CLI هم فایل .env
 * را خودش نمی‌خواند، پس هر دو این‌جا صریح تنظیم می‌شوند.
 */
loadEnv();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./data/site.db",
  },
});
