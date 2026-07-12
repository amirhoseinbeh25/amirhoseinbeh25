import { z } from "zod";

export const createLeaveRequestSchema = z
  .object({
    type: z.enum(["DAILY", "MISSION", "HOURLY"]),
    startDate: z.string().min(1, "تاریخ شروع را وارد کنید."),
    endDate: z.string().min(1, "تاریخ پایان را وارد کنید."),
    reason: z.string().trim().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد.",
    path: ["endDate"],
  });

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
