import { z } from "zod";

export const createTodoBodySchema = z.object({
  description: z.string().trim().min(1).max(10_000),
});

export type CreateTodoBody = z.infer<typeof createTodoBodySchema>;

export const todoDtoSchema = z.object({
  id: z.uuid(),
  description: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type TodoDto = z.infer<typeof todoDtoSchema>;

export const createTodoSuccessSchema = z.object({
  data: todoDtoSchema,
  meta: z.object({ requestId: z.string() }),
});

export const listTodosSuccessSchema = z.object({
  data: z.object({
    todos: z.array(todoDtoSchema),
  }),
  meta: z.object({ requestId: z.string() }),
});

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
});
