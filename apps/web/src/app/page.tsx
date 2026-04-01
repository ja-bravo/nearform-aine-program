import { TodoHome } from "@/features/todos/components/todo-home";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-100/80 dark:bg-zinc-950">
      <TodoHome />
    </main>
  );
}
