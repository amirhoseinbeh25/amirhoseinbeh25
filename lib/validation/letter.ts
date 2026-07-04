import { z } from "zod";

export const createLetterSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  subject: z.string().trim().min(3, "موضوع باید حداقل ۳ کاراکتر باشد."),
  content: z.string().trim().optional(),
  senderName: z.string().trim().optional(),
  recipientName: z.string().trim().optional(),
});

export type CreateLetterInput = z.infer<typeof createLetterSchema>;
