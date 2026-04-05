import { FC } from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = "Getting your tasks ready",
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-8 p-12 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30 min-h-[450px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-zinc-400 dark:text-zinc-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            {message}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px]">
            Syncing with the server to bring you the latest updates.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50"
          />
        ))}
      </div>
    </div>
  );
};
