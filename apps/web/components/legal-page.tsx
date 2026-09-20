import type { ReactNode } from "react";
import { LandingRuler } from "./landing-ruler";

// Shared chrome for the legal pages (`/terms`, `/privacy`). Ported from
// `legacy-components/legal-page.astro`'s markup only — its header, drawer,
// footer, theme and skip link are `app/layout.tsx`'s job now (§11.1), and
// its `.l-row`/`.l-marks` canvas rules and its `.legal` prose scale both
// live in `app/globals.css`: the canvas rules moved there in Task 4.1
// because the landing page draws the same rails and crop marks, and the
// prose scale moved there in this task because CSS-in-a-component-file has
// no equivalent for the plain global element selectors the source used
// (`.legal h1`, `.legal h2`, …).
//
// `title`/`updated` are the only two pieces of the source's four props this
// component still needs: `route` and `description` fed the Astro layout's
// own metadata plumbing, which is now each page's own `generateMetadata`
// (reading `lib/page-meta.ts`) — carrying them here would just be a second,
// unused copy.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="relative">
      <LandingRuler />

      <section className="border-b border-border">
        <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
          <span>{title}</span>
          <span className="text-end">Last updated {updated}</span>
        </div>
        <div className="l-row">
          <article className="legal max-w-[68ch] px-6 py-14 sm:px-10">
            <h1>{title}</h1>
            {children}
          </article>
        </div>
      </section>
    </div>
  );
}
