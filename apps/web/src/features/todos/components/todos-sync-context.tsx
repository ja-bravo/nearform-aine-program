"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TodoDto } from "@/shared/api/schemas";

type TodosSyncContextValue = {
  todos: TodoDto[];
  prependTodo: (todo: TodoDto) => void;
  updateTodo: (todo: TodoDto) => void;
  removeTodo: (id: string) => void;
};

const TodosSyncContext = createContext<TodosSyncContextValue | null>(null);

export function TodosSyncProvider({
  initialTodos,
  children,
}: {
  initialTodos: TodoDto[];
  children: ReactNode;
}) {
  const [todos, setTodos] = useState(initialTodos);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const prependTodo = useCallback((todo: TodoDto) => {
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const updateTodo = useCallback((todo: TodoDto) => {
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ todos, prependTodo, updateTodo, removeTodo }),
    [todos, prependTodo, updateTodo, removeTodo]
  );

  return (
    <TodosSyncContext.Provider value={value}>
      {children}
    </TodosSyncContext.Provider>
  );
}

export function useTodosSync(): TodosSyncContextValue {
  const ctx = useContext(TodosSyncContext);
  if (!ctx) {
    throw new Error("useTodosSync must be used within TodosSyncProvider");
  }
  return ctx;
}
