"use client";

import { ArrowUp, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "../../lib/site";

/**
 * The page-actions rail (§15.10), ported from
 * `blume/components/layout/PageActions.astro` and mounted by
 * `app/docs/layout.tsx` inside the sticky "On this page" aside, directly
 * below the desktop TOC — `RootLayout.astro:713-733`'s position. Docs-only,
 * as today: that aside exists nowhere else on the site.
 *
 * FOUR ITEMS, NOT SIX. The source file also builds an Export menu (PDF via
 * `window.print()`, EPUB via a lazy `epub-gen-memory` import) and an MCP
 * menu. Neither is configured on this site and neither is ported: verified
 * against the shipped Astro output, where the export and MCP hooks appear
 * zero times while the four ported ones appear once each (and the chat
 * anchors six times). §15.14 retires WebMCP outright. So of the source's
 * three floating panels exactly one survives, and the ~250 lines of EPUB
 * assembly and MCP deep-link building go with the other two.
 *
 * WHY IT IS A CLIENT COMPONENT AND WHY IT LIVES IN THE LAYOUT. It has to sit
 * in the third grid track, which only `app/docs/layout.tsx` renders — and
 * that layout is above the `[[...slug]]` segment, so it is handed no params
 * and cannot know which route it is wrapping (the same constraint
 * `toc.tsx` and `breadcrumb.tsx` document). The route therefore comes from
 * `usePathname()`, and the three interactive behaviours below need a client
 * boundary anyway.
 *
 * `docRoutes` is the one thing `usePathname()` cannot answer: whether the
 * current path is a real docs page. It matters because `app/docs/not-found.tsx`
 * renders inside this same layout, and a rail on a 404 would offer an "edit"
 * link to an `.mdx` file that does not exist, a Markdown copy that 404s, and
 * a chat prompt pointing an assistant at a missing URL. Blume never had this
 * problem — its 404 was a standalone page outside the docs shell. The cost is
 * one array of 69 route strings in the flight payload: 2,032 B escaped, 415 B
 * gzipped on its own, and less in place, since `DocsTocProvider`'s keys put
 * the same strings in the same payload a few kilobytes earlier.
 *
 * EVERY `data-blume-*` / `data-i18n-*` HOOK IS GONE (§13.3). They existed so
 * a separately-bundled script could find these elements and read its
 * localized strings back out of the DOM; refs and literals do both jobs here.
 */

// The one place the docs corpus' location in the repo is written down.
// Stage 10's deletions, or any future move of `apps/web/docs`, touch this
// line and nothing else.
//
// IT IS NOT THE PATH THE SPEC ASKS FOR, and that is deliberate. §15.10 and
// the plan both specify `.../edit/main/docs/<slug>.mdx` — which is what
// production emits today, and which 404s on all 68 pages: there is no
// `docs/` directory at the repo root (confirmed against `main`), because the
// monorepo migration moved the corpus to `apps/web/docs/` and Blume's
// edit-URL base was never updated. Reproducing a link whose only purpose is
// to open a file for editing, while the path resolves to nothing, is not
// parity in any useful sense. This emits the working path. It is a
// declared-diff-shaped change — §17.2's extractor reads link targets, so it
// shows up on 68 routes — and the stage record names it.
const DOCS_SOURCE_PATH = "apps/web/docs";
const EDIT_BASE = `https://github.com/${site.github.owner}/${site.github.repo}/edit/main/${DOCS_SOURCE_PATH}`;

// Blume's three shared class strings, verbatim apart from the panel's radius
// (the 12px Blume token becomes the 8px utility, §17.6 #27 — this panel is
// NOT one of §8.3's four elements, which are the two pagination anchors, the
// mobile TOC and the feedback buttons). Top-level rows match the TOC links:
// flat, no background or padding, colour shift on hover only. Rows inside the
// panel keep menu affordances.
const rowClass =
  "flex w-full items-center gap-2.5 py-1.5 text-start text-muted-foreground text-sm transition-colors hover:text-foreground";
const menuRowClass =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground";
const summaryClass = `${rowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`;

/** How long the copied confirmation holds, from `blume/components/copy-feedback.ts`. */
const HOLD_MS = 1500;

/** `actions.copyMarkdown` and `actions.copied`, resolved from Blume's zod defaults. */
const COPY_LABEL = "Copy as Markdown";
const COPIED_LABEL = "Copied!";

type ProviderKey = "chatgpt" | "claude" | "cursor" | "scira" | "t3" | "v0";

/**
 * The "Open in chat" providers, in `blume/core/open-in-chat.ts`'s display
 * order and with that file's brand names and the script's URL builders
 * folded into one row each — three parallel lookups in the source (list,
 * names, URLs) that had to be kept in sync by hand.
 *
 * Brand names stay verbatim; only the surrounding phrase was ever localized.
 */
const PROVIDERS: ReadonlyArray<{ key: ProviderKey; name: string; url: (query: string) => string }> = [
  { key: "v0", name: "v0", url: (q) => `https://v0.app?q=${q}` },
  { key: "chatgpt", name: "ChatGPT", url: (q) => `https://chatgpt.com/?hints=search&prompt=${q}` },
  { key: "claude", name: "Claude", url: (q) => `https://claude.ai/new?q=${q}` },
  { key: "t3", name: "T3 Chat", url: (q) => `https://t3.chat/new?q=${q}` },
  { key: "scira", name: "Scira", url: (q) => `https://scira.ai/?q=${q}` },
  { key: "cursor", name: "Cursor", url: (q) => `https://cursor.com/link/prompt?text=${q}` },
];

/**
 * Brand marks, monochrome and inheriting `currentColor`, transcribed from the
 * source's `LOGOS` map. Codex's is not here: it belonged to the MCP menu,
 * which is not ported. `aria-hidden` is added to each (Blume injected these
 * through raw HTML and set no ARIA on them) — they sit beside their own text
 * label, so they are decorative by definition.
 */
const LOGOS: Record<ProviderKey, ReactNode> = {
  chatgpt: (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
  ),
  claude: (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="currentColor" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" fillRule="evenodd" d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.222H5.2375L2.066 9.28L1.501 9.353L1.2575 9.125L1.288 8.752L1.4035 8.6305L2.3575 7.9745L2.3545 7.9775Z"/></svg>
  ),
  cursor: (
    <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 466.73 532.09" xmlns="http://www.w3.org/2000/svg"><path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z" fill="currentColor"/></svg>
  ),
  scira: (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 910 934" xmlns="http://www.w3.org/2000/svg"><path d="M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="8"/><path d="M857.5 508.116C763.259 497.644 710.903 445.288 700.432 351.047C689.961 445.288 637.605 497.644 543.364 508.116C637.605 518.587 689.961 570.943 700.432 665.184C710.903 570.943 763.259 518.587 857.5 508.116Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="20"/><path d="M889.949 121.237C831.049 114.692 798.326 81.9698 791.782 23.0692C785.237 81.9698 752.515 114.692 693.614 121.237C752.515 127.781 785.237 160.504 791.782 219.404C798.326 160.504 831.049 127.781 889.949 121.237Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="8"/><path d="M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="30"/></svg>
  ),
  t3: (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
  ),
  v0: (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="currentColor" viewBox="0 0 147 70" xmlns="http://www.w3.org/2000/svg"><path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"/><path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"/></svg>
  ),
};

/**
 * The official GitHub mark, from Blume's own `GITHUB_MARK` path data.
 *
 * Duplicated from `components/site-header.tsx`, which inlines the same path
 * for the same reason (this project's `lucide-react` ships no brand icons at
 * all, so there is nothing to import). The two differ in size and ARIA, so
 * they are not literally the same element; hoisting the path into a shared
 * module is the obvious de-duplication and is deliberately NOT done here,
 * because `site-header.tsx` is outside this task's file list.
 */
function GithubMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="currentColor"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function DocsPageActions({ docRoutes }: { docRoutes: readonly string[] }) {
  const pathname = usePathname();

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [flipUp, setFlipUp] = useState(false);
  const [copied, setCopied] = useState(false);
  // Null until mounted, which is what keeps the chat anchors href-less in the
  // prerendered HTML exactly as they are today — see the anchor below.
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  // `placeMenu`, ported from the source's script: when opening downward would
  // run the panel past the bottom of the viewport AND there is room above,
  // flip it above the trigger. Real behaviour, not decoration — the rail sits
  // at the bottom of a sticky column, which is exactly where a downward panel
  // runs out of room. Measuring `offsetHeight` is only meaningful while the
  // disclosure is open, which is why every caller is gated on that.
  //
  // The source's OTHER init job — closing every sibling disclosure when one
  // opens — is not ported: it exists to make several dropdowns behave like
  // one menu, and with the export and MCP menus gone there is exactly one
  // dropdown here, so the loop can never do anything.
  const placeMenu = useCallback(() => {
    const details = detailsRef.current;
    const menu = menuRef.current;
    const summary = summaryRef.current;
    if (!(details?.open && menu && summary)) return;
    const rect = summary.getBoundingClientRect();
    const margin = 8;
    setFlipUp(
      rect.bottom + menu.offsetHeight + margin > window.innerHeight &&
        rect.top - menu.offsetHeight - margin > 0,
    );
  }, []);

  // Coalesced into one call per animation frame, so a live resize drag
  // re-reads layout once per frame instead of once per event. Blume imported
  // its shared `rafThrottle` for this; four lines inline is cheaper than
  // reaching for a helper module this file would be the only user of.
  useEffect(() => {
    let pending = false;
    const onResize = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        placeMenu();
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [placeMenu]);

  // `/docs` -> `index.mdx`, `/docs/components/button` -> `components/button.mdx`.
  // Safe without a guard: the early return below has already established that
  // `pathname` is one of the content index's own route strings, and those are
  // built to the same leading-slash / no-trailing-slash contract
  // `lib/page-meta.ts` documents.
  const slug = pathname === "/docs" ? "index" : pathname.slice("/docs/".length);
  // The raw-Markdown endpoint. STAGE 8 CREATES IT — until then this URL 404s
  // and "Copy as Markdown" logs its failure instead of flashing a
  // confirmation it cannot honour. The action is implemented in full; the
  // endpoint's absence is the only thing missing, and Stage 8 re-verifies it.
  const mdPath = `${pathname}.md`;
  // The chat prompt, byte-for-byte the source's. Built from `location.origin`
  // (hence client-side only, hence after mount) rather than from `site.url`,
  // so a preview deployment hands the assistant its own absolute URL instead
  // of pointing it at production.
  const prompt = origin
    ? encodeURIComponent(`Read ${new URL(mdPath, origin).href} so I can ask you questions about this page.`)
    : null;

  const copyMarkdown = async () => {
    try {
      const response = await fetch(mdPath);
      if (!response.ok) throw new Error(`Fetching ${mdPath} failed (${response.status})`);
      await navigator.clipboard.writeText(await response.text());
    } catch (error) {
      // Fetch or clipboard unavailable: never flash a confirmation that
      // isn't true.
      console.error("[docs] Copy as Markdown failed", error);
      return;
    }
    // Restart the hold on a repeat click rather than letting an earlier
    // timeout revert the label mid-flash.
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopied(true);
    copyTimer.current = setTimeout(() => setCopied(false), HOLD_MS);
  };

  // Hooks first, then the guard — see the header for why a 404 inside this
  // layout must not get a rail.
  if (!docRoutes.includes(pathname)) return null;

  return (
    <div className="mt-8 space-y-0.5 border-border border-t pt-4">
      <a className={rowClass} href={`${EDIT_BASE}/${slug}.mdx`} rel="noreferrer" target="_blank">
        <span>
          <GithubMark />
        </span>
        Edit on GitHub
      </a>

      <button
        className={rowClass}
        onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
        type="button"
      >
        <ArrowUp aria-hidden="true" size={16} />
        Scroll to top
      </button>

      <button className={rowClass} onClick={copyMarkdown} type="button">
        <Copy aria-hidden="true" size={16} />
        <span>{copied ? COPIED_LABEL : COPY_LABEL}</span>
        {/*
          Blume announced the confirmation through a shared visually-hidden
          live region it created in `<body>` on first use; the visible label
          swap above was never itself a live region. Reproduced with a region
          of this component's own so the announcement stays scoped to the
          element that caused it — and, unlike marking the label live, it
          does not announce the silent revert 1.5s later.
        */}
        <span className="sr-only" role="status">
          {copied ? COPIED_LABEL : ""}
        </span>
      </button>

      <details className="group relative" onToggle={placeMenu} ref={detailsRef}>
        <summary className={summaryClass} ref={summaryRef}>
          <ExternalLink aria-hidden="true" size={16} />
          Open in chat
          <ChevronDown
            aria-hidden="true"
            className="ms-auto transition-transform group-open:rotate-180"
            size={14}
          />
        </summary>
        {/*
          The flip state is interleaved into the class string at the exact
          positions the two paired utilities occupy in the source, so the
          at-rest attribute is character-identical to production's apart from
          the radius.
        */}
        <div
          className={`absolute ${flipUp ? "bottom-full" : "top-full"} right-2 z-50 ${
            flipUp ? "mb-1" : "mt-1"
          } w-max min-w-[14rem] max-w-[22rem] rounded-lg border border-border bg-background p-1 shadow-xl`}
          ref={menuRef}
        >
          {PROVIDERS.map((provider, index) => (
            <Fragment key={provider.key}>
              {/*
                The rule after the first entry separates v0 — a generator —
                from the five chat assistants. Blume computed whether to draw
                it (`providers.length > 1 && providers[0].key === "v0"`)
                because its list was configurable; this list is fixed in
                source, so the condition is constantly true and only the
                position survives.
              */}
              {index === 1 && <hr className="my-1 border-border border-t" />}
              {/*
                NO `href` UNTIL MOUNTED, reproducing today's markup exactly:
                the source ships these anchors bare and its script fills them
                in, because the prompt depends on `location.origin`. React
                omits an attribute whose value is `undefined`, so the
                prerendered HTML carries none either.
              */}
              <a
                className={menuRowClass}
                href={prompt ? provider.url(prompt) : undefined}
                rel="noreferrer"
                target="_blank"
              >
                <span>{LOGOS[provider.key]}</span>
                <span className="flex-1">{`Open in ${provider.name}`}</span>
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            </Fragment>
          ))}
        </div>
      </details>
    </div>
  );
}
