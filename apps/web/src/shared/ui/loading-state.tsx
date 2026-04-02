"use client";

import { FC } from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = "Loading...",
}) => {
  return (
    <div
      className="flex flex-col gap-2 p-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{message}</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80"
        />
      ))}
    </div>
  );
};
