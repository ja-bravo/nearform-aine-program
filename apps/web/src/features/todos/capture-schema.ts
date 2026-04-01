import { z } from "zod";

export const quickCaptureSchema = z.object({
  description: z.string().refine((v) => v.trim().length > 0, {
    message: "Add a short description for your task.",
  }),
});

export type QuickCaptureValues = z.infer<typeof quickCaptureSchema>;
