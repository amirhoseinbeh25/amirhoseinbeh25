import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "عنوان کار باید حداقل ۳ کاراکتر باشد."),
  description: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignedToId: z.string().min(1, "مسئول کار را انتخاب کنید."),
  dueDate: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
