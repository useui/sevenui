// Ported verbatim from the live 404 (`legacy-pages/404.astro`, rendered
// markup unchanged; `class` -> `className`): the "404" display line, the
// `Page not found` h1, the "couldn't find" sentence, and the accent button
// back to `/`. Its internal link uses `next/link` for the same reason
// `SiteFooter`'s do — a soft client-side transition instead of a full
// document reload (spec §11.1).
//
// `app/not-found.tsx` renders inside the root layout, so the real
// `SiteHeader`/`SiteFooter` arrive for free. The live 404 ships Blume's
// *default* header (logo plus GitHub only, zero `<nav>` elements) because the
// generated `404.astro` never receives the `layout={{ Header }}` override
// the six custom pages pass — that is a defect corrected as a side effect of
// this port's structure, not new work here.
import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMetadata } from "../lib/metadata";

// Blume sets `noindex` on its 404. Next 16 injects the same
// `<meta name="robots" content="noindex">` on its own for any route resolved
// through `not-found.tsx` — confirmed by building this file with an explicit
// `robots` field and finding the tag duplicated (one framework-injected, one
// of ours, the second carrying an unwanted `nofollow`). The field was
// removed as a result: declaring it here only reproduced what Next already
// does, and the live page carries exactly one `noindex` tag with no
// `nofollow`, so relying on the injection is what matches it. This is an
// implicit dependency on framework behaviour rather than a written contract;
// Stage 8 owns the head/meta surface and re-checks it there. The title
// suffix is intended diff #28 (§17.6): the 404 sat outside the 85-route
// audit that set §15.8's "bare landing page only" exception, but a rule with
// an exceptions list stops being a rule.
//
// `notFoundMetadata()` (task-9.2b) reproduces production's reduced,
// image-less `og:*`/`twitter:*` set for a missing page — measured on
// `https://sevenui.dev/not-a-real-page`, see `lib/metadata.tsx` for the exact
// seven tags and why there are only seven.
export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">We couldn&apos;t find the page you&apos;re looking for.</p>
      <Link className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" href="/">
        Back to home
      </Link>
    </div>
  );
}
