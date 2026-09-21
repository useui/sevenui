"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

const MAX_CONCURRENT = 3;

export interface BlockLoadGate {
  register(iframe: HTMLIFrameElement, onGrant: () => void): () => void;
  /** Hand a slot back. Idempotent — `load` and `error` may both fire. */
  release(iframe: HTMLIFrameElement): void;
}

interface Gate extends BlockLoadGate {
  dispose(): void;
}

function createGate(): Gate {
  const grants = new Map<HTMLIFrameElement, () => void>();
  const queue: HTMLIFrameElement[] = [];
  const holding = new Set<HTMLIFrameElement>();
  let inFlight = 0;
  let observer: IntersectionObserver | null = null;

  function pump() {
    while (inFlight < MAX_CONCURRENT && queue.length > 0) {
      const target = queue.shift()!;
      const grant = grants.get(target);
      // Unregistered while it sat in the queue: its card unmounted.
      if (!grant) continue;
      inFlight += 1;
      holding.add(target);
      grant();
    }
  }

  function release(target: HTMLIFrameElement) {
    if (!holding.delete(target)) return;
    inFlight -= 1;
    pump();
  }

  function ensureObserver(): IntersectionObserver {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          queue.push(entry.target as HTMLIFrameElement);
        }
        pump();
      },
      // A full viewport of lead time.
      { rootMargin: "100% 0px" },
    );
    return observer;
  }

  return {
    register(iframe, onGrant) {
      grants.set(iframe, onGrant);
      ensureObserver().observe(iframe);
      return () => {
        grants.delete(iframe);
        observer?.unobserve(iframe);
        release(iframe);
      };
    },
    release,
    dispose() {
      observer?.disconnect();
      observer = null;
      grants.clear();
      queue.length = 0;
      holding.clear();
      inFlight = 0;
    },
  };
}

const LoadGateContext = createContext<BlockLoadGate | null>(null);

export function BlocksLoadGate({ children }: { children: ReactNode }) {
  const ref = useRef<Gate | null>(null);
  ref.current ??= createGate();
  const gate = ref.current;

  useEffect(() => () => gate.dispose(), [gate]);

  return <LoadGateContext.Provider value={gate}>{children}</LoadGateContext.Provider>;
}

export function useBlockLoadGate(): BlockLoadGate {
  const gate = useContext(LoadGateContext);
  if (!gate) {
    throw new Error("useBlockLoadGate must be used within a BlocksLoadGate");
  }
  return gate;
}
