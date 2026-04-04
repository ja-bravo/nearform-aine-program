"use client";

import { useEffect, useState } from "react";

export type PersistenceStatus = "saving" | "saved" | "error" | null;

interface UsePersistenceStatusProps {
  isSuccess: boolean;
  isError: boolean;
  isPending: boolean;
  timeoutMs?: number;
}

export function usePersistenceStatus({
  isSuccess,
  isError,
  isPending,
  timeoutMs = 3000,
}: UsePersistenceStatusProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    if (isSuccess) {
      timer = setTimeout(() => setShowSaved(true), 0);
      hideTimer = setTimeout(() => setShowSaved(false), timeoutMs);
    } else if (isPending) {
      // If we start a new mutation, clear the "Saved" state immediately
      timer = setTimeout(() => setShowSaved(false), 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isSuccess, isPending, timeoutMs]);

  let status: PersistenceStatus = null;
  if (isPending) {
    status = "saving";
  } else if (isError) {
    status = "error";
  } else if (showSaved) {
    status = "saved";
  }

  return status;
}
