import type { CSSProperties } from "react";
import { site } from "../site";
import { HEIGHT, WIDTH } from "./dimensions";

// The OG card's JSX tree, rendered by Satori inside `app/og/[...slug]/route.tsx`'s
// `ImageResponse`. Composition, type scale and the five colour literals are
// reproduced verbatim from Blume's card (`renderOgImage` in the `blume/og`
// package, whose Rust/Takumi renderer produced today's live cards); this file
// is the Satori equivalent of that function, not a redesign. See §16.2/§16.5
// of the migration spec for the source measurements this file encodes.
//
// Satori (the renderer behind `next/og`'s `ImageResponse`) only supports a
// flexbox subset of CSS (`display: grid` does nothing), resolves neither
// `currentColor` nor `<style>` blocks, and needs every raster/vector asset as
// a `data:` URI rather than a file reference — three constraints this module
// is built around, not worked past.

// --- palette (§16.5) ------------------------------------------------------
//
// Converted from the light theme tokens. Three of five are exact token
// matches: FOREGROUND = --foreground, MUTED = --muted-foreground,
// BORDER = --border. The other two have no token counterpart and are named
// as such here, per the spec's instruction to call out the two literals that
// aren't token-backed:
//   - BACKGROUND is `#fafafa`, not the `--background` token's pure `#ffffff`
//     — the off-white does real work, separating the card from a white chat
//     bubble.
//   - FOOTER_FAINT (`#a3a3a3`, the footer-right site host) has no token at
//     all; it is a literal Blume's card introduced for its own purposes.
// The card is light-only and baked at build (no `prefers-color-scheme`
// variant): no social platform honours that media feature on an OG image, so
// a dark card could only be reached by a query param nothing sets.
const BACKGROUND = "#fafafa";
const FOREGROUND = "#0a0a0a";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const FOOTER_FAINT = "#a3a3a3";

// `accent` (Blume's fallback-logo tile colour) is dead code here on purpose:
// it only ever painted the fallback drawn when no logo is configured, and
// this card always configures one. Not ported — see §16.5.

// `WIDTH`/`HEIGHT` now live in `./dimensions` (task-9.2b fix round 1) — see
// that module's header for why three consumers (this file,
// `app/og/[...slug]/route.tsx`'s `ImageResponse`, and `lib/metadata.tsx`'s
// `og:image:width`/`og:image:height`) import the same two numbers instead of
// each carrying its own copy.
const PADDING = 72;
const MARK_SIZE = 32;

// The 76/64/52 Blume size tiers `titleSize()` picked between are dead code
// for this site: the headline this card actually draws is
// `getPageMeta().title` (§16.4's bare title), and the longest one that
// exists today comes from the pro blocks manifest, not from docs
// frontmatter — a category card's `` `${label} blocks` `` title, the longest
// of which measures 23 characters live ("Product Category blocks"). Even a
// hypothetical `— SevenUI`-suffixed form of that stays under the 40-char
// threshold that would have dropped a tier, so every card this repo renders
// lands on the top tier. Hard-coded rather than porting the three-branch
// function that can never take its other two branches. Because this bound
// comes from a manifest the pro repo controls and can extend, it is a
// constraint worth re-checking if that manifest ever starts generating
// longer labels — not a fact frozen at today's content.
const TITLE_SIZE = 76;

const TITLE_MAX_CHARS = 64;
// Blume truncated the description at 140 chars; §16.4 raises this to 160 —
// the smallest cap that still leaves every live frontmatter description
// (max measured: 156 chars) whole. It's a safety net for descriptions the
// pro-blocks registry adds later, not a typographic limit: see the spec for
// the box-height arithmetic that shows a 4-line description still has ~120px
// of the 486px content box to spare.
const DESCRIPTION_MAX_CHARS = 160;

/**
 * Truncate to `max` code points with a trailing ellipsis, slicing by code
 * point (not UTF-16 unit) so cutting mid-emoji can't leave a lone surrogate —
 * a broken glyph — sitting in front of the ellipsis. Copied from Blume's own
 * `truncate` (`blume/og`'s `card.ts`) unchanged; only the two call sites'
 * `max` arguments differ (see `TITLE_MAX_CHARS`/`DESCRIPTION_MAX_CHARS`
 * above).
 */
const truncate = (value: string, max: number): string => {
  const chars = [...value];
  return chars.length > max ? `${chars.slice(0, max - 1).join("").trimEnd()}…` : value;
};

// --- logomark (§16.2, A3) --------------------------------------------------
//
// The two path `d` attributes below are copied verbatim from
// `apps/web/components/logomark.tsx`. Neither that component nor
// `apps/web/public/icon.svg` (the other existing form of this mark) can be
// imported by this module: the component paints with `fill="currentColor"`,
// which Satori does not resolve (it has no concept of an inherited paint
// server the way a browser does), and the public SVG hides its actual color
// behind a `<style>` block with a `prefers-color-scheme` rule, which Satori
// does not execute at all. So the mark is redrawn here as a standalone SVG
// string with the fill already baked to `FOREGROUND`, then inlined as a
// base64 `data:` URI — exactly what §16.2 specifies and what Blume's own
// `logoMark()` (`blume/og/card.ts`) did for the equivalent step.
const LOGOMARK_SVG =
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M9.08426 12.4419C9.65668 8.91164 12.987 6.51285 16.5232 7.08412L49.549 12.4213C53.0852 12.9928 55.488 16.3176 54.9157 19.8479C54.3433 23.3782 51.013 25.7769 47.4768 25.2057L14.451 19.8685C10.9148 19.297 8.51204 15.9722 9.08426 12.4419Z" fill="${FOREGROUND}"/>` +
  `<path d="M43.1816 15.1254C45.222 12.1858 49.2627 11.4541 52.2072 13.4911C55.1516 15.528 55.8845 19.562 53.8442 22.5016L25.5487 54.2121C23.5083 57.1517 19.4676 57.8834 16.5232 55.8464C13.5787 53.8095 12.8458 49.7755 14.8861 46.8359L43.1816 15.1254Z" fill="${FOREGROUND}"/>` +
  `</svg>`;

// The mark's own viewBox is a 64x64 square, so its rendered width equals its
// height with no aspect-ratio arithmetic needed (Blume's `logoMark()` carries
// that arithmetic because its logo is configurable and need not be square;
// this card draws exactly one, known-square mark).
const LOGOMARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGOMARK_SVG).toString("base64")}`;

// --- footer strings (§16.2) -------------------------------------------------
//
// Sourced from `lib/site.ts` rather than written as literals here, per the
// spec's "Footer strings come from lib/site.ts": `useui/sevenui` is
// `site.github`'s owner/repo pair, and `sevenui.dev` is `site.url` with its
// scheme stripped (Blume's footer draws a bare host, never a scheme).
const FOOTER_REPO = `${site.github.owner}/${site.github.repo}`;
const FOOTER_SITE = site.url.replace(/^https?:\/\//, "");

// `fontFamily` is set once, on the root container, and relied on to inherit
// down through every text node below it — the same way a browser inherits
// `font-family` through plain CSS cascade, which Satori reproduces for this
// property. `ImageResponse`'s two registered "Geist" weights (400 and 600;
// see the route file) are then selected per node by each text node's own
// `fontWeight`, exactly as a browser would pick a face from a `@font-face`
// family with two weight variants.
const rootStyle: CSSProperties = {
  backgroundColor: BACKGROUND,
  color: FOREGROUND,
  display: "flex",
  flexDirection: "column",
  fontFamily: "Geist",
  height: HEIGHT,
  justifyContent: "space-between",
  padding: PADDING,
  width: WIDTH,
};

export type OgCardProps = {
  /** The page's own bare title (§16.4) — never `pageTitle()`'s suffixed form. */
  title: string;
  /** The page's own description, or `site.description` for a page with none. */
  description: string;
};

/** The 1200x630 OG card JSX tree. See this module's header for provenance. */
export function OgCard({ title, description }: OgCardProps) {
  return (
    <div style={rootStyle}>
      {/* Header: the logomark alone, 32x32, no wordmark (§16.2). */}
      <div style={{ alignItems: "center", display: "flex" }}>
        <img alt="" height={MARK_SIZE} src={LOGOMARK_DATA_URI} width={MARK_SIZE} />
      </div>

      {/* Headline + description. */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: FOREGROUND,
            fontSize: TITLE_SIZE,
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 1.05,
            maxWidth: 1010,
            textWrap: "balance",
          }}
        >
          {truncate(title, TITLE_MAX_CHARS)}
        </div>
        <div
          style={{
            color: MUTED,
            fontSize: 30,
            lineHeight: 1.4,
            marginTop: 28,
            maxWidth: 900,
            textWrap: "balance",
          }}
        >
          {truncate(description, DESCRIPTION_MAX_CHARS)}
        </div>
      </div>

      {/* Footer: a 1px rule, then the repo/site row. */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ backgroundColor: BORDER, height: 1, width: "100%" }} />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginTop: 28,
            width: "100%",
          }}
        >
          <div style={{ color: MUTED, fontSize: 22 }}>{FOOTER_REPO}</div>
          <div style={{ color: FOOTER_FAINT, fontSize: 22 }}>{FOOTER_SITE}</div>
        </div>
      </div>
    </div>
  );
}
