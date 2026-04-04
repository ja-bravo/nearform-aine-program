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
  const [prevIsSuccess, setPrevIsSuccess] = useState(false);

  if (isSuccess !== prevIsSuccess) {
    setPrevIsSuccess(isSuccess);
    if (isSuccess) {
      setShowSaved(true);
    }
  }

  if (isPending && showSaved) {
    setShowSaved(false);
  }

  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), timeoutMs);
      return () => clearTimeout(timer);
    }
  }, [showSaved, timeoutMs]);

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
