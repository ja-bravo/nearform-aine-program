"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";

interface ConnectivityStatus {
  isOnline: boolean;
  isReadOnly: boolean;
}

export const useConnectivity = (): ConnectivityStatus => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const isOnline = useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => (hydrated ? onlineManager.isOnline() : true),
    () => true
  );

  // In a real app, this might also listen to a global "maintenance" state or 503 responses
  const isReadOnly = !isOnline;

  return {
    isOnline,
    isReadOnly,
  };
};
