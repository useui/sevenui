import Link from "next/link";
import type { Category } from "../../lib/blocks";

/**
 * One category card, ported class-for-class from
 * `legacy-components/category-card.astro`: a 16:9 cover, then label + block
 * count, then the description. Three cover states, all three preserved —
 * a cover with a dark variant (two images, one suppressed per theme), a cover
 * without one (a single image, no theme-conditional class at all), and no
 * cover (`/placeholder.svg`, which deliberately carries a SHORTER class list:
 * no transition and no hover scale).
 *
 * THE THEME VARIANT. The two-image state relies on Tailwind's `dark` variant
 * resolving against the `data-theme` attribute rather than a `.dark` class or
 * an OS media query; if that ever stops being true the card goes invisible in
 * one theme, silently. Both halves of it were confirmed against this app
 * before this file was written:
 *   - `app/globals.css:31` declares
 *     `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));`
 *   - `components/theme-provider.tsx` configures next-themes with
 *     `attribute="data-theme"`.
 * The Astro source's comment worried about exactly this and pointed at Blume's
 * generated entry; in this app the declaration is ours, in our own sheet.
 *
 * `next/link` for the outer anchor — client-side navigation is the whole
 * reason for the migration. But the covers stay plain `<img loading="lazy">`
 * and NOT `next/image`: they are absolute `https://` URLs owned by the pro
 * repo (the manifest schema enforces that), and routing them through the image
 * optimizer would change their bytes, their URL and their caching, none of
 * which this stage is asking for.
 *
 * As of the live manifest every one of the 19 categories ships a cover WITH a
 * dark variant, so the other two states are unexercised in production today.
 * They are still ported, because the pro repo owns the manifest and can add a
 * coverless category without touching this repo at all.
 */
export function CategoryCard({ group, category }: { group: string; category: Category }) {
  const cover = category.cover;

  return (
    <Link className="group block" href={`/blocks/${group}/${category.id}`}>
      <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted/30">
        {cover ? (
          <>
            <img
              alt=""
              className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${cover.darkSrc ? "dark:hidden" : ""}`}
              loading="lazy"
              src={cover.src}
            />
            {cover.darkSrc && (
              <img
                alt=""
                className="hidden h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] dark:block"
                loading="lazy"
                src={cover.darkSrc}
              />
            )}
          </>
        ) : (
          <img alt="" className="h-full w-full object-cover" loading="lazy" src="/placeholder.svg" />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        {/*
          The legacy Astro site set tight letter-spacing on every bare
          `h1`-`h6` globally. This port dropped that rule and then, in task
          11.1e (2026-09-21), RESTORED it — the assumption it was dropped on,
          that the chrome's headings all carry their own spacing class, was
          measured and found false for seven authored headings plus every
          heading the registry renders on `/components`. See `globals.css`'s
          `:is(h1,…,h6)` rule and §8.3 entry 4.

          So the `tracking-tighter` below is now REDUNDANT rather than
          load-bearing: the global rule supplies the same -0.05em. It is kept
          deliberately, for the same reason the docs `h2`/`h3`/`h1` overrides
          state theirs — the heading says what it is without depending on a
          rule in another file — and it is verified inert: `/blocks` headings
          computed identically before and after the rule was restored.
          (The old wording here called this label one of "the two chrome headings"
          that assumption missed. That count was wrong — it is part of why
          the rule came back. Prefer the rule to a census.)
        */}
        <h3 className="text-sm font-medium tracking-tighter">{category.label}</h3>
        {/*
          One template literal rather than the Astro source's two adjacent
          expressions with a space between them. The rendered characters are
          identical; the difference is that React's SSR writer separates two
          adjacent text children with an empty HTML comment, and a single
          expression is a single text node with no separator. Production emits
          the bare text, so this keeps the bytes matching rather than adding an
          undeclared marker to 24 pages.
        */}
        <span className="text-xs text-muted-foreground">
          {`${category.items.length} ${category.items.length === 1 ? "block" : "blocks"}`}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
    </Link>
  );
}
