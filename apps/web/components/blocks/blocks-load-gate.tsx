"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

/**
 * The preview loading queue for the whole /blocks gallery, ported from the
 * "Preview loading" section of `legacy-components/block-frame.astro`.
 *
 * WHY IT IS A LAYOUT-LEVEL CONTEXT AND NOT A PER-CARD OBSERVER. The cap is
 * the feature. Every card renders a live application, and a category page
 * renders up to six of them; booting all six at once starves the ones
 * actually on screen, and is the difference between a gallery that scrolls
 * and one that stalls. A cap can only be enforced by something that sees
 * every card, so the queue lives once, above them all, and hands out a
 * "you may load now" grant. Six cards each running their own
 * IntersectionObserver would observe correctly and cap nothing.
 *
 * MAX_CONCURRENT is 3, unchanged from the source.
 *
 * The rest of the shape is the source's, one for one: previews are observed
 * with a full viewport of lead time (`rootMargin: "100% 0px"`), so by the
 * time a card scrolls into view its preview has usually finished booting;
 * a target is unobserved the moment it first intersects and queued; and a
 * grant is handed back on BOTH `load` and `error`, at most once, because a
 * frame that never fires `load` (blocked, aborted) would otherwise hold a
 * slot forever and stall the rest of the page.
 *
 * Mounted once, by the /blocks layout (Task 5.2). The Astro version needed
 * an `astro:before-swap` listener to disconnect its observers, since a
 * ClientRouter swap left the module running with detached targets pinned in
 * memory; here unmounting the provider disconnects the observer, which is
 * the same guarantee with nothing to remember.
 */

const MAX_CONCURRENT = 3;

export interface BlockLoadGate {
  /**
   * Watch `iframe` and call `onGrant` when its turn comes. Returns a
   * cleanup that stops watching it and releases any slot it still holds.
   */
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
  // Created on first `register`, which only ever runs in an effect — so
  // this module stays importable during server rendering, where there is
  // no IntersectionObserver to construct.
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
    // The set membership IS the "settled once" guard the source kept as a
    // local boolean: a second call for a target that already handed its
    // slot back cannot decrement `inFlight` twice.
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
  // A ref, not `useMemo`: the queue is real mutable state that every card
  // on the page shares, and React is free to discard a memo and recompute
  // it. Recomputing this one would silently reset the cap mid-page.
  const ref = useRef<Gate | null>(null);
  ref.current ??= createGate();
  const gate = ref.current;

  useEffect(() => () => gate.dispose(), [gate]);

  return <LoadGateContext.Provider value={gate}>{children}</LoadGateContext.Provider>;
}

/**
 * The gallery's shared loading queue. Throws when no `<BlocksLoadGate>` is
 * above it, matching `useDrawer()` (`components/drawer-context.tsx`) — a
 * missing provider means no preview would ever receive a grant, so the
 * whole gallery would render six empty frames with no error anywhere.
 */
export function useBlockLoadGate(): BlockLoadGate {
  const gate = useContext(LoadGateContext);
  if (!gate) {
    throw new Error("useBlockLoadGate must be used within a BlocksLoadGate");
  }
  return gate;
}
