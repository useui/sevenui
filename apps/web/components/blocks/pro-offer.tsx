import Link from "next/link";

/**
 * The one commercial band on the /blocks section, rendered by all three pages
 * (directory, group, category) directly below their header. Ported verbatim
 * from `legacy-components/pro-offer.astro` — static markup, no props.
 *
 * It used to be a "Get Pro" outline pill inside the category header's prose
 * wrapper, which pinned it to the 672px measure rather than the content
 * column — leaving it floating in ~700px of empty space, grouped by proximity
 * with the title it has nothing to do with, and sharing the h1's optical line
 * while styled weaker than it. The other two pages said the same thing two
 * other ways: an inline underlined link on the directory, nothing at all on
 * the group page.
 *
 * So the offer gets its own band, spanning the real column and sitting
 * immediately above the gated content it is about. Wording is lifted verbatim
 * from /pro — the price is a claim, and it lives in exactly one place.
 *
 * The line breaks inside the paragraph are load-bearing, not formatting.
 * JSX collapses a newline-plus-indent between two text chunks into one space
 * and DELETES it entirely before an element — which is the same rule Astro
 * applied, so this layout reproduces production's bytes exactly, including the
 * absent space between the em dash and "$99 lifetime". Reflowing the
 * paragraph would silently change the rendered text.
 */
export function ProOffer() {
  return (
    <div className="border-b border-border bg-muted/30 px-6 py-5 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Every block here is <span className="font-medium text-foreground">Pro</span>.
          One purchase, yours forever —
          <span className="font-medium text-foreground">$99 lifetime</span>, rising to
          $249 once the catalog launches.
        </p>
        <Link
          className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/pro"
        >
          Pre-order — $99
        </Link>
      </div>
    </div>
  );
}
