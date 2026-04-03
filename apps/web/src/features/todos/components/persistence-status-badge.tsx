"use client";

import { FC } from "react";

export type PersistenceStatus = "saving" | "saved" | "error" | null;

interface PersistenceStatusBadgeProps {
  status: PersistenceStatus;
}

const config = {
  saving: {
    text: "Saving",
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  saved: {
    text: "Saved",
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  error: {
    text: "Not saved",
    className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const PersistenceStatusBadge: FC<PersistenceStatusBadgeProps> = ({
  status,
}) => {
  const currentStatus = status && config[status];

  return (
    <div
      aria-live="polite"
      role="status"
      className={`h-5 transition-all duration-300 ${
        status ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      {currentStatus && (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${currentStatus.className}`}
        >
          {currentStatus.text}
        </span>
      )}
    </div>
  );
};
