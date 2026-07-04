import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد."),
  username: z
    .string()
    .trim()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-zA-Z0-9_.]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه و زیرخط باشد."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد."),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  isActive: z.enum(["on"]).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "نام بخش باید حداقل ۲ کاراکتر باشد."),
});
