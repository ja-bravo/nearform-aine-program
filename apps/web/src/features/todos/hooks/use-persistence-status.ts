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
    if (isSuccess) {
      setShowSaved(true);
      timer = setTimeout(() => setShowSaved(false), timeoutMs);
    } else if (isPending) {
      // If we start a new mutation, clear the "Saved" state immediately
      setShowSaved(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
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
