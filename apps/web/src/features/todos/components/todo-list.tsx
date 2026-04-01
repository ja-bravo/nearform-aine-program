import type { TodoDto } from "@/shared/api/schemas";

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(iso: string): string {
  return createdAtFormatter.format(new Date(iso));
}

type TodoListProps = {
  todos: TodoDto[];
  isLoading: boolean;
  loadFailed: boolean;
};

export function TodoList({ todos, isLoading, loadFailed }: TodoListProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-2 p-2"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading tasks</span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
          />
        ))}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <p className="p-2 text-sm text-zinc-500 dark:text-zinc-400">
        Task list is unavailable until loading succeeds.
      </p>
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
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <input
            type="checkbox"
            checked={todo.isCompleted}
            disabled
            className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 opacity-70 dark:border-zinc-600"
            aria-label={todo.isCompleted ? "Completed" : "Not completed"}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {todo.description}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Added {formatCreatedAt(todo.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
