import { z } from "zod";

export const createReferralSchema = z.object({
  toUserId: z.string().min(1, "گیرنده ارجاع را انتخاب کنید."),
  instruction: z.string().trim().min(3, "دستور ارجاع را وارد کنید."),
  dueDate: z.string().optional(),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
