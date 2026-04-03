"use client";

import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";

interface ConnectivityStatus {
  isOnline: boolean;
  isReadOnly: boolean;
}

export const useConnectivity = (): ConnectivityStatus => {
  const isOnline = useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
    () => true // Hydration fallback: assume online on server
  );

  // In a real app, this might also listen to a global "maintenance" state or 503 responses
  const isReadOnly = !isOnline;

  return {
    isOnline,
    isReadOnly,
  };
};
