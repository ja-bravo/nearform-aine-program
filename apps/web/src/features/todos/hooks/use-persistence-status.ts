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
    let hideTimer: ReturnType<typeof setTimeout>;

    if (isSuccess) {
      setShowSaved(true);
      hideTimer = setTimeout(() => setShowSaved(false), timeoutMs ?? 3000);
    } else if (isPending) {
      setShowSaved(false);
    }
    return () => {
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
