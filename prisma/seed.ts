import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const [mgmt, hr, it] = await Promise.all([
    prisma.department.upsert({
      where: { name: "مدیریت" },
      update: {},
      create: { name: "مدیریت" },
    }),
    prisma.department.upsert({
      where: { name: "منابع انسانی" },
      update: {},
      create: { name: "منابع انسانی" },
    }),
    prisma.department.upsert({
      where: { name: "فناوری اطلاعات" },
      update: {},
      create: { name: "فناوری اطلاعات" },
    }),
  ]);

  const passwordHash = (plain: string) => bcrypt.hash(plain, 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      fullName: "مدیر سیستم",
      username: "admin",
      passwordHash: await passwordHash("admin123"),
      role: "ADMIN",
      departmentId: mgmt.id,
    },
  });

  const manager1 = await prisma.user.upsert({
    where: { username: "manager1" },
    update: {},
    create: {
      fullName: "رضا محمدی",
      username: "manager1",
      passwordHash: await passwordHash("manager123"),
      role: "MANAGER",
      departmentId: it.id,
    },
  });

  const employee1 = await prisma.user.upsert({
    where: { username: "employee1" },
    update: {},
    create: {
      fullName: "سارا احمدی",
      username: "employee1",
      passwordHash: await passwordHash("employee123"),
      role: "EMPLOYEE",
      departmentId: it.id,
      managerId: manager1.id,
    },
  });

  await prisma.user.upsert({
    where: { username: "employee2" },
    update: {},
    create: {
      fullName: "علی کریمی",
      username: "employee2",
      passwordHash: await passwordHash("employee123"),
      role: "EMPLOYEE",
      departmentId: hr.id,
      managerId: admin.id,
    },
  });

  const existingLetter = await prisma.letter.findFirst({
    where: { year: new Date().getFullYear() },
  });

  if (!existingLetter) {
    const year = new Date().getFullYear();
    const letter = await prisma.letter.create({
      data: {
        refNumber: `${year}/000001`,
        year,
        sequence: 1,
        type: "IN",
        subject: "درخواست همکاری با شرکت الف",
        content: "متن نمونه نامه وارده جهت آزمایش سامانه.",
        senderName: "شرکت الف",
        status: "REFERRED",
        createdById: admin.id,
        referrals: {
          create: {
            fromUserId: admin.id,
            toUserId: employee1.id,
            instruction: "لطفاً بررسی و پاسخ مناسب ارائه شود.",
            status: "PENDING",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { referrals: true },
    });

    await prisma.task.create({
      data: {
        title: "بررسی نامه وارده شرکت الف",
        description: "بررسی درخواست و تهیه پیش‌نویس پاسخ",
        priority: "MEDIUM",
        status: "TODO",
        assignedToId: employee1.id,
        createdById: admin.id,
        sourceReferralId: letter.referrals[0].id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const existingLeave = await prisma.leaveRequest.findFirst({
    where: { userId: employee1.id },
  });

  if (!existingLeave) {
    await prisma.leaveRequest.create({
      data: {
        userId: employee1.id,
        type: "DAILY",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        reason: "امور شخصی",
        status: "PENDING",
        approverId: manager1.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login accounts: admin/admin123, manager1/manager123, employee1/employee123, employee2/employee123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
