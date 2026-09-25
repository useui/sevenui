"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const AnnounceContext = createContext<((message: string) => void) | null>(null);

export function Announcer({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const announce = useCallback((text: string) => {
    setMessage("");
    requestAnimationFrame(() => setMessage(text));
  }, []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        id="sevenui-announcer"
        role="status"
      >
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce(): (message: string) => void {
  const announce = useContext(AnnounceContext);
  if (!announce) {
    throw new Error("useAnnounce must be used within an Announcer");
  }
  return announce;
}
