import { z } from "zod";

export const todoDtoSchema = z.object({
  id: z.uuid(),
  description: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type TodoDto = z.infer<typeof todoDtoSchema>;

const metaSchema = z.object({ requestId: z.string() });

export const listTodosResponseSchema = z.object({
  data: z.object({ todos: z.array(todoDtoSchema) }),
  meta: metaSchema.optional(),
});

export const createTodoResponseSchema = z.object({
  data: todoDtoSchema,
  meta: metaSchema.optional(),
});

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
});
