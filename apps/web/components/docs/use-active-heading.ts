"use client";

import { useEffect, useState } from "react";

/**
 * The docs TOC scroll-spy, ported from `blume/components/layout/toc-element.ts`
 * (the `<blume-toc>` custom element). It returns the id of the heading the
 * reader is currently in, and the two TOC renderers in `toc.tsx` turn that into
 * `aria-current="location"` on the matching link.
 *
 * ONE hook, not one per renderer. Blume mounted `<blume-toc>` twice per docs
 * page — once around the mobile `<details>` list and once around the desktop
 * aside list — so every page ran two IntersectionObservers, two scroll
 * listeners and two independent `aria-current` writes over the same headings.
 * Here the docs layout calls this once and feeds both renderers through
 * context, so there is one observer and one listener per page.
 *
 * `aria-current` is NOT server-rendered. Blume's `connectedCallback` ran only
 * in the browser, so its shipped HTML carries no `aria-current` on any TOC link
 * either (verified in `dist/docs/components/button/index.html`: its four
 * `aria-current` attributes are all the nav's and the header's `"page"`). The
 * initial state below is therefore `null`, and the first value arrives from the
 * effect after mount — which is also where Blume's own first `#update()` ran.
 */

// Matches the theme's `scroll-padding-top: 4.5rem` (`app/globals.css`), so the
// highlighted heading agrees with where a clicked anchor lands beneath the
// sticky header.
const TRIGGER_OFFSET = 72;

type Entry = { heading: HTMLElement; id: string };

/**
 * `#activeLink()` verbatim, with ids standing in for the `<a>` elements.
 *
 * Three details that are easy to lose:
 * - the document-bottom branch FORCES the last entry, with a 2px tolerance —
 *   without it a final section too short to push its heading past the trigger
 *   line can never become active;
 * - the default is the FIRST entry, not `null`, so at the top of the page the
 *   first TOC link is already highlighted;
 * - the walk keeps going after a match, because headings are in document order
 *   and the LAST one to have reached the trigger line is the one being read.
 */
function activeIdFor(entries: Entry[]): string | null {
  const scrolledToBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (scrolledToBottom) {
    return entries.at(-1)?.id ?? null;
  }

  let active = entries[0]?.id ?? null;
  for (const { heading, id } of entries) {
    if (heading.getBoundingClientRect().top <= TRIGGER_OFFSET) {
      active = id;
    }
  }
  return active;
}

export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  // The effect depends on the JOINED id list, not on the array, because the
  // caller derives `ids` from the content index on every render and a fresh
  // array identity would re-subscribe on each one. Ids come from
  // `github-slugger` (`lib/docs/headings.ts`), which emits neither newlines nor
  // NUL, so joining is lossless for this input.
  const key = ids.join("\n");

  useEffect(() => {
    const resolved = key.length > 0 ? key.split("\n") : [];

    // Blume built its entry list only from links whose target heading actually
    // EXISTS, and that filter is load-bearing rather than defensive: a TOC
    // entry with no element in the page would contribute a bogus rect to the
    // walk above and drag `active` with it. We already hold the ids, so the
    // lookup is `getElementById` rather than Blume's
    // `querySelector('#' + CSS.escape(decodeURIComponent(link.hash.slice(1))))`
    // — it needs no escaping and no percent-decoding, because the id never
    // makes the round trip through a URL here.
    //
    // The RENDERERS still list every heading the content index reports, exactly
    // as Blume's markup did; this filter only decides which ones can win.
    const entries: Entry[] = [];
    for (const id of resolved) {
      const heading = document.getElementById(id);
      if (heading) {
        entries.push({ heading, id });
      }
    }
    if (entries.length === 0) {
      setActiveId(null);
      return;
    }

    // `setActiveId` with an unchanged string is a no-op in React, which is
    // exactly what Blume's `#current` comparison bought by hand.
    const update = () => setActiveId(activeIdFor(entries));

    // The observer's callback deliberately IGNORES its own entries and only
    // triggers a recompute. That is not ceremony: Stage 2 hydrates 84 demos on
    // load, which moves headings with no scroll event at all, and the scroll
    // listener below cannot see that.
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${TRIGGER_OFFSET}px 0px -70% 0px`,
      threshold: 0,
    });
    for (const { heading } of entries) {
      observer.observe(heading);
    }

    // rAF-throttled, with the same one-flag guard. No `{ passive: true }`:
    // `scroll` is not cancelable, so the option would be a no-op — Blume's
    // source says so in place, and adding it here would fix nothing.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll);

    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return activeId;
}
