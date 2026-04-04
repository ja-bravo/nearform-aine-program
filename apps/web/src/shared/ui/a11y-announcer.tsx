"use client";

import { FC, useEffect, useState, useRef } from "react";

export const A11Y_ANNOUNCE_EVENT = "a11y-announce";

export const A11yAnnouncer: FC = () => {
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleAnnouncement = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setAnnouncement(customEvent.detail);

      // Clear announcement after a short delay so the same announcement can be repeated
      timerRef.current = setTimeout(() => {
        setAnnouncement("");
        timerRef.current = null;
      }, 3000);
    };

    window.addEventListener(A11Y_ANNOUNCE_EVENT, handleAnnouncement);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener(A11Y_ANNOUNCE_EVENT, handleAnnouncement);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      role="status"
      className="sr-only"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
};

export const announce = (message: string) => {
  const event = new CustomEvent(A11Y_ANNOUNCE_EVENT, { detail: message });
  window.dispatchEvent(event);
};
