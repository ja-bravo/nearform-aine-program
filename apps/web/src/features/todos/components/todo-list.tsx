import type { TodoDto } from "@/shared/api/schemas";
import { ErrorMessage } from "@/shared/ui";
import { TodoItemRow } from "./todo-item-row";

type TodoListProps = {
  todos: TodoDto[];
  loadFailed: boolean;
  errorMessage?: string;
  requestId?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export function TodoList({
  todos,
  loadFailed,
  errorMessage,
  requestId,
  onRetry,
  isRetrying,
}: TodoListProps) {
  if (loadFailed) {
    return (
      <ErrorMessage
        message={
          errorMessage && errorMessage.trim() !== ""
            ? errorMessage
            : "Task list is unavailable until loading succeeds."
        }
        requestId={requestId}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-100">
          Nothing here yet
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add your first task above. It saves to the server so it stays after
          refresh.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2 p-2" role="list">
      {todos?.map((todo) => (
        <TodoItemRow key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
