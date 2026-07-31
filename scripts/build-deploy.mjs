/**
 * بسته آماده آپلود روی هاست را می‌سازد.
 *
 * چرا: نصب معمولی روی سرور نزدیک یک گیگابایت و ۲۳ هزار فایل می‌شود — چون
 * کامپایلر Next و ابزارهای Prisma هم نصب می‌شوند — و سهمیه هاست اشتراکی را
 * پر می‌کند. خروجی standalone فقط چیزی را می‌آورد که سرور واقعاً لازم دارد،
 * پس روی هاست نه `npm install` لازم است نه `build`.
 *
 * اجرا:  npm run deploy
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "deploy";

if (!existsSync(".next/standalone")) {
  console.error("اول `npm run build` را اجرا کنید.");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// هسته standalone: کد سرور و فقط ماژول‌هایی که واقعاً لازم‌اند
cpSync(".next/standalone", OUT, { recursive: true });

// فایل‌های ایستا و عمومی جزو standalone نیستند و باید کنارش گذاشته شوند
cpSync(".next/static", join(OUT, ".next", "static"), { recursive: true });
cpSync("public", join(OUT, "public"), { recursive: true });

/**
 * سرور standalone نباید بازنویسی شود: سرور ما `next.config.ts` را می‌خواند
 * که در این خروجی وجود ندارد. پس آن را کنار می‌گذاریم و یک نقطه شروع تازه
 * می‌نویسیم که اول راه‌اندازی را انجام می‌دهد و بعد همان را صدا می‌زند.
 */
const standaloneServer = join(OUT, "server.js");
if (existsSync(standaloneServer)) {
  cpSync(standaloneServer, join(OUT, "next-server.js"));
}

writeFileSync(
  standaloneServer,
  `// نقطه شروع برنامه روی هاست.
//
// اول پوشه‌ها، کلید نشست و مهاجرت‌های پایگاه داده آماده می‌شوند و بعد سرور
// Next بالا می‌آید — تا نصب به ترمینال نیاز نداشته باشد.
const { bootstrap } = require("./lib/bootstrap.cjs");

bootstrap(__dirname);

require("./next-server.js");
`,
);

/**
 * better-sqlite3 باینری آماده همه سیستم‌عامل‌ها و کد منبع سی‌پلاس‌پلاس را
 * همراه دارد؛ روی سرور فقط باینری لینوکس لازم است.
 */
const sqlite = join(OUT, "node_modules", "better-sqlite3");
if (existsSync(sqlite)) {
  for (const folder of ["deps", "src", "build"]) {
    rmSync(join(sqlite, folder), { recursive: true, force: true });
  }
  const prebuilds = join(sqlite, "prebuilds");
  if (existsSync(prebuilds)) {
    const { readdirSync } = await import("node:fs");
    for (const name of readdirSync(prebuilds)) {
      if (!name.startsWith("linux-")) {
        rmSync(join(prebuilds, name), { recursive: true, force: true });
      }
    }
  }
}

// راهنمای نصب کنار خود فایل‌ها بماند
for (const file of ["INSTALL.txt"]) {
  if (existsSync(file)) cpSync(file, join(OUT, file));
}

// package.json خروجی نباید اسکریپت build داشته باشد؛ روی هاست build نمی‌شود
const pkgPath = join(OUT, "package.json");
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts = { start: "node server.js" };
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

console.log(`بسته آماده است: ${OUT}`);
