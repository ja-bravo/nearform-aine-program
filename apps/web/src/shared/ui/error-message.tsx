"use client";

import { FC } from "react";

interface ErrorMessageProps {
  message: string;
  requestId?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  message,
  requestId,
  onRetry,
  isRetrying,
}) => {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-lg bg-red-50/80 p-6 text-center dark:bg-red-950/20"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-red-800 dark:text-red-200">
          {message}
        </p>
        {requestId && (
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">
            ID: {requestId}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:opacity-50 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
        >
          {isRetrying ? "Retrying..." : "Retry"}
        </button>
      )}
    </div>
  );
};
