import { TodoHome } from "@/features/todos/components/todo-home";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-100/80 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
        <header className="px-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Capture quickly; your list comes from the server.
          </p>
        </header>
        <TodoHome />
      </div>
    </main>
  );
}
