"use client";

import { FC, useEffect, useState } from "react";

export type PersistenceStatus = "saving" | "saved" | "error" | null;

interface PersistenceStatusBadgeProps {
  status: PersistenceStatus;
  "data-testid"?: string;
}

const config = {
  saving: {
    text: "Saving",
    icon: (
      <svg
        className="mr-1.5 h-3 w-3 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  saved: {
    text: "Saved",
    icon: (
      <svg
        className="mr-1.5 h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  error: {
    text: "Not saved",
    icon: (
      <svg
        className="mr-1.5 h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const PersistenceStatusBadge: FC<PersistenceStatusBadgeProps> = ({
  status,
  "data-testid": dataTestId,
}) => {
  const currentStatus = status && config[status];
  const [shouldRender, setShouldRender] = useState(!!status);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status) {
      timer = setTimeout(() => setShouldRender(true), 0);
    } else {
      timer = setTimeout(() => setShouldRender(false), 300);
    }
    return () => clearTimeout(timer);
  }, [status]);

  if (!shouldRender && !status)
    return <div className="h-5" data-testid={dataTestId} />;

  return (
    <div
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
      className={`h-5 transition-all duration-300 ${
        status ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      {currentStatus && (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${currentStatus.className}`}
        >
          {currentStatus.icon}
          {currentStatus.text}
        </span>
      )}
    </div>
  );
};
