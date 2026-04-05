import { FC } from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = "Loading tasks",
}) => {
  return (
    <div
      className="flex flex-col gap-2 p-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
        {message}
      </h2>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
        />
      ))}
    </div>
  );
};
