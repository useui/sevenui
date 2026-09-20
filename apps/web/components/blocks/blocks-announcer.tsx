"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/**
 * The /blocks gallery's ONE live region, and the `announce()` every card's
 * toolbar writes through. Ported from the live region in
 * `legacy-components/blocks-prefs.astro` plus the `announce()` helper in
 * `legacy-components/block-frame.astro`'s Announcements section.
 *
 * Mounted once, by the /blocks layout (Task 5.2), above every
 * `<BlockCard>` — one region per page, not one per card, exactly as the
 * Astro source had it. A category page renders up to six cards and every
 * one of them announces through this single node.
 *
 * TWO NON-OBVIOUS RULES, both carried over from the source because each of
 * them is a defect that was already fixed once:
 *
 *   1. The region must ALREADY EXIST and be EMPTY before its text changes.
 *      A region injected together with its content announces nothing. That
 *      is why the node below renders unconditionally with an empty string —
 *      it is in the server-rendered HTML from first paint, never mounted on
 *      demand at the moment something has to be said.
 *   2. It must be CLEARED BETWEEN WRITES, or a second identical message is
 *      silent. `announce()` therefore empties it first and writes the text
 *      on the next frame, which is the same two-step the Astro script did
 *      with `region.textContent = ""` + `requestAnimationFrame`.
 *
 * Both rules are about assistive technology only; nothing here is ever
 * seen. `sr-only` keeps it out of the visual layout.
 */

const AnnounceContext = createContext<((message: string) => void) | null>(null);

export function BlocksAnnouncer({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const announce = useCallback((text: string) => {
    // Rule 2, in React terms. Emptying and re-filling in the SAME render
    // pass would be one DOM write of the final value, and a repeated
    // message would never change the node's text — so nothing would be
    // announced. The frame in between is what makes the region go empty
    // first, as a real DOM state a screen reader observes.
    setMessage("");
    requestAnimationFrame(() => setMessage(text));
  }, []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      {/*
        Rendered after `children` purely so the provider reads top-down;
        a polite live region's position in the document does not affect
        when or whether it is announced. What DOES matter is rule 1 above:
        this element is present, and empty, on first paint.
        `id` is kept from the Astro source — nothing queries it any more,
        but it is a stable handle for a11y tooling and for the production
        HTML baseline to line up against.
      */}
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

/**
 * Say something through the gallery's live region. Throws when no
 * `<BlocksAnnouncer>` is above it, matching `useDrawer()`
 * (`components/drawer-context.tsx`): a toolbar whose confirmations silently
 * go nowhere is worse than a loud failure at the first render.
 */
export function useAnnounce(): (message: string) => void {
  const announce = useContext(AnnounceContext);
  if (!announce) {
    throw new Error("useAnnounce must be used within a BlocksAnnouncer");
  }
  return announce;
}
