"use client";

import { FC, useEffect, useState } from "react";
import { useConnectivity } from "@/shared/hooks/use-connectivity";
import { announce } from "@/shared/ui/a11y-announcer";

export const OfflineReadOnlyBanner: FC = () => {
  const { isReadOnly } = useConnectivity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      announce(
        isReadOnly ? "Connection lost: Offline" : "Connection restored: Online"
      );
    }
  }, [isReadOnly, mounted]);

  if (!mounted || !isReadOnly) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-[#A15504] px-4 py-2 text-sm font-medium text-white shadow-md transition-all animate-in fade-in slide-in-from-top-full duration-300"
    >
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="m18.36 6.64 1.42-1.42" />
        <path d="m6.14 18.86 1.42-1.42" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="M20 12h2" />
        <path d="M2 12h2" />
        <circle cx="12" cy="12" r="4" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
      <p>
        Offline: You are currently disconnected. Changes cannot be saved until
        connection is restored.
      </p>
    </div>
  );
};
