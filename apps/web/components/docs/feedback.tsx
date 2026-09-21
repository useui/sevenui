"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

/**
 * The "Was this page helpful?" control (§11.3), ported from
 * `blume/components/layout/PageFeedback.astro`. Rendered by
 * `app/docs/[[...slug]]/page.tsx` directly after the `<article>` and
 * directly before `<DocsPagination>` — `RootLayout.astro:692-706`'s order.
 * Both blocks carry the same top margin and top rule, so they stack as two
 * separately-ruled strips; that is Blume's own layout, not a duplication.
 *
 * `"use client"` because the whole point is a click handler. The one value
 * it cannot compute for itself — the page's own title — is handed down from
 * the server page, which is also what keeps `lib/page-meta.ts` (transitively
 * `server-only` since Task 2.5) out of the client graph.
 *
 * THE GA4 CONTRACT, reproduced exactly with one changed field:
 *
 *   gtag("event", "feedback", { helpful: "yes" | "no", path, title })
 *
 * Event name and prop names are Blume's, so the existing series continues
 * rather than restarting under a new name. `path` stays `location.pathname`
 * — it is the series' real key, and it is read at click time rather than
 * from `usePathname()` so it reports the same string GA4's own page_view
 * reported. `title` is the §17.6 #25 change: Blume sent `document.title`,
 * which carries the em-dash site suffix (§15.8); this sends the BARE title.
 * §15.8 moves that value at cutover regardless, so if it has to change once,
 * it should change to the one that carries no separator and will not move
 * again.
 *
 * FOUR DEAD SINKS ARE DROPPED. Blume's `track()` fans one call out to five
 * places: Vercel Web Analytics, `posthog.capture`, `gtag`, `plausible`, and
 * a `blume:track` CustomEvent. Only gtag is configured on this site
 * (`components/analytics.tsx`, `G-8702Z28SMN`); Vercel analytics and
 * PostHog are not enabled (§14.5, §14.7), Plausible does not exist here, and
 * the CustomEvent has no listener anywhere in the repo. So this calls gtag
 * and nothing else. The optional call also means the event simply does not
 * fire in development, where `Analytics` renders nothing — same as today,
 * where `track()` no-ops with no provider present.
 *
 * NO DEDUP, deliberately. There is none today: the click hides the buttons
 * and reveals the thanks, but `astro:after-swap` re-runs the init against
 * fresh server markup, so the widget resets on every navigation and repeat
 * votes are already possible. This reproduces that exactly without trying —
 * the control lives in the PAGE, not the persistent layout, so a navigation
 * remounts it and `voted` starts false again. Adding a guard would be new
 * behaviour, not a port.
 */

// Blume's `buttonClass`, one source string shared by both buttons, with the
// 12px Blume radius token replaced by the 8px utility (§17.6 #27, §8.3).
// This is the 4th of the four elements that carried that token — note it is
// one occurrence in the source and two elements on the page.
const buttonClass =
  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground text-sm transition-colors hover:border-foreground";

// GA4's global, declared locally rather than in a global `.d.ts`: this is
// the only caller, and widening `Window` app-wide would let any future file
// call `window.gtag` without noticing that it is only defined in production.
type GtagWindow = Window & {
  gtag?: (command: "event", event: string, props: Record<string, string>) => void;
};

export function DocsFeedback({ title }: { title: string }) {
  const [voted, setVoted] = useState(false);

  const vote = (helpful: "no" | "yes") => {
    (window as GtagWindow).gtag?.("event", "feedback", {
      helpful,
      path: location.pathname,
      title,
    });
    setVoted(true);
  };

  return (
    <section
      aria-label="Was this page helpful?"
      className="mx-auto mt-12 flex max-w-content items-center justify-between gap-4 border-border border-t pt-6"
    >
      <p className="text-muted-foreground text-sm">Was this page helpful?</p>
      {/*
        Blume hid this row by ADDING the display-none utility next to the
        flex one and letting source order in the generated sheet settle the
        tie. Swapping the whole class string instead of appending removes
        that dependency on utility ordering entirely; the pre-click markup —
        the only state that reaches the prerendered HTML — is byte-identical
        either way.
      */}
      <div className={voted ? "hidden" : "flex items-center gap-2"}>
        <button className={buttonClass} onClick={() => vote("yes")} type="button">
          <ThumbsUp aria-hidden="true" size={16} />
          Yes
        </button>
        <button className={buttonClass} onClick={() => vote("no")} type="button">
          <ThumbsDown aria-hidden="true" size={16} />
          No
        </button>
      </div>
      {/*
        Server-rendered and hidden, not injected on click — as in Blume, so
        the string is in the document from the start and the swap is a class
        change rather than a DOM insertion.
      */}
      <p className={voted ? "text-muted-foreground text-sm" : "hidden text-muted-foreground text-sm"}>
        Thanks for your feedback!
      </p>
    </section>
  );
}
