"use client";

import { FC, useEffect, useState } from "react";
import { useConnectivity } from "@/shared/hooks/use-connectivity";

export const OfflineReadOnlyBanner: FC = () => {
  const { isReadOnly } = useConnectivity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReadOnly) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 bg-[#D97706] px-4 py-2 text-center text-sm font-medium text-white shadow-md transition-all animate-in fade-in slide-in-from-top-full duration-300"
    >
      <p>
        You are offline. Changes cannot be saved until connection is restored.
      </p>
    </div>
  );
};
