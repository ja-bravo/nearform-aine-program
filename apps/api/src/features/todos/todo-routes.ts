import type { FastifyInstance } from "fastify";
import { flattenError, z } from "zod";
import { toErrorBody } from "../../shared/http/error-envelope.js";
import { rowToTodoDto } from "./todo-mappers.js";
import {
  createTodoBodySchema,
  createTodoSuccessSchema,
  listTodosSuccessSchema,
  todoDtoSchema,
  updateTodoBodySchema,
  updateTodoSuccessSchema,
} from "./todo-schemas.js";
import {
  createTodoRepository,
  type TodoRepository,
} from "./todo-repository.js";

export function registerTodosRoutes(
  app: FastifyInstance,
  repository?: TodoRepository
): void {
  const repo = repository ?? createTodoRepository();
  app.register(
    async (scope) => {
      scope.post("/", async (request, reply) => {
        const parsed = createTodoBodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send(
            toErrorBody(400, "Invalid request body", request.id, {
              code: "VALIDATION_ERROR",
              details: flattenError(parsed.error),
            })
          );
        }
        const row = await repo.insertTodo(parsed.data.description);
        const dto = todoDtoSchema.parse(rowToTodoDto(row));
        const payload = {
          data: dto,
          meta: { requestId: request.id },
        };
        createTodoSuccessSchema.parse(payload);
        return reply.status(201).send(payload);
      });

      scope.get("/", async (request, reply) => {
        const rows = await repo.findAllTodosOrderedByCreatedAtDesc();
        const todos = z
          .array(todoDtoSchema)
          .parse(rows.map((r) => rowToTodoDto(r)));
        const payload = {
          data: { todos },
          meta: { requestId: request.id },
        };
        listTodosSuccessSchema.parse(payload);
        return reply.send(payload);
      });

      scope.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const parsed = updateTodoBodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send(
            toErrorBody(400, "Invalid request body", request.id, {
              code: "VALIDATION_ERROR",
              details: flattenError(parsed.error),
            })
          );
        }

        const row = await repo.updateTodoCompletion(request.params.id, parsed.data.isCompleted);
        if (!row) {
          return reply.status(404).send(
            toErrorBody(404, `Todo with id '${request.params.id}' not found`, request.id, {
              code: "NOT_FOUND",
            })
          );
        }

        const dto = todoDtoSchema.parse(rowToTodoDto(row));
        const payload = {
          data: dto,
          meta: { requestId: request.id },
        };
        updateTodoSuccessSchema.parse(payload);
        return reply.status(200).send(payload);
      });
    },
    { prefix: "/api/v1/todos" }
  );
}
