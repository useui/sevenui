#!/usr/bin/env node
// §17.5's gate for the OpenGraph surface: the `/og/<path>.png` cards and the
// site-wide `og:*` / `twitter:*` / canonical tag set that points at them.
//
// SHAPE. §17.2's text/DOM diffing does not apply to an image and screenshot
// diffing is rejected site-wide, so §17.5 replaces "compare the card" with
// layers that between them make a wrong card observable without ever looking
// at a pixel:
//
//   Layer 1 — the card exists, is a real 1200×630 PNG, and — the part a
//             status/size sweep alone cannot see — its BODY varies with the
//             page's own words and with nothing else (see `checkCardWords`).
//   Layer 2 — the page's declared tag set is exactly the sixteen tags, is
//             self-consistent, points at its OWN card, and carries the
//             registry's own words byte for byte: the assertion §17.5 calls
//             the only automated proof that §16.4 held.
//   Layer 3 — §17.4's fixed negative-path list: six missing pages and five
//             unknown card slugs, each asserted 404, so `/og` is a registry
//             lookup and not an open image generator on our own domain.
//
// EVERYTHING IS FETCHED OVER HTTP AND NOTHING IS IMPORTED. This file does not
// import `lib/og/path.ts`, `lib/metadata.tsx`, `lib/page-meta.ts`,
// `lib/og/card.tsx` or `lib/site.ts`, and re-states their rules below instead.
// A gate assembled out of the code it gates reproduces that code's mistakes
// and reports PASS — the lesson Stage 8 paid for twice. The two sides compared
// here are the two the site already serves: each page's own HTML, and
// `/llms.txt`, which `lib/site-index.ts` generates THROUGH `requirePageMeta`
// and is therefore a served, text rendering of the same registry the card is
// drawn from.
//
// NOTHING HERE IS A COUNT. The blocks half of the route set is manifest-derived
// and drifts by design (`scripts/route-inventory.mjs`'s header and
// `lib/site-index.ts`'s header both say so), so no check below asserts,
// compares, or prints as a criterion a NUMBER of routes — and neither does any
// comment. Counts appear only as measured detail beside a pass/fail decided on
// something else. The one arithmetic done on counts is `checkInventory`, which
// reconciles two numbers the inventory itself computed against each other and
// hard-codes neither.
//
// Usage:
//   node scripts/route-inventory.mjs | node scripts/og-sweep.mjs --base "$PREVIEW"
//   node scripts/og-sweep.mjs --base "$PREVIEW" --inventory inventory.json
//   node scripts/og-sweep.mjs --base "$PREVIEW" --save capture.json
//   node scripts/og-sweep.mjs --load capture.json --controls
//
// Flags:
//   --base <url>        the deployment to sweep. Required unless --load.
//   --inventory <file>  read `route-inventory.mjs`'s JSON from a file instead
//                       of stdin, so a re-run costs no pro-manifest fetch.
//   --save <file>       write the capture (see `capture()`) as JSON. It holds
//                       every route's raw HTML — deliberately, see `splitHead`
//                       — so it runs to tens of megabytes. Write it to a
//                       scratch directory; it does not belong in the repo.
//   --load <file>       run the checks over a saved capture, fetching nothing.
//   --verbose           per-route detail, including which of the three title
//                       rules was applied to each route (§17.5 / addendum B3).
//   --controls          run every positive control after the clean run.
//
// Env:
//   VERCEL_BYPASS       Vercel "Protection Bypass for Automation" token. Sent
//                       as `x-vercel-protection-bypass`. NEVER paired with
//                       `x-vercel-set-bypass-cookie`: that header expects a
//                       cookie jar, node's `fetch` keeps none, and the first
//                       URL dies with "redirect count exceeded".
//   POSITIVE_CONTROL    one mode name (see PERTURB). Corrupts the REAL capture
//                       before the checks run; the check that mode NAMES as its
//                       target must be GREEN on the clean capture and FAIL on
//                       the corrupted one. The clean baseline is measured on a
//                       separate unperturbed clone, so this path and
//                       `--controls` decide identically.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

// The site's canonical origin, written here independently of `lib/site.ts`.
// Every `og:url`, `og:image`, `twitter:image` and canonical on the deployment
// is absolute against THIS origin, not against `--base` — that is what
// `metadataBase` does, and it is correct: a preview deployment must not
// advertise itself as the canonical home of a production page.
const SITE = "https://sevenui.dev";

// §15.8's title suffix, and the em dash §17.6 #17 moved the docs titles to.
const SUFFIX = " — SevenUI";

// The sixteen-line shape production emits on every page, measured on
// `/`, `/docs/components/button`, `/components/button` and
// `/blocks/marketing/hero` (task-9.2b-brief.md). Set equality is asserted
// against these three lists, not a subset test: a route declaring an eleventh
// `og:` tag is as much a finding as one missing a tag, because a tag nobody
// declared is a tag nobody verified.
const OG_TAGS = [
  "og:type",
  "og:site_name",
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:image:type",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
];
const TWITTER_TAGS = ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"];
const CANONICAL = "link:canonical";
const FULL_TAG_SET = [...OG_TAGS, ...TWITTER_TAGS, CANONICAL];

// §17.6 #28: production declares a REDUCED set on a missing page — no
// `og:url`, no `og:image`, no canonical (a missing page has no card to point
// at) and `twitter:card` = `summary`, not `summary_large_image`.
const NOT_FOUND_TAG_SET = [
  "og:type",
  "og:site_name",
  "og:title",
  "og:description",
  "twitter:card",
  "twitter:title",
  "twitter:description",
];

// §16's URL pattern, re-stated rather than imported from `lib/og/path.ts`:
// `/` -> `/og/index.png`; every other route drops its leading slash and gains
// `.png` on its LAST segment, never as a segment of its own.
function ogImagePath(route) {
  if (route === "/") return "/og/index.png";
  const segments = route.slice(1).split("/");
  segments[segments.length - 1] += ".png";
  return `/og/${segments.join("/")}`;
}

// §17.5's byte floor. It is a floor for "something was actually drawn", not a
// size assertion — the size assertion is the IHDR check, which is the one that
// can see a render that came out at the wrong canvas. The floor is set an
// order of magnitude below anything this renderer produces rather than snug
// against today's spread: measured on the preview on 2026-09-21, the live
// cards run 29,362 B to 54,408 B, and that spread is a function of how much
// text each card draws, so it moves whenever the registry's copy does. A floor
// tuned to a band would be a content assertion wearing a rendering assertion's
// clothes. (An earlier revision of this comment claimed a "38–46 KB" band that
// the gate's own output line four lines below it refuted for most of the set;
// the number here is now the measured extremes, dated.)
const BYTE_FLOOR = 8 * 1024;
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const PNG_SIGNATURE = "89504e470d0a1a0a";

// `lib/og/card.tsx` truncates the drawn title at 64 code points and the drawn
// description at 160. Those two caps are the precondition for `checkCardWords`
// below — while no registry string reaches them, the drawn text IS the
// registry text, and two different `{title, description}` pairs cannot draw
// the same card. Measured on the preview on 2026-09-21: longest title 23 code
// points, longest description 154, so neither cap fires today. The numbers are
// restated here (not imported) so a lapse is caught by its own check rather
// than silently weakening the law.
const TITLE_DRAW_CAP = 64;
const DESCRIPTION_DRAW_CAP = 160;

// §17.4's OG negative path, enumerated at every level the registry lookup has
// to answer for. `/og/index` is the extension-less form: `slugToRoute` must
// reject a slug shape `routeToSlug` could never have produced, rather than
// guessing a route for a request nothing enumerated.
const OG_MISSES = [
  "/og/not-a-route.png",
  "/og/blocks/not-a-group.png",
  "/og/blocks/marketing/not-a-category.png",
  "/og/docs/components/not-a-primitive.png",
  "/og/index",
];

// §17.4's FIXED negative-path list for pages, in full. The inventory lists only
// LIVE routes and cannot see a miss, and the risk here is the inverse of the
// usual one: §4.1's catch-all and §10's `dynamicParams` both make it easy to
// return 200 with a plausible fallback, which is exactly what makes a stale
// link look healthy to a crawler. Each entry is a different mechanism, which is
// why the list is fixed rather than sampled:
const MISSING_PAGES = [
  "/not-a-page", // the root miss
  "/docs/not-a-primitive", // the docs catch-all's miss branch
  "/components/not-a-component", // a gallery miss
  "/components/field", // §11.7's old target: it must still 404 rather than quietly becoming something
  "/blocks/not-a-group", // a `dynamicParams = true` group miss
  "/blocks/marketing/not-a-category", // §10's category `notFound()`
];

// The site-wide description, measured on production. It is the registered
// description of both `/` and `/account` (§16.4's fallback for a page with no
// description of its own) and the description the 404 declares, so it is one
// literal here rather than three.
const SITE_DESCRIPTION = "Base UI powered primitives, distributed through the shadcn registry.";

// THE INDEPENDENT RESTATEMENT. `/llms.txt` is the registry side of the input
// diff, and it does not list every route — it lists the docs pages, the
// gallery catalog and the blocks catalog, and nothing else. The routes below
// are the ones it cannot cover, so for them the diff has no served registry
// side and these literals take its place.
//
// They are NOT copied out of `lib/page-meta.ts`. Every pair here was measured
// on PRODUCTION on 2026-09-21 — `curl https://sevenui.dev/<route>` and read off
// its own `og:title` / `og:description`, with the `— SevenUI` suffix stripped
// back off the title so the same three title rules apply to these routes as to
// every other. That is what makes this table a restatement and not a second
// copy of the thing under test: if the branch silently changed one of these
// five pages' words, this table still holds production's.
//
// `/account`'s description is byte-identical to the site description, on
// production as well as here. That is production's own fallback for a page
// with no description of its own (§16.4), measured, not assumed.
const UNLISTED_PAGE_META = {
  "/": {
    title: "SevenUI",
    description: SITE_DESCRIPTION,
  },
  "/pro": {
    title: "Pro",
    description:
      "Pre-order SevenUI Pro for $99 lifetime — the price rises to $249 once the Pro blocks catalog launches.",
  },
  "/account": {
    title: "Account",
    description: SITE_DESCRIPTION,
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "The terms that govern your use of the SevenUI website, the free component registry, and SevenUI Pro.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "What personal data SevenUI collects, who processes it, and how to exercise your rights.",
  },
};

// --- the title rule, which is three rules and must not be asserted as one ---
//
// `/` is bare `SevenUI`; the gallery's own component pages declare
// `<registry title> Components — SevenUI` (production's form, pre-shipped in
// Stage 0's `seo.og.titles` and deliberate); everything else takes the plain
// suffix. `/components` itself is NOT a gallery child and takes the plain
// suffix — the pattern below requires exactly one segment after `/components/`,
// so the index page falls through to the third rule as it should.
const GALLERY_CHILD = /^\/components\/[^/]+$/u;

function titleRuleFor(route) {
  if (route === "/") return "root-bare";
  if (GALLERY_CHILD.test(route)) return "gallery-components";
  return "suffixed";
}

function expectedTitle(route, registryTitle) {
  switch (titleRuleFor(route)) {
    case "root-bare":
      return registryTitle;
    case "gallery-components":
      return `${registryTitle} Components${SUFFIX}`;
    default:
      return `${registryTitle}${SUFFIX}`;
  }
}

// `/`'s `og:url` and canonical carry a trailing slash and no other route's do
// — production's shape, which Next's own resolver loses for the root (it
// collapses both to the bare origin), which is why `app/page.tsx` renders
// `RootUrlTags` by hand. Measured here rather than trusted, because a tag
// emitted by a hand-written component is exactly the tag a refactor drops.
function expectedPageUrl(route) {
  return route === "/" ? `${SITE}/` : `${SITE}${route}`;
}

// --- HTML reading -----------------------------------------------------------
//
// ATTRIBUTE-ORDER AGNOSTIC, and that is not tidiness. The deployment emits the
// same tag two ways: Next's metadata resolver writes
// `<meta property="og:url" content="…"/>`, while `RootUrlTags` — a React
// component in the tree — writes `<meta content="…" property="og:url"/>`, and
// its canonical likewise as `<link href="…" rel="canonical"/>`. A reader
// anchored on `<meta property=` finds the whole sixteen-tag set on `/terms`
// and reports `/` two tags short. That is a bug in the reader, not the site;
// it cost this task its first probe, and the shape of this function is the fix.
const TAG = /<(meta|link)\b[^>]*>/giu;
const ATTR = /([a-zA-Z][\w:.-]*)\s*=\s*"([^"]*)"/gu;

// Entities appear in real values (`&#x27;` in a blocks description, `&amp;` in
// "AI & Agents blocks"), and the input diff is byte for byte, so decoding is
// load-bearing rather than cosmetic. ONE pass, so a decoded `&amp;` cannot be
// re-decoded into whatever follows it.
// `nbsp` decodes to U+00A0, the character it names, NOT to an ASCII space. The
// input diff below is byte for byte, so a description carrying a non-breaking
// space would spuriously fail against a registry side holding the real
// character — and that diff is the one §17.5 calls the only automated proof
// that §16.4 held. Inert on today's content, and easy to "tidy" into a plain
// space in a diff where it reads as whitespace; spelled as an escape so the
// byte is legible and deliberate.
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };
function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/gu, (whole, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    if (body.startsWith("#")) return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    return NAMED[body.toLowerCase()] ?? whole;
  });
}

/**
 * Every `og:*`, `twitter:*` and `rel="canonical"` tag in a fragment, as an
 * ARRAY of `{ key, value }` and deliberately not a map: a tag emitted twice
 * must stay visible, and a map would silently keep the last one.
 */
function readTags(fragment) {
  const found = [];
  for (const [whole, element] of fragment.matchAll(TAG)) {
    const attrs = {};
    for (const [, name, value] of whole.matchAll(ATTR)) attrs[name.toLowerCase()] = value;
    if (element.toLowerCase() === "link") {
      if ((attrs.rel ?? "").toLowerCase() === "canonical") {
        found.push({ key: CANONICAL, value: decodeEntities(attrs.href ?? "") });
      }
      continue;
    }
    const key = attrs.property ?? attrs.name;
    if (!key) continue;
    if (key.startsWith("og:") || key.startsWith("twitter:")) {
      found.push({ key, value: decodeEntities(attrs.content ?? "") });
    }
  }
  return found;
}

/**
 * `<head>` and everything after it.
 *
 * THE CAPTURE STORES RAW HTML AND THIS RUNS AT CHECK TIME, not at fetch time,
 * and that ordering is a correctness requirement rather than a refactor. The
 * placement check asks "did any tag escape `<head>`", and its answer is derived
 * by this function. If the derivation were done during `capture()` and only its
 * RESULT stored, a `splitHead` that stopped finding `</head>` would make `tail`
 * permanently empty, the check would report "0 leaks" forever, and its positive
 * control — which would be corrupting the stored result — would still go red.
 * That is B5's second named failure inverted: a control that passes while the
 * check it guards is dead. Storing the HTML means every control corrupts the
 * real input and every derivation runs for real.
 */
function splitHead(html) {
  const end = html.indexOf("</head>");
  if (end === -1) return { head: html, tail: "" };
  return { head: html.slice(0, end), tail: html.slice(end) };
}

// --- the registry side ------------------------------------------------------
//
// `/llms.txt`'s only line shape is `- [<bare title>](<absolute url>): <desc>`,
// and `lib/site-index.ts` builds every one of those lines through
// `requirePageMeta`. So parsing it back out yields the registry's own
// `{title, description}` for each route it lists, fetched rather than imported.
const LLMS_ROW = /^- \[(.+)\]\((https:\/\/sevenui\.dev[^)]*)\): (.*)$/u;

function parseRegistry(text) {
  const byRoute = new Map();
  const duplicates = [];
  for (const line of text.split("\n")) {
    const match = LLMS_ROW.exec(line);
    if (!match) continue;
    const route = match[2].slice(SITE.length) || "/";
    if (byRoute.has(route)) duplicates.push(route);
    byRoute.set(route, { title: match[1], description: match[3] });
  }
  return { byRoute, duplicates };
}

// --- fetching ---------------------------------------------------------------

const bypass = process.env.VERCEL_BYPASS;
const headers = bypass ? { "x-vercel-protection-bypass": bypass } : {};

// `redirect: "manual"` so a rejected bypass is RECORDED as a 307 instead of
// looping. The uniformity is the tell: if every URL answers the same status,
// including the ones that must differ, the header is wrong, not the site.
function fetchPath(base, pathname) {
  return fetch(`${base}${pathname}`, { headers, redirect: "manual" });
}

async function mapLimit(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i]);
    }
  });
  await Promise.all(runners);
}

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

/**
 * One capture of the whole surface, so the checks are a pure function of it
 * and a positive control can corrupt real measured values rather than a
 * stand-in.
 *
 * Pages and missing pages keep their RAW HTML (see `splitHead` for why the
 * derivation must not be baked in here). Cards keep four measured properties
 * plus two digests:
 *
 *  - `head32`, the first 32 bytes — signature plus the whole IHDR chunk. These
 *    bytes are IDENTICAL on every card by construction, which is exactly why
 *    they cannot stand in for the body.
 *  - `bodyHash`, sha256 of the WHOLE body. This is what `checkCardWords` reads,
 *    and it is the difference between a gate that can see a card drawing the
 *    wrong words and one that cannot.
 */
async function capture(base, routes, inventoryTotals) {
  const cards = {};
  const pages = {};
  let deployment;

  await mapLimit(routes, 8, async (route) => {
    const response = await fetchPath(base, route);
    pages[route] = { status: response.status, html: await response.text() };
    // Recorded once, from whichever response comes back first. Vercel exposes
    // no deployment-id response header to a client — measured on this preview:
    // the only identifying headers are `x-vercel-id` (region plus a per-REQUEST
    // id, so it ties the capture to a moment, not to a build) and per-URL
    // `etag`s. `/llms.txt`'s etag is recorded below as the closest thing to a
    // build fingerprint a client can read: it is a content hash of a
    // build-derived artefact, so it moves whenever the site's content does.
    deployment ??= { xVercelId: response.headers.get("x-vercel-id"), sampledFrom: route };
  });

  const cardPaths = routes.map(ogImagePath);
  await mapLimit(cardPaths, 8, async (cardPath) => {
    const response = await fetchPath(base, cardPath);
    const body = Buffer.from(await response.arrayBuffer());
    cards[cardPath] = {
      status: response.status,
      contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim(),
      byteLength: body.byteLength,
      head32: body.subarray(0, 32).toString("base64"),
      bodyHash: sha256(body),
    };
  });

  const llmsResponse = await fetchPath(base, "/llms.txt");
  const llms = { status: llmsResponse.status, text: await llmsResponse.text() };
  if (deployment) deployment.llmsEtag = llmsResponse.headers.get("etag");

  const misses = {};
  await mapLimit(OG_MISSES, 5, async (pathname) => {
    const response = await fetchPath(base, pathname);
    await response.arrayBuffer();
    misses[pathname] = { status: response.status };
  });

  const missingPages = {};
  await mapLimit(MISSING_PAGES, 3, async (pathname) => {
    const response = await fetchPath(base, pathname);
    missingPages[pathname] = { status: response.status, html: await response.text() };
  });

  return { base, routes, inventoryTotals, deployment, pages, cards, llms, misses, missingPages };
}

// --- the check names --------------------------------------------------------
//
// Named constants, not string literals at the `record()` call sites, because
// every positive control below NAMES the check it guards and the runner
// requires that exact check to go red. Sharing one constant is what keeps a
// target from drifting away from its check into a permanently DEAD mode.
const CHECK = {
  cardStatus: "cards: every route's own card answers 200",
  cardType: "cards: every card is served as image/png",
  cardFloor: `cards: every card is larger than the ${BYTE_FLOOR} B floor`,
  cardSignature: "cards: every card body opens with the PNG signature",
  cardDimensions: `cards: every card's IHDR reports ${CARD_WIDTH}×${CARD_HEIGHT}`,
  cardWitnessTitle: "cards: the law has at least one witness that would catch a card ignoring the TITLE",
  cardWitnessDescription: "cards: the law has at least one witness that would catch a card ignoring the DESCRIPTION",
  cardWords: "cards: card bodies agree exactly where the page's words agree, and differ everywhere else",
  pageStatus: "pages: every route answers 200",
  tagSet: `pages: the declared tag set is exactly the ${OG_TAGS.length} og:*, the ${TWITTER_TAGS.length} twitter:* and the canonical link, each once`,
  tagPlacement: "pages: no og:*, twitter:* or canonical tag is emitted outside <head>",
  ownCard: "pages: og:image is the absolute form of the route's own card",
  cardProven: "pages: every route's og:image names a card layer 1 proved",
  pageUrl: "pages: og:url is the route's own absolute URL, with the trailing slash on / and on no other route",
  registryServed: "/llms.txt: answers 200",
  registryParsed: "/llms.txt: parses to at least one registry row",
  registryUnique: "/llms.txt: no route listed twice",
  coverage: "input diff: every route has a registry side — /llms.txt's row, or the literal restatement",
  coverageSingleSource: "input diff: no route is answered by both /llms.txt and the restatement",
  coverageNoStray: "input diff: every restated route is still in the inventory",
  descriptionDiff: "input diff: og:description is the registry's description for that route, byte for byte",
  titleDiff: "input diff: og:title is the registry's title under the route's own title rule (three rules, not one)",
  inventory: "inventory: the swept route lists and route-inventory.mjs's own total reconcile",
  ogMisses: `negative: all ${OG_MISSES.length} unknown card slugs answer 404, not a generated image`,
  notFoundStatus: "negative: every §17.4 missing page answers 404",
  notFoundComplete: `negative: every missing page declares all ${NOT_FOUND_TAG_SET.length} reduced tags`,
  notFoundNoExtras: "negative: no missing page declares a tag outside the reduced set",
  notFoundCard: "negative: every missing page's twitter:card is summary",
  notFoundPlacement: "negative: no missing page emits a tag outside <head>",
  notFoundOgTitle: "negative: every missing page's og:title is the suffixed 404 title (§17.6 #28)",
  notFoundTwitterTitle: "negative: every missing page's twitter:title is the suffixed 404 title (§17.6 #28)",
  notFoundOgDescription: "negative: every missing page's og:description is the site description",
  notFoundTwitterDescription: "negative: every missing page's twitter:description is the site description",
};

// Self-consistency relations, each an ASSERTION IN ITS OWN RIGHT.
//
// They used to be one compound check with a single control (`consistency`,
// which breaks `og:title === twitter:title`). A reviewer deleted eleven of the
// twelve and the gate still printed "20/20, 28/28, every one of the 20 checks
// is named as some control's target" — including the loss of
// `og:image:width === 1200` / `og:image:height === 630`, the exact pair
// `lib/og/dimensions.ts` was created to protect. A guarantee that stops at the
// check boundary says nothing about the assertions inside it.
//
// So each relation now records its own result and carries `breaks`: the tag to
// overwrite, and a value that falsifies THIS relation. `PERTURB` is generated
// from that field, so a relation added here without one is a build-time error
// rather than an assertion nobody guards.
const RELATIONS = [
  { name: "og:title === og:image:alt", holds: (v) => v("og:title") === v("og:image:alt"), breaks: { key: "og:image:alt", value: "Not the title" } },
  { name: "og:title === twitter:title", holds: (v) => v("og:title") === v("twitter:title"), breaks: { key: "twitter:title", value: "Not the title" } },
  { name: "og:image:alt === twitter:image:alt", holds: (v) => v("og:image:alt") === v("twitter:image:alt"), breaks: { key: "twitter:image:alt", value: "Not the alt" } },
  { name: "og:description === twitter:description", holds: (v) => v("og:description") === v("twitter:description"), breaks: { key: "twitter:description", value: "Not the description" } },
  { name: "og:image === twitter:image", holds: (v) => v("og:image") === v("twitter:image"), breaks: { key: "twitter:image", value: `${SITE}/og/privacy.png` } },
  { name: "og:url === canonical", holds: (v) => v("og:url") === v(CANONICAL), breaks: { key: "og:url", value: `${SITE}/elsewhere` } },
  { name: "og:type === website", holds: (v) => v("og:type") === "website", breaks: { key: "og:type", value: "article" } },
  { name: "og:site_name === SevenUI", holds: (v) => v("og:site_name") === "SevenUI", breaks: { key: "og:site_name", value: "Seven UI" } },
  { name: "og:image:type === image/png", holds: (v) => v("og:image:type") === "image/png", breaks: { key: "og:image:type", value: "image/jpeg" } },
  { name: `og:image:width === ${CARD_WIDTH}`, holds: (v) => v("og:image:width") === String(CARD_WIDTH), breaks: { key: "og:image:width", value: "600" } },
  { name: `og:image:height === ${CARD_HEIGHT}`, holds: (v) => v("og:image:height") === String(CARD_HEIGHT), breaks: { key: "og:image:height", value: "315" } },
  { name: "twitter:card === summary_large_image", holds: (v) => v("twitter:card") === "summary_large_image", breaks: { key: "twitter:card", value: "summary" } },
];

// THE DECLARED INVENTORY, written independently of the machinery above — and
// the reason it exists is a hole the generated controls did not close.
//
// Splitting the relations into twelve assertions and generating one control
// per relation made the reviewer's first experiment (delete eleven relations)
// report "27/27 assertions, 34/34 controls, every one of the 27 ASSERTIONS is
// named as some control's target". Truthfully, too: deleting a relation
// deletes its assertion AND its generated control together, so a derived
// inventory shrinks to fit whatever survives and the claim stays technically
// true while meaning less. A coverage claim computed from the code it audits
// can always be satisfied by deleting the code.
//
// So the inventory is DATA, written out here, and the lists below are checked
// against it at load. Removing a relation now fails before a single URL is
// fetched, which is the only place that failure can be made loud: it is a
// claim about the gate's own shape, not about the deployment, so no capture
// could carry a positive control for it.
const DECLARED_RELATIONS = [
  "og:title === og:image:alt",
  "og:title === twitter:title",
  "og:image:alt === twitter:image:alt",
  "og:description === twitter:description",
  "og:image === twitter:image",
  "og:url === canonical",
  "og:type === website",
  "og:site_name === SevenUI",
  "og:image:type === image/png",
  `og:image:width === ${CARD_WIDTH}`,
  `og:image:height === ${CARD_HEIGHT}`,
  "twitter:card === summary_large_image",
];

// The named assertions this gate must record, likewise written out rather than
// read off `CHECK`. Same argument: deleting a `CHECK` entry and its control
// together would otherwise be invisible.
const DECLARED_CHECKS = [
  "cardStatus", "cardType", "cardFloor", "cardSignature", "cardDimensions",
  "cardWitnessTitle", "cardWitnessDescription", "cardWords",
  "pageStatus", "tagSet", "tagPlacement", "ownCard", "cardProven", "pageUrl",
  "registryServed", "registryParsed", "registryUnique",
  "coverage", "coverageSingleSource", "coverageNoStray",
  "descriptionDiff", "titleDiff", "inventory",
  "ogMisses",
  "notFoundStatus", "notFoundComplete", "notFoundNoExtras", "notFoundCard",
  "notFoundPlacement",
  "notFoundOgTitle", "notFoundTwitterTitle",
  "notFoundOgDescription", "notFoundTwitterDescription",
];

function requireSameSet(what, actual, declared) {
  const missing = declared.filter((name) => !actual.includes(name));
  const extra = actual.filter((name) => !declared.includes(name));
  if (missing.length || extra.length) {
    throw new Error(
      `${what} no longer matches the declared inventory in this file — refusing to run.\n` +
        (missing.length ? `  declared but absent: ${missing.join(" | ")}\n` : "") +
        (extra.length ? `  present but undeclared: ${extra.join(" | ")}\n` : "") +
        "  An assertion removed together with its control is invisible to a coverage claim computed\n" +
        "  from the code; this inventory is the independent copy that makes it visible. If the change\n" +
        "  is intended, edit the inventory deliberately and say why.",
    );
  }
}

requireSameSet("RELATIONS", RELATIONS.map((relation) => relation.name), DECLARED_RELATIONS);
requireSameSet("CHECK", Object.keys(CHECK), DECLARED_CHECKS);

// One assertion name per relation, so a control can name exactly one of them.
const relationCheck = (name) => `pages: self-consistency — ${name}`;

// The 404's own VALUES, not just its key set (§17.6 #28, widened by Ruling 79
// to move `og:title`/`twitter:title` with the `<title>`). The reviewer rewrote
// every `Page not found — SevenUI` to `SevenUI` across all six captured 404s —
// a total regression of the row this stage widened — and the gate printed
// 20/20, because `checkMissingPages` read keys and never values. Nothing else
// in the repo reads a page title at all: `scripts/extract-page-features.mjs`
// contains no `title` token, and this sweep is the only script in `scripts/`
// that touches one. So these two literals are the only assertion of §17.6 #28
// anywhere.
//
// The SUFFIXED form is correct for this branch and differs from production's
// bare `Page not found` by design — #28 says the 404 `<title>` gains the
// suffix, and Ruling 79 widens that to its `og:title` and `twitter:title`.
const NOT_FOUND_TITLE = `Page not found${SUFFIX}`;

// --- the checks -------------------------------------------------------------

function runChecks(cap, { verbose }) {
  const results = [];
  const notes = [];
  const record = (name, ok, detail) => results.push({ name, ok, detail });
  const routes = [...cap.routes].sort();
  const sample = (list, n = 4) => list.slice(0, n).join(" ;; ") + (list.length > n ? ` … +${list.length - n} more` : "");

  // --- Layer 1: the cards ---------------------------------------------------
  const cardOf = (route) => cap.cards[ogImagePath(route)] ?? {};

  const notOk = routes.filter((route) => cardOf(route).status !== 200);
  record(
    CHECK.cardStatus,
    notOk.length === 0,
    notOk.length ? sample(notOk.map((r) => `${ogImagePath(r)} -> ${cardOf(r).status}`)) : `${routes.length} cards, all 200`,
  );

  const wrongType = routes.filter((route) => cardOf(route).contentType !== "image/png");
  record(
    CHECK.cardType,
    wrongType.length === 0,
    wrongType.length
      ? sample(wrongType.map((r) => `${ogImagePath(r)} -> "${cardOf(r).contentType}"`))
      : "all image/png",
  );

  const tooSmall = routes.filter((route) => (cardOf(route).byteLength ?? 0) < BYTE_FLOOR);
  const sizes = routes.map((route) => cardOf(route).byteLength ?? 0);
  record(
    CHECK.cardFloor,
    tooSmall.length === 0,
    tooSmall.length
      ? sample(tooSmall.map((r) => `${ogImagePath(r)} -> ${cardOf(r).byteLength} B`))
      : `smallest ${Math.min(...sizes)} B, largest ${Math.max(...sizes)} B`,
  );

  const headerOf = (route) => Buffer.from(cardOf(route).head32 ?? "", "base64");
  const badSig = routes.filter((route) => headerOf(route).subarray(0, 8).toString("hex") !== PNG_SIGNATURE);
  record(
    CHECK.cardSignature,
    badSig.length === 0,
    badSig.length
      ? sample(badSig.map((r) => `${ogImagePath(r)} -> ${headerOf(r).subarray(0, 8).toString("hex")}`))
      : "all 8-byte signatures match",
  );

  // The IHDR chunk is at a fixed offset in every PNG: 8 bytes of signature, a
  // 4-byte length, the 4-byte type `IHDR`, then width and height as big-endian
  // 32-bit integers. Read rather than trusted, because the floor above cannot
  // tell a 1200×630 card from a 600×315 one.
  const dimsOf = (route) => {
    const buffer = headerOf(route);
    if (buffer.length < 24 || buffer.subarray(12, 16).toString("ascii") !== "IHDR") return undefined;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  };
  const badDims = routes.filter((route) => {
    const dims = dimsOf(route);
    return !dims || dims.width !== CARD_WIDTH || dims.height !== CARD_HEIGHT;
  });
  record(
    CHECK.cardDimensions,
    badDims.length === 0,
    badDims.length
      ? sample(
          badDims.map((r) => {
            const dims = dimsOf(r);
            return `${ogImagePath(r)} -> ${dims ? `${dims.width}×${dims.height}` : "no IHDR"}`;
          }),
        )
      : `all ${CARD_WIDTH}×${CARD_HEIGHT}`,
  );

  // --- the registry side, read before the card-content law needs it ----------
  const registry = parseRegistry(cap.llms.text);
  // THREE FACTS, THREE RECORDS. They were one `record` conjoining served,
  // parsed and unique; `llmsstatus` and `llmsdupe` reached two of the three,
  // so deleting `registry.byRoute.size > 0` passed silently. See the header
  // note on conjunction for why the unit has to be one fact wide.
  record(CHECK.registryServed, cap.llms.status === 200, `status ${cap.llms.status}`);
  record(
    CHECK.registryParsed,
    registry.byRoute.size > 0,
    registry.byRoute.size > 0 ? `${registry.byRoute.size} rows parsed` : "0 rows parsed — nothing to diff against",
  );
  record(
    CHECK.registryUnique,
    registry.duplicates.length === 0,
    registry.duplicates.length ? sample(registry.duplicates) : "no route listed twice",
  );

  const metaFor = (route) => registry.byRoute.get(route) ?? UNLISTED_PAGE_META[route];
  const uncovered = routes.filter((route) => !metaFor(route));

  // --- THE CARD-CONTENT LAW -------------------------------------------------
  //
  // WHY THIS CHECK EXISTS. Everything above reads a card's status, its content
  // type, its length and its first 32 bytes — and those 32 bytes are the PNG
  // signature plus the IHDR chunk, which are byte-identical on every card by
  // construction (measured: one distinct value across the whole set). So the
  // card checks above, on their own, cannot see the §16.4 regression they are
  // supposed to guard: if `OgCard` lost its `title` prop, or the slug->route
  // lookup collapsed to the root, the site would serve a full set of valid,
  // correctly-sized ~40 KB PNGs that all say the same thing. Layer 2 would not
  // see it either — it compares `/llms.txt` against the page HTML, and NEITHER
  // OF THOSE IS THE CARD RENDERER. Only the six-card human review would catch
  // it, on six routes out of the whole set.
  //
  // WHAT IS ASSERTED, and why it is a law about the renderer rather than about
  // today's content. `app/og/[...slug]/route.tsx` renders
  // `<OgCard description={meta.description} title={meta.title} />` and hands
  // `ImageResponse` nothing else that varies by route — every other input
  // (fonts, palette, padding, the footer host) is a module constant. So the
  // card body is a pure function of the `{title, description}` pair, and that
  // pair is exactly what the registry side already gives us for every route.
  // Therefore:
  //
  //   routes sharing a {title, description} pair MUST share a body hash;
  //   routes with different pairs MUST have different body hashes.
  //
  // Stated that way it constrains the RENDERER, not the copy. Two pages that
  // genuinely declare the same words land in the same group and pass — so a
  // legitimate duplicate never becomes unexpressible, which a blanket
  // "all hashes must be distinct" rule would have made it.
  //
  // WHAT CATCHES WHAT, precisely — the earlier wording here ("a lost `title`
  // prop collapses every group onto one hash and fails on every cross-group
  // pair") is true of a TOTAL collapse and false of a title-only drop, which
  // is the likelier bug. A card that stops drawing the title still varies with
  // the description, so it is caught only by a pair of routes that share a
  // DESCRIPTION and differ in title. A card that stops drawing the description
  // is caught only by a pair sharing a TITLE. Those two witness classes are
  // what give the law its power in each direction, and each is asserted
  // non-empty below — because measured on today's content the title direction
  // rests on exactly ONE witness pair (`/` vs `/account`, which collide only
  // because `/account` has no description of its own and falls back to the
  // site description). One content edit removes it, after which a card drawing
  // descriptions only would pass silently. An assertion is the difference
  // between that being a regression and being invisible.
  //
  // The precondition is the renderer's truncation: past the draw caps, two
  // different pairs could legitimately draw the same card. It gets its own
  // check rather than a silent allowance, so a lapse is visible.
  // THE DRAW CAPS ARE A NOTE, NOT AN ASSERTION — and that is the correction
  // this round made. `lib/og/card.tsx` truncates the drawn title at 64 code
  // points and the description at 160, and past a cap the drawn text stops
  // being the registry text, so the law below cannot speak for that route.
  // The previous revision FAILED on an over-cap route. With the longest live
  // description at 154 against a cap of 160, that is six code points of
  // headroom: one slightly longer sentence from a docs author produces a card
  // that renders exactly as §16.4 intends — truncated with an ellipsis, the
  // cap being "a safety net, not a typographic limit" — and a red gate. That
  // is precisely the "correct output made unexpressible" pattern this file's
  // own header lists among the mistakes it exists to avoid.
  //
  // So an over-cap route is DROPPED from the law and NAMED AND COUNTED in the
  // law's own detail line and in a note. Dropped-and-named is not the same as
  // silently skipped: the count is printed on every run, pass or fail.
  const overCap = [];
  let longestTitle = 0;
  let longestDescription = 0;
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue;
    const titleLength = [...meta.title].length;
    const descriptionLength = [...meta.description].length;
    longestTitle = Math.max(longestTitle, titleLength);
    longestDescription = Math.max(longestDescription, descriptionLength);
    if (titleLength > TITLE_DRAW_CAP) overCap.push({ route, why: `title ${titleLength}>${TITLE_DRAW_CAP}` });
    else if (descriptionLength > DESCRIPTION_DRAW_CAP) {
      overCap.push({ route, why: `description ${descriptionLength}>${DESCRIPTION_DRAW_CAP}` });
    }
  }
  const excluded = new Set(overCap.map((entry) => entry.route));
  notes.push(
    `NOTE  cards: draw-cap headroom — longest title ${longestTitle}/${TITLE_DRAW_CAP}, ` +
      `longest description ${longestDescription}/${DESCRIPTION_DRAW_CAP} code points. ` +
      (overCap.length
        ? `${overCap.length} route(s) EXCLUDED from the card-content law (the drawn text is truncated, ` +
          `so it is no longer the registry text): ${overCap.map((e) => `${e.route} (${e.why})`).join(" ;; ")}`
        : "0 routes excluded from the card-content law."),
  );

  const inLaw = routes.filter((route) => metaFor(route) && !excluded.has(route));
  const groups = new Map();
  for (const route of inLaw) {
    const meta = metaFor(route);
    // A JSON-encoded PAIR, not the two strings run together. The separator
    // here used to be a raw NUL byte: unambiguous at runtime, but an invisible
    // control character sitting in source — which is also why `grep` called
    // this file binary and quietly printed nothing for every pattern. Encoding
    // the pair says the same thing in characters a reader and a tool can both
    // see, and removes the only non-text byte in the file.
    const key = JSON.stringify([meta.title, meta.description]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(route);
  }
  const describe = (route) => {
    const meta = metaFor(route);
    return `${route} title=${JSON.stringify(meta?.title)} description=${JSON.stringify(meta?.description)}`;
  };
  const wordProblems = [];
  // Within a group: same words, so the same card must have been drawn.
  for (const [, members] of groups) {
    const hashes = new Set(members.map((route) => cardOf(route).bodyHash));
    if (hashes.size > 1) {
      wordProblems.push(
        `same words, different cards: ${members.map((r) => `${r}=${(cardOf(r).bodyHash ?? "").slice(0, 12)}`).join(" ")} | ${describe(members[0])}`,
      );
    }
  }
  // Across groups: different words, so the cards must differ. Reported WITH the
  // colliding routes' words, so an operator can tell a render collapse from two
  // pages that genuinely say the same thing (which would not be here — they
  // would be one group).
  const byHash = new Map();
  for (const [key, members] of groups) {
    const hash = cardOf(members[0]).bodyHash;
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push({ key, members });
  }
  for (const [hash, colliding] of byHash) {
    if (colliding.length < 2) continue;
    wordProblems.push(
      `different words, same card (${(hash ?? "").slice(0, 12)}): ${colliding
        .slice(0, 3)
        .map((group) => describe(group.members[0]))
        .join(" ;; ")}${colliding.length > 3 ? ` … +${colliding.length - 3} more groups on this hash` : ""}`,
    );
  }
  const skipNote = uncovered.length ? `, ${uncovered.length} skipped for want of a registry side` : "";
  record(
    CHECK.cardWords,
    wordProblems.length === 0,
    wordProblems.length
      ? sample(wordProblems, 3)
      : `${groups.size} distinct {title, description} groups over ${inLaw.length} routes, ` +
        `${byHash.size} distinct card bodies${skipNote}` +
        (excluded.size
          ? `, ${excluded.size} excluded for reaching a draw cap: ${[...excluded].join(" ")}`
          : ", 0 excluded for a draw cap"),
  );

  // The two witness classes, asserted rather than assumed. A witness is a PAIR
  // of routes inside the law's population that agree on one field and differ on
  // the other; if a class is empty, the law is blind in that direction and says
  // so here instead of reporting a clean run it has not earned.
  const witnessPairs = (same, other) => {
    const buckets = new Map();
    for (const route of inLaw) {
      const meta = metaFor(route);
      const key = meta[same];
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(route);
    }
    const found = [];
    for (const [key, members] of buckets) {
      if (members.length < 2) continue;
      const distinct = new Set(members.map((route) => metaFor(route)[other]));
      if (distinct.size > 1) found.push({ key, members });
    }
    return found;
  };
  // Share a DESCRIPTION, differ in title -> catches a card ignoring the title.
  const titleWitnesses = witnessPairs("description", "title");
  record(
    CHECK.cardWitnessTitle,
    titleWitnesses.length > 0,
    titleWitnesses.length
      ? `${titleWitnesses.length} witness group(s), e.g. ${titleWitnesses[0].members.join(" vs ")}`
      : "NONE — no two routes share a description, so a card that never drew the title would pass this law",
  );
  // Share a TITLE, differ in description -> catches a card ignoring the description.
  const descriptionWitnesses = witnessPairs("title", "description");
  record(
    CHECK.cardWitnessDescription,
    descriptionWitnesses.length > 0,
    descriptionWitnesses.length
      ? `${descriptionWitnesses.length} witness group(s), e.g. ${descriptionWitnesses[0].members.join(" vs ")}`
      : "NONE — no two routes share a title, so a card that never drew the description would pass this law",
  );

  // --- Layer 2: the tag set -------------------------------------------------
  const badPage = routes.filter((route) => cap.pages[route]?.status !== 200);
  record(
    CHECK.pageStatus,
    badPage.length === 0,
    badPage.length ? sample(badPage.map((r) => `${r} -> ${cap.pages[r]?.status}`)) : `${routes.length} pages, all 200`,
  );

  const split = new Map(routes.map((route) => [route, splitHead(cap.pages[route]?.html ?? "")]));
  const tagsOf = new Map(routes.map((route) => [route, readTags(split.get(route).head)]));
  const valueOf = (route, key) => tagsOf.get(route)?.find((tag) => tag.key === key)?.value;

  const wrongSet = [];
  for (const route of routes) {
    const keys = tagsOf.get(route).map((tag) => tag.key);
    const missing = FULL_TAG_SET.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !FULL_TAG_SET.includes(key));
    const repeated = keys.filter((key, i) => keys.indexOf(key) !== i);
    if (missing.length || extra.length || repeated.length) {
      wrongSet.push(`${route}: missing=[${missing}] extra=[${extra}] repeated=[${[...new Set(repeated)]}]`);
    }
  }
  record(
    CHECK.tagSet,
    wrongSet.length === 0,
    wrongSet.length ? sample(wrongSet) : `${routes.length} routes at ${FULL_TAG_SET.length} tags each`,
  );

  const leaked = routes.filter((route) => readTags(split.get(route).tail).length > 0);
  record(
    CHECK.tagPlacement,
    leaked.length === 0,
    leaked.length
      ? sample(leaked.map((r) => `${r} -> ${readTags(split.get(r).tail).length} tags after </head>`))
      : "0 leaks",
  );

  // ONE RESULT PER RELATION. Twelve assertions reported as one line is twelve
  // assertions guarded by whichever control happens to break the first of them.
  for (const relation of RELATIONS) {
    const broken = routes.filter((route) => !relation.holds((key) => valueOf(route, key)));
    record(
      relationCheck(relation.name),
      broken.length === 0,
      broken.length
        ? sample(broken.map((r) => `${r}: ${JSON.stringify(valueOf(r, relation.breaks.key))}`))
        : `holds on ${routes.length} routes`,
    );
  }

  // `og:image` must be the absolute form of the route's OWN card path, and
  // that card must be one layer 1 just proved — the two layers are joined
  // here, so "the cards are fine" and "the pages point at cards" cannot both
  // be true of two different sets.
  const wrongImage = [];
  const unproven = [];
  for (const route of routes) {
    const want = `${SITE}${ogImagePath(route)}`;
    const got = valueOf(route, "og:image");
    if (got !== want) wrongImage.push(`${route}: want ${want} got ${got}`);
    if (cap.cards[ogImagePath(route)]?.status !== 200) unproven.push(`${route} -> ${ogImagePath(route)}`);
  }
  record(
    CHECK.ownCard,
    wrongImage.length === 0,
    wrongImage.length ? sample(wrongImage) : `${routes.length} routes point at their own card`,
  );
  // The layer-1 <-> layer-2 join, recorded separately from the value above so
  // that "the pages name the right URL" and "those URLs are cards this run
  // actually proved" cannot both be claimed by one control touching one of
  // them. It overlaps `cardStatus` by design — that is the join.
  record(
    CHECK.cardProven,
    unproven.length === 0,
    unproven.length ? sample(unproven) : `every route's og:image is a card layer 1 proved`,
  );

  const wrongUrl = routes.filter((route) => valueOf(route, "og:url") !== expectedPageUrl(route));
  record(
    CHECK.pageUrl,
    wrongUrl.length === 0,
    wrongUrl.length
      ? sample(wrongUrl.map((r) => `${r}: want ${expectedPageUrl(r)} got ${valueOf(r, "og:url")}`))
      : `/ -> ${valueOf("/", "og:url")}`,
  );

  // --- the input diff -------------------------------------------------------
  //
  // COVERAGE ACCOUNTING runs before either diff. `/llms.txt` does not list
  // every route, so every route must be answered by one side or the other —
  // and a route answered by NEITHER has to be named and counted, or the gate
  // reports "all routes checked" while checking fewer.
  const fromRegistry = routes.filter((route) => registry.byRoute.has(route));
  const fromLiterals = routes.filter((route) => !registry.byRoute.has(route) && UNLISTED_PAGE_META[route]);
  const doubleSourced = Object.keys(UNLISTED_PAGE_META).filter((route) => registry.byRoute.has(route));
  const strayLiterals = Object.keys(UNLISTED_PAGE_META).filter((route) => !routes.includes(route));
  record(
    CHECK.coverage,
    uncovered.length === 0,
    uncovered.length
      ? `UNCOVERED: ${sample(uncovered)}`
      : `${fromRegistry.length} routes from /llms.txt, ${fromLiterals.length} from the restatement (${fromLiterals.join(" ")})`,
  );
  // A route answered by BOTH sources is a second place for the registry to
  // disagree with itself; a literal for a route the inventory no longer has is
  // a restatement rotting into a list of pages that stopped existing. Separate
  // records because `llmsdrop` only ever produces the first of the three.
  record(
    CHECK.coverageSingleSource,
    doubleSourced.length === 0,
    doubleSourced.length ? `double-sourced: ${sample(doubleSourced)}` : "no route answered by both sides",
  );
  record(
    CHECK.coverageNoStray,
    strayLiterals.length === 0,
    strayLiterals.length ? `restated but not a route: ${sample(strayLiterals)}` : "every restated route is in the inventory",
  );

  // §17.5's own words: this is the only automated check that proves §16.4 held
  // — that the card draws the PAGE's words rather than one site-wide sentence.
  // Byte for byte on purpose. A subset test, a truncated compare or a
  // normalised one would pass a card drawn from the wrong sentence.
  const wrongDescription = [];
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue; // already a failure on the coverage check; never silently skipped
    const got = valueOf(route, "og:description");
    if (got !== meta.description) {
      wrongDescription.push(
        `${route}: registry ${JSON.stringify(meta.description)} vs page ${JSON.stringify(got)}`,
      );
    }
  }
  // The skipped count is printed even on a pass. A route with no registry side
  // is already a FAIL on the coverage check above, but a detail line reading
  // "N routes compared" when one was skipped is how a gate comes to report more
  // coverage than it has.
  record(
    CHECK.descriptionDiff,
    wrongDescription.length === 0,
    wrongDescription.length
      ? sample(wrongDescription, 3)
      : `${routes.length - uncovered.length} routes compared${skipNote}`,
  );

  const wrongTitle = [];
  const ruleCounts = { "root-bare": 0, "gallery-components": 0, suffixed: 0 };
  for (const route of routes) {
    const meta = metaFor(route);
    if (!meta) continue;
    ruleCounts[titleRuleFor(route)] += 1;
    const want = expectedTitle(route, meta.title);
    const got = valueOf(route, "og:title");
    if (got !== want) {
      wrongTitle.push(`${route} [${titleRuleFor(route)}]: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`);
    }
  }
  record(
    CHECK.titleDiff,
    wrongTitle.length === 0,
    wrongTitle.length
      ? sample(wrongTitle, 3)
      : `root-bare ${ruleCounts["root-bare"]}, gallery-components ${ruleCounts["gallery-components"]}, ` +
        `suffixed ${ruleCounts.suffixed}${skipNote}`,
  );

  // --- the inventory's own arithmetic ---------------------------------------
  //
  // `route-inventory.mjs` computes `total` from the same arrays it prints. The
  // sweep takes every array but `notFound`, so the routes it swept plus the
  // `notFound` entries must add back up to that total. NO LITERAL IS INVOLVED:
  // both sides are numbers the inventory produced, compared to each other. It
  // catches an inventory whose arrays and whose own total disagree, and — the
  // reason it is here — a sweep that silently dropped or de-duplicated a route
  // on the way in, which is the last seam on "no silent caps".
  const totals = cap.inventoryTotals;
  record(
    CHECK.inventory,
    Boolean(totals) && routes.length + totals.notFound === totals.total,
    totals
      ? `swept ${routes.length} + notFound ${totals.notFound} = ${routes.length + totals.notFound}, inventory total ${totals.total}`
      : "no inventory totals in the capture",
  );

  // --- Layer 3: the negative paths -----------------------------------------
  const liveMisses = OG_MISSES.filter((pathname) => cap.misses[pathname]?.status !== 404);
  record(
    CHECK.ogMisses,
    liveMisses.length === 0,
    liveMisses.length
      ? sample(liveMisses.map((p) => `${p} -> ${cap.misses[p]?.status}`))
      : OG_MISSES.map((p) => `${p} 404`).join(" ;; "),
  );

  // ONE RESULT PER ASSERTION, for the same reason the relations above are split.
  // This check used to record a single line covering status, the key set, the
  // `twitter:card` value and placement. A reviewer replaced
  // `const missing = NOT_FOUND_TAG_SET.filter(...)` with `const missing = []`
  // — deleting the branch that detects a 404 shipping ZERO og/twitter tags,
  // which is the exact defect this gate found on its first run — and the gate
  // reported 20/20 with every control LIVE, because neither `notfoundfull`
  // (which ADDS a tag) nor `fieldlives` (which flips a status) ever produces a
  // non-empty `missing` list. Each branch below is now its own assertion with
  // its own control.
  const captured = MISSING_PAGES.map((pathname) => {
    const page = cap.missingPages[pathname];
    const { head, tail } = splitHead(page?.html ?? "");
    const tags = readTags(head);
    return {
      pathname,
      page,
      keys: tags.map((tag) => tag.key),
      value: (key) => tags.find((tag) => tag.key === key)?.value,
      outside: readTags(tail).length,
    };
  });
  const notFoundAssert = (name, predicate, describe, okDetail) => {
    const bad = captured.filter((entry) => !entry.page || !predicate(entry));
    record(
      name,
      bad.length === 0,
      bad.length ? sample(bad.map((entry) => (entry.page ? describe(entry) : `${entry.pathname}: not captured`))) : okDetail,
    );
  };

  notFoundAssert(
    CHECK.notFoundStatus,
    (e) => e.page.status === 404,
    (e) => `${e.pathname}: status ${e.page.status}`,
    MISSING_PAGES.map((p) => `${p} 404`).join(" ;; "),
  );
  notFoundAssert(
    CHECK.notFoundComplete,
    (e) => NOT_FOUND_TAG_SET.every((key) => e.keys.includes(key)),
    (e) => `${e.pathname}: missing=[${NOT_FOUND_TAG_SET.filter((key) => !e.keys.includes(key))}]`,
    `all ${NOT_FOUND_TAG_SET.length} reduced tags present on every missing page`,
  );
  notFoundAssert(
    CHECK.notFoundNoExtras,
    (e) => e.keys.every((key) => NOT_FOUND_TAG_SET.includes(key)),
    (e) => `${e.pathname}: extra=[${e.keys.filter((key) => !NOT_FOUND_TAG_SET.includes(key))}]`,
    "no og:url, no og:image, no canonical on any missing page",
  );
  notFoundAssert(
    CHECK.notFoundCard,
    (e) => e.value("twitter:card") === "summary",
    (e) => `${e.pathname}: twitter:card=${JSON.stringify(e.value("twitter:card"))}`,
    'twitter:card="summary" everywhere',
  );
  notFoundAssert(
    CHECK.notFoundPlacement,
    (e) => e.outside === 0,
    (e) => `${e.pathname}: ${e.outside} tags outside <head>`,
    "0 leaks",
  );
  // §17.6 #28's only assertion anywhere in this repo — ONE TAG PER RECORD.
  // These two were one record each, conjoining the `og:` and `twitter:` halves
  // while their single control touched only the `og:` one, so deleting the
  // `twitter:` conjunct passed silently. Nothing else in the repo asserts a
  // 404's `twitter:title`: the twelve relations run over the 109 LIVE routes
  // only, and a missing page is not one of them.
  for (const [check, key, want, label] of [
    [CHECK.notFoundOgTitle, "og:title", NOT_FOUND_TITLE, JSON.stringify(NOT_FOUND_TITLE)],
    [CHECK.notFoundTwitterTitle, "twitter:title", NOT_FOUND_TITLE, JSON.stringify(NOT_FOUND_TITLE)],
    [CHECK.notFoundOgDescription, "og:description", SITE_DESCRIPTION, "the site description"],
    [CHECK.notFoundTwitterDescription, "twitter:description", SITE_DESCRIPTION, "the site description"],
  ]) {
    notFoundAssert(
      check,
      (e) => e.value(key) === want,
      (e) => `${e.pathname}: ${key}=${JSON.stringify(e.value(key))}`,
      `${key} = ${label}`,
    );
  }

  if (verbose) {
    for (const route of routes) {
      const meta = metaFor(route);
      notes.push(
        `${route}\n    rule=${titleRuleFor(route)} source=${registry.byRoute.has(route) ? "llms.txt" : "restatement"}` +
          `\n    card=${ogImagePath(route)} ${cardOf(route).status} ${cardOf(route).byteLength} B ` +
          `sha256=${(cardOf(route).bodyHash ?? "").slice(0, 16)}` +
          `\n    og:title=${JSON.stringify(valueOf(route, "og:title"))} want=${JSON.stringify(meta ? expectedTitle(route, meta.title) : undefined)}`,
      );
    }
  }

  return { results, notes };
}

// --- positive controls ------------------------------------------------------
//
// THE RULE (§17.5's gate inherits it from Stage 7 and Stage 8): for every
// check, feed it a deliberately corrupted copy of its REAL input and require
// the check to report FAIL. A check that cannot be shown to fail is measuring
// nothing, and this repo has shipped that three times — a control written
// against a fixture that matched nothing once it mattered, a control whose
// needle lived only in the region its check strips away, and a gate that made
// correct output unexpressible.
//
// EVERY MODE NAMES ITS TARGET, and the runner requires THAT check to go red —
// not merely "some check went red". An earlier revision of this file accepted
// any red line, and a reviewer proved what that hides: gutting the card-status
// check, the own-card check or the title-rule check into no-ops still left
// `cardstatus`, `imagepath`, `title` and `galleryrule` printing LIVE, because
// each of them also trips a self-consistency relation as collateral. Four
// checks — including §17.5's headline "this alone would have caught the live
// 404 og:image bug" — were unguarded while the gate reported a full set of
// live controls. Collateral reds are still printed below, because they are
// real and informative, but they no longer decide anything.
//
// Every mode also mutates the CAPTURE — the bytes and the HTML the deployment
// actually served — never a fixture, and never a value derived from them: a
// control that overwrites a stored derivation instead of its input would go red
// while the derivation it is supposed to exercise stayed dead.
const PERTURB = {
  // --- layer 1 --------------------------------------------------------------
  cardstatus: {
    target: CHECK.cardStatus,
    // A card that is not there at all. The whole record is set to what a 404
    // actually returns — an empty body — rather than the status alone, so the
    // body-derived checks see a real absence rather than a status flag
    // contradicting bytes that are still present.
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const empty = Buffer.alloc(0);
      cap.cards[cardPath] = {
        status: 404,
        contentType: "text/plain",
        byteLength: 0,
        head32: empty.toString("base64"),
        bodyHash: sha256(empty),
      };
      return `${cardPath} -> 404 with an empty body`;
    },
  },
  cardtype: {
    target: CHECK.cardType,
    apply: (cap) => {
      const cardPath = firstCard(cap);
      cap.cards[cardPath].contentType = "image/webp";
      return `${cardPath} content-type -> image/webp`;
    },
  },
  cardbytes: {
    target: CHECK.cardFloor,
    // A truncated render. Signature and IHDR survive a truncation, so this mode
    // trips the floor and nothing else — which is why the floor is a separate
    // check from the header checks.
    apply: (cap) => {
      const cardPath = firstCard(cap);
      cap.cards[cardPath].byteLength = 1024;
      return `${cardPath} byteLength -> 1024`;
    },
  },
  cardsig: {
    target: CHECK.cardSignature,
    // A body that is not a PNG at all — an error page served with the right
    // content type lands exactly here.
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const buffer = Buffer.from(cap.cards[cardPath].head32, "base64");
      buffer[1] = 0x00;
      cap.cards[cardPath].head32 = buffer.toString("base64");
      return `${cardPath} PNG signature byte 1 -> 0x00`;
    },
  },
  cardsize: {
    target: CHECK.cardDimensions,
    // The wrong canvas. `lib/og/dimensions.ts` exists because a card drawn at a
    // different size than the one declared letterboxes silently — no error, no
    // failing check. This is that failing check.
    apply: (cap) => {
      const cardPath = firstCard(cap);
      const buffer = Buffer.from(cap.cards[cardPath].head32, "base64");
      buffer.writeUInt32BE(1201, 16);
      cap.cards[cardPath].head32 = buffer.toString("base64");
      return `${cardPath} IHDR width -> 1201`;
    },
  },
  cardwordscollapse: {
    target: CHECK.cardWords,
    // THE REGRESSION THIS CHECK EXISTS FOR: `OgCard` loses its `title` prop, or
    // the slug->route lookup collapses to the root, and every card renders the
    // same picture. Status, type, size and IHDR all still pass; only the body
    // hashes give it away.
    apply: (cap) => {
      const routes = [...cap.routes].sort();
      const one = cap.cards[ogImagePath(routes[0])]?.bodyHash;
      if (!one) return undefined;
      for (const route of routes) {
        const card = cap.cards[ogImagePath(route)];
        if (card) card.bodyHash = one;
      }
      return `every card body collapsed onto one hash (${one.slice(0, 12)})`;
    },
  },
  cardwordsgroup: {
    target: CHECK.cardWords,
    // The within-group half of the law, which has no non-trivial instance in
    // today's content (every route's {title, description} pair is distinct), so
    // the control MAKES one out of real input: `/terms`'s registry row is given
    // `/privacy`'s words. The two routes now share a group while their cards
    // still differ, and "same words, different cards" fires.
    apply: (cap) => {
      const registry = parseRegistry(cap.llms.text);
      const privacy = registry.byRoute.get("/privacy") ?? UNLISTED_PAGE_META["/privacy"];
      const before = cap.llms.text;
      // `/terms` is not in /llms.txt, so the restatement is what must move; the
      // capture cannot carry that, so the row is INSERTED into /llms.txt, which
      // makes /terms registry-sourced and /privacy's words its own.
      cap.llms.text = `${before.trimEnd()}\n- [${privacy.title}](${SITE}/terms): ${privacy.description}\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: /terms given /privacy's exact words, putting two differently-drawn cards in one group";
    },
  },
  // --- layer 2 --------------------------------------------------------------
  pagestatus: {
    target: CHECK.pageStatus,
    // A page that stopped rendering. The body is replaced with what an error
    // response actually carries, so no check reads tags off a document the
    // status says was never served.
    apply: (cap) => {
      const route = firstRoute(cap);
      cap.pages[route] = { status: 500, html: "<html><head><title>500</title></head><body></body></html>" };
      return `${route} -> 500 with an error body`;
    },
  },
  tagdrop: {
    target: CHECK.tagSet,
    apply: (cap) => editHead(cap, "/terms", (head) => dropTag(head, "og:site_name"), "og:site_name dropped"),
  },
  tagadd: {
    target: CHECK.tagSet,
    // An ELEVENTH og tag. A subset test passes this; set equality does not.
    apply: (cap) =>
      editHead(cap, "/terms", (head) => `${head}<meta property="og:locale" content="en_US"/>`, "og:locale added"),
  },
  tagdupe: {
    target: CHECK.tagSet,
    // The same tag twice. Set equality over a deduplicated map passes this,
    // which is why `readTags` returns an array.
    apply: (cap) =>
      editHead(cap, "/terms", (head) => `${head}<meta property="og:type" content="website"/>`, "og:type duplicated"),
  },
  leak: {
    target: CHECK.tagPlacement,
    // The set escaping `<head>`, where no crawler reads it. CORRUPTS THE HTML,
    // not a stored count: the check's answer is derived by `splitHead` plus
    // `readTags(tail)`, and a control that wrote the derived number instead
    // would go red while leaving that derivation untested — B5's second named
    // failure, inverted. A duplicate canonical is appended AFTER `</head>` so
    // the head's own set stays intact and this mode isolates placement.
    apply: (cap) => {
      const route = firstRoute(cap);
      const page = cap.pages[route];
      const before = page.html;
      page.html = before.replace("</head>", `</head><link href="${SITE}/" rel="canonical"/>`);
      if (page.html === before) return undefined;
      return `${route}: a canonical link moved after </head>`;
    },
  },
  imagepath: {
    target: CHECK.ownCard,
    // A page pointing at another page's card — the failure mode a per-route
    // card set has and a single static card never did.
    apply: (cap) =>
      editHead(cap, "/terms", (head) => setTag(head, "og:image", `${SITE}/og/privacy.png`), "og:image -> /og/privacy.png"),
  },
  slash: {
    target: CHECK.pageUrl,
    apply: (cap) => editHead(cap, "/", (head) => setTag(head, "og:url", SITE), "root og:url loses its trailing slash"),
  },
  llmsstatus: {
    target: CHECK.registryServed,
    // STATUS ONLY. It used to blank the text too, which also emptied the parse
    // — fine while those were one assertion, but now it would reach two
    // targets and leave `registryParsed` without a corruption of its own.
    apply: (cap) => {
      cap.llms.status = 500;
      return "/llms.txt -> 500";
    },
  },
  llmsdupe: {
    target: CHECK.registryUnique,
    // One row emitted twice. `parseRegistry` builds a Map, so a duplicate is
    // silently the last one and every downstream diff still passes; only a
    // cardinality test sees it.
    apply: (cap) => {
      const before = cap.llms.text;
      const lines = before.split("\n");
      const i = lines.findIndex((line) => line.includes("](https://sevenui.dev/docs/components/button):"));
      if (i === -1) return undefined;
      lines.splice(i, 0, lines[i]);
      cap.llms.text = lines.join("\n");
      return "/llms.txt: row for /docs/components/button emitted twice";
    },
  },
  llmsdrop: {
    target: CHECK.coverage,
    // A route falling out of the registry index. The input diff then has no
    // side to run against, and a gate that skipped it silently would report
    // "all routes checked" while checking fewer.
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before
        .split("\n")
        .filter((line) => !line.includes("](https://sevenui.dev/docs/components/button):"))
        .join("\n");
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: row for /docs/components/button removed";
    },
  },
  description: {
    target: CHECK.descriptionDiff,
    // The card's words drifting from the registry's on the PAGE side. One
    // character, because the diff is byte for byte and a normalised or
    // truncated compare would not see it.
    apply: (cap) =>
      editHead(
        cap,
        "/docs/components/button",
        (head) => setTag(head, "og:description", "Displays a button built on the Base UI Button primitive"),
        "og:description loses its full stop",
      ),
  },
  registrydesc: {
    target: CHECK.descriptionDiff,
    // The same diff from the REGISTRY side. Two modes because the check has two
    // inputs and a control that only ever moves one of them proves the
    // comparison is live in one direction.
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(
        "](https://sevenui.dev/docs/components/button): Displays a button",
        "](https://sevenui.dev/docs/components/button): Displays a Button",
      );
      if (cap.llms.text === before) return undefined;
      return "/llms.txt row for /docs/components/button: description re-cased";
    },
  },
  title: {
    target: CHECK.titleDiff,
    apply: (cap) => editHead(cap, "/terms", (head) => setTag(head, "og:title", `Terms${SUFFIX}`), "og:title shortened"),
  },
  galleryrule: {
    target: CHECK.titleDiff,
    // THE GALLERY RULE, which is the reason the title check is three rules and
    // not one. Stage 0 pre-shipped `seo.og.titles` for the gallery children
    // precisely so this stage reproduces them; a gate asserting one uniform
    // rule would have demanded they be flattened, i.e. would have made the
    // correct output unexpressible.
    apply: (cap) =>
      editHead(cap, "/components/button", (head) => setTag(head, "og:title", `Button${SUFFIX}`), "gallery title flattened"),
  },
  rootrule: {
    target: CHECK.titleDiff,
    // THE ROOT-BARE RULE, the third of the three and the one no other control
    // exercised. `/` declares the bare site name; suffixing it would be the
    // shape a "make every title uniform" edit takes.
    apply: (cap) => editHead(cap, "/", (head) => setTag(head, "og:title", `SevenUI${SUFFIX}`), "root title suffixed"),
  },
  // --- the inventory --------------------------------------------------------
  inventorytotal: {
    target: CHECK.inventory,
    // An inventory whose arrays and whose own total disagree — the shape a
    // silently dropped or de-duplicated route takes on the way into the sweep.
    apply: (cap) => {
      if (!cap.inventoryTotals) return undefined;
      cap.inventoryTotals.total += 1;
      return `inventory total -> ${cap.inventoryTotals.total} while the swept lists did not move`;
    },
  },
  // --- layer 3 --------------------------------------------------------------
  ogmiss: {
    target: CHECK.ogMisses,
    // §16.7's lookup replaced by an open generator: an unknown slug renders.
    apply: (cap) => {
      cap.misses[OG_MISSES[0]].status = 200;
      return `${OG_MISSES[0]} status -> 200`;
    },
  },
  notfoundfull: {
    target: CHECK.notFoundNoExtras,
    // A 404 that grew a tag it must not have — §16.6's bug pointing the other
    // way, a card URL advertised for a page that does not exist.
    apply: (cap) => editMissing(cap, MISSING_PAGES[0], (head) => `${head}<meta property="og:image" content="${SITE}/og/index.png"/>`, "og:image added"),
  },
  notfoundbare: {
    target: CHECK.notFoundComplete,
    // A 404 shipping ZERO og/twitter tags — the exact defect this gate found on
    // its first run, and the branch that had no control until this round: every
    // other 404 mode either adds a tag or flips a status, so none of them ever
    // produced a non-empty `missing` list.
    apply: (cap) =>
      editMissing(
        cap,
        MISSING_PAGES[0],
        (head) => head.replace(/<meta\b[^>]*\b(?:property|name)="(?:og|twitter):[^"]*"[^>]*>/gu, ""),
        "every og:/twitter: tag stripped",
      ),
  },
  notfoundcard: {
    target: CHECK.notFoundCard,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:card", "summary_large_image"), "twitter:card -> summary_large_image"),
  },
  notfoundleak: {
    target: CHECK.notFoundPlacement,
    apply: (cap) => {
      const page = cap.missingPages[MISSING_PAGES[0]];
      if (!page) return undefined;
      const before = page.html;
      page.html = before.replace("</head>", `</head><meta property="og:type" content="website"/>`);
      if (page.html === before) return undefined;
      return `${MISSING_PAGES[0]}: an og:type moved after </head>`;
    },
  },
  notfoundtitle: {
    target: CHECK.notFoundOgTitle,
    // §17.6 #28 de-applied: the 404 title loses its suffix. Until this round
    // nothing in the repo asserted that string, so this regression was free.
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "og:title", "Page not found"), "og:title de-suffixed"),
  },
  notfounddesc: {
    target: CHECK.notFoundOgDescription,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "og:description", "Something else entirely"), "og:description replaced"),
  },
  fieldlives: {
    target: CHECK.notFoundStatus,
    // §17.4 singles `/components/field` out: §11.7's old target must still 404
    // rather than "quietly becoming something". This is that quiet becoming.
    apply: (cap) => {
      const page = cap.missingPages["/components/field"];
      if (!page) return undefined;
      page.status = 200;
      return "/components/field -> 200";
    },
  },
  registryparsed: {
    target: CHECK.registryParsed,
    // A `/llms.txt` that still answers 200 but yields no rows — a generator
    // whose line shape changed, say. `llmsstatus` cannot reach this: it moves
    // the status and nothing else.
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(/^- \[/gmu, "* [");
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every row's bullet changed, so nothing parses";
    },
  },
  coveragedouble: {
    target: CHECK.coverageSingleSource,
    // A route answered by BOTH sides. `/terms` is a restatement route, so
    // giving it a `/llms.txt` row makes the registry and the literal table
    // both claim it.
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = `${before.trimEnd()}\n- [Terms of Service](${SITE}/terms): A second, competing answer.\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: /terms given a row, so both sides now answer for it";
    },
  },
  coveragestray: {
    target: CHECK.coverageNoStray,
    // A restated route the inventory no longer carries — the shape a page
    // being deleted takes, leaving the table asserting a page that is gone.
    apply: (cap) => {
      const before = cap.routes.length;
      cap.routes = cap.routes.filter((route) => route !== "/terms");
      if (cap.routes.length === before) return undefined;
      return "/terms dropped from the swept inventory while the restatement still names it";
    },
  },
  cardunproven: {
    target: CHECK.cardProven,
    // A page naming the right card URL for a card this run did NOT prove.
    // Overlaps `cardStatus` by design: that overlap IS the layer-1/layer-2
    // join, and it now has a control of its own rather than riding on one.
    apply: (cap) => {
      const card = cap.cards[ogImagePath("/terms")];
      if (!card) return undefined;
      card.status = 503;
      return "/og/terms.png -> 503 while /terms still names it";
    },
  },
  notfoundtwittertitle: {
    target: CHECK.notFoundTwitterTitle,
    // §17.6 #28 de-applied on the `twitter:` half only — the exact deletion
    // that used to pass silently, because the one control moved `og:title`.
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:title", "Page not found"), "twitter:title de-suffixed"),
  },
  notfoundtwitterdesc: {
    target: CHECK.notFoundTwitterDescription,
    apply: (cap) =>
      editMissing(cap, MISSING_PAGES[0], (head) => setTag(head, "twitter:description", "Something else entirely"), "twitter:description replaced"),
  },
  witnesstitle: {
    target: CHECK.cardWitnessTitle,
    // Empties the title-witness class, which is what the law needs in order to
    // catch a card that stops drawing the TITLE. Measured on the preview, that
    // class is a SINGLE group: `/` (SevenUI), `/account` (Account) and `/docs`
    // (Introduction) all carry the site description — the first two by §16.4's
    // fallback, the third because the docs index genuinely has that sentence.
    // So the control makes every registry description unique and gives
    // `/account` a row of its own, leaving `/` the only holder of the site
    // description and no two routes sharing one. That is a registry state
    // nothing forbids, and it would silently blind the law in this direction.
    apply: (cap) => {
      const before = cap.llms.text;
      let n = 0;
      const unique = before.replace(/^(- \[[^\]]+\]\(https:\/\/sevenui\.dev[^)]*\): )(.*)$/gmu, (whole, head, description) => {
        n += 1;
        return `${head}${description} [${n}]`;
      });
      cap.llms.text = `${unique.trimEnd()}\n- [Account](${SITE}/account): An account description of its very own.\n`;
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every description made unique and /account given its own row — no two routes share a description";
    },
  },
  witnessdesc: {
    target: CHECK.cardWitnessDescription,
    // Empties the description-witness class. Those witnesses are the ten
    // `/components/<slug>` rows, each sharing its bare title with the matching
    // `/docs/components/<slug>` primitive; renaming the gallery rows' titles
    // leaves no two routes sharing a title.
    apply: (cap) => {
      const before = cap.llms.text;
      cap.llms.text = before.replace(
        /^- \[([^\]]+)\]\((https:\/\/sevenui\.dev\/components\/[^)]+)\): /gmu,
        (whole, title, url) => `- [${title} Gallery](${url}): `,
      );
      if (cap.llms.text === before) return undefined;
      return "/llms.txt: every /components/<slug> title made unique, dissolving the description witnesses";
    },
  },

};

// ONE GENERATED CONTROL PER RELATION. Written as a loop rather than twelve
// hand-copied blocks so a relation cannot be added without one: `breaks` is a
// required field of every RELATIONS entry, and this loop turns each into a
// mode. The corruption is applied to `/terms`, which carries the full tag set.
for (const relation of RELATIONS) {
  const mode = `relation:${relation.breaks.key}=${relation.breaks.value}`;
  PERTURB[mode] = {
    target: relationCheck(relation.name),
    apply: (cap) =>
      editHead(
        cap,
        "/terms",
        (head) => setTag(head, relation.breaks.key, relation.breaks.value),
        `${relation.breaks.key} -> ${JSON.stringify(relation.breaks.value)}`,
      ),
  };
}

// The perturbation helpers below all report whether they applied. A control
// that matched nothing must be loud: a silent no-op is a control reporting PASS
// about a check it never exercised.
const firstRoute = (cap) => [...cap.routes].sort()[0];
const firstCard = (cap) => ogImagePath(firstRoute(cap));

// The 404 equivalent of `editHead`: same contract, same honesty about whether
// the edit landed, against `cap.missingPages` instead of `cap.pages`.
function editMissing(cap, pathname, edit, what) {
  const page = cap.missingPages[pathname];
  if (!page) return undefined;
  const { head, tail } = splitHead(page.html);
  const edited = edit(head);
  if (edited === head) return undefined;
  page.html = edited + tail;
  return `${pathname}: ${what}`;
}

function editHead(cap, route, edit, what) {
  const page = cap.pages[route];
  if (!page) return undefined;
  const { head, tail } = splitHead(page.html);
  const edited = edit(head);
  if (edited === head) return undefined;
  page.html = edited + tail;
  return `${route}: ${what}`;
}

function dropTag(head, key) {
  return head.replace(new RegExp(`<meta\\b[^>]*\\b(?:property|name)="${key}"[^>]*>`, "u"), "");
}

function setTag(head, key, value) {
  return head.replace(
    new RegExp(`<meta\\b[^>]*\\b(?:property|name)="${key}"[^>]*>`, "u"),
    `<meta property="${key}" content="${value}"/>`,
  );
}

// --- CLI --------------------------------------------------------------------

function parseArgs(argv) {
  const args = { verbose: false, controls: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--verbose") args.verbose = true;
    else if (arg === "--controls") args.controls = true;
    else if (arg.startsWith("--")) args[arg.slice(2)] = argv[++i];
  }
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * `route-inventory.mjs` prints ONE JSON object, not a list of routes. Every
 * key but `notFound` and `total` is a route list: `/404` gets no card, so it is
 * not part of the sweep — it is covered instead by layer 3, which fetches six
 * missing pages and asserts the reduced set on each.
 *
 * `notFound` and `total` are carried through rather than discarded, so
 * `CHECK.inventory` can reconcile the inventory's own arithmetic against what
 * was actually swept.
 */
function routesFromInventory(json) {
  const inventory = JSON.parse(json);
  const routes = [];
  for (const [key, value] of Object.entries(inventory)) {
    if (key === "notFound" || key === "total") continue;
    if (!Array.isArray(value)) continue;
    routes.push(...value);
  }
  const unique = [...new Set(routes)];
  if (unique.length === 0) throw new Error("inventory produced no routes — refusing to report a clean sweep of nothing");
  return {
    routes: unique.sort(),
    totals: { notFound: (inventory.notFound ?? []).length, total: inventory.total },
  };
}

const args = parseArgs(process.argv.slice(2));
const controlMode = process.env.POSITIVE_CONTROL;
if (controlMode && !PERTURB[controlMode]) {
  console.error(`unknown POSITIVE_CONTROL mode "${controlMode}"; known: ${Object.keys(PERTURB).join(", ")}`);
  process.exit(2);
}

let captured;
if (args.load) {
  captured = JSON.parse(await readFile(args.load, "utf8"));
} else {
  if (!args.base) {
    console.error("usage: og-sweep.mjs --base <url> [--inventory <file>] [--save <file>] [--verbose] [--controls]");
    console.error("   or: og-sweep.mjs --load <file> [--verbose] [--controls]");
    process.exit(2);
  }
  const inventoryJson = args.inventory ? await readFile(args.inventory, "utf8") : await readStdin();
  const { routes, totals } = routesFromInventory(inventoryJson);
  console.log(`sweeping ${routes.length} routes on ${args.base} (${bypass ? "bypass header set" : "NO bypass header"})`);
  captured = await capture(args.base, routes, totals);
  if (args.save) await writeFile(args.save, JSON.stringify(captured));
}
// Printed on every run, `--load` included, so a saved capture carries the
// identity of what it captured. See `capture()` for what these two are and,
// more to the point, what they are not: Vercel exposes no deployment-id header
// to a client, so `x-vercel-id` is a request identity and the etag is the
// closest build-derived fingerprint available.
console.log(
  `deployment: x-vercel-id ${captured.deployment?.xVercelId ?? "(none)"} ` +
    `| /llms.txt etag ${captured.deployment?.llmsEtag ?? "(none)"} | base ${captured.base}\n`,
);

const clone = () => JSON.parse(JSON.stringify(captured));

const subject = clone();
if (controlMode) {
  const applied = PERTURB[controlMode].apply(subject);
  if (!applied) {
    console.error(`POSITIVE_CONTROL "${controlMode}" matched nothing — it would have reported a clean run while`);
    console.error("changing nothing, which is the exact failure a control exists to prevent.");
    process.exit(2);
  }
  console.log(`POSITIVE_CONTROL ${controlMode}: ${applied}\n      target: ${PERTURB[controlMode].target}\n`);
}

const { results, notes } = runChecks(subject, { verbose: args.verbose });
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}${result.detail ? `\n      ${result.detail}` : ""}`);
}
for (const note of notes) console.log(note);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} assertions passed`);

let controlsFailed = 0;
// A control proves its check only if that check was GREEN before the
// corruption and RED after it. Against an already-failing target the "red"
// carries no information — it was going to be red either way — which is
// Critical 1's defect wearing a different hat: a verdict that cannot
// distinguish "the control works" from "the site is broken here". Those
// targets are reported INDETERMINATE rather than LIVE, and they count against
// the run, so a real defect cannot quietly buy a control its pass mark.
//
// COMPUTED FROM ITS OWN CLEAN CLONE, never from `results`. `results` is the run
// over `subject`, and under `POSITIVE_CONTROL=<mode>` the subject is ALREADY
// CORRUPTED — so reusing it inverted the whole guard on that path: a control
// that worked made its target red, the target was therefore absent from the
// baseline, and the gate announced "already failing before the corruption"
// about a check `--controls` proves was green. Worse than a broken flag,
// because a genuinely blocked control prints that same line, so the two cases
// this guard exists to separate became indistinguishable in single-mode. The
// batch path was always right (it reads its baseline before cloning); this
// makes both paths read the same thing the same way.
const baselineOk = new Set(
  runChecks(clone(), { verbose: false })
    .results.filter((r) => r.ok)
    .map((r) => r.name),
);

if (controlMode) {
  // Under a single-mode run the gate is being proved, not run.
  const { target } = PERTURB[controlMode];
  if (!baselineOk.has(target)) {
    console.log(`\nCONTROL INDETERMINATE: target "${target}" was already failing before the corruption`);
    process.exit(1);
  }
  const hit = failed.some((r) => r.name === target);
  console.log(hit ? "\nCONTROL LIVE: its target check went red" : "\nCONTROL DEAD: its target check still passed");
  process.exit(hit ? 0 : 1);
}

if (args.controls) {
  console.log("\n--- positive controls: each corrupts the real capture; its TARGET assertion must go green -> red ---");
  for (const [mode, { target, apply }] of Object.entries(PERTURB)) {
    if (!baselineOk.has(target)) {
      console.log(
        `INDETERMINATE  ${mode}: target "${target}" is already failing on the clean run,\n` +
          "               so its going red under the control proves nothing. Fix the finding, then re-run.",
      );
      controlsFailed += 1;
      continue;
    }
    const corrupted = clone();
    const applied = apply(corrupted);
    if (!applied) {
      console.log(`DEAD  ${mode}: matched nothing in the capture`);
      controlsFailed += 1;
      continue;
    }
    const { results: controlResults } = runChecks(corrupted, { verbose: false });
    const red = controlResults.filter((r) => !r.ok);
    const onTarget = red.find((r) => r.name === target);
    if (!onTarget) {
      console.log(
        `DEAD  ${mode}: ${applied}\n      target "${target}" still passed` +
          (red.length ? `; ${red.length} other check(s) went red, which decides nothing` : "; nothing went red"),
      );
      controlsFailed += 1;
      continue;
    }
    console.log(`LIVE  ${mode}: ${applied}`);
    console.log(`      FAIL  ${onTarget.name}\n            ${onTarget.detail}`);
    const collateral = red.filter((r) => r.name !== target);
    if (collateral.length) console.log(`      (collateral, decides nothing: ${collateral.map((r) => r.name).join(" | ")})`);
  }
  const total = Object.keys(PERTURB).length;
  console.log(`\n${total - controlsFailed}/${total} positive controls went red on their own target`);

  // EVERY ASSERTION must be something's target — not every CHECK. The
  // distinction is this round's second finding: the old claim was true of
  // checks and a reviewer proved it meant nothing, deleting eleven of twelve
  // self-consistency relations and the branch that detects a 404 with no tags
  // at all, in both cases keeping a full set of LIVE controls and a clean run.
  // The list below is therefore the ASSERTION list — `CHECK`'s named entries
  // plus the twelve generated relation names — and it is cross-checked in both
  // directions: an assertion nothing targets is unguarded, and a target no
  // assertion produces is a control aimed at a check that no longer exists.
  const assertionNames = [...DECLARED_CHECKS.map((key) => CHECK[key]), ...DECLARED_RELATIONS.map(relationCheck)];
  const produced = new Set(results.map((r) => r.name));
  const targeted = new Set(Object.values(PERTURB).map((mode) => mode.target));
  const unguarded = assertionNames.filter((name) => !targeted.has(name));
  const orphanTargets = [...targeted].filter((name) => !produced.has(name));
  const unrecorded = assertionNames.filter((name) => !produced.has(name));
  if (unguarded.length || orphanTargets.length || unrecorded.length) {
    if (unguarded.length) {
      console.log(`\nUNGUARDED ASSERTIONS (no control names them as its target):\n  ${unguarded.join("\n  ")}`);
    }
    if (orphanTargets.length) {
      console.log(`\nORPHAN TARGETS (a control names them, but no assertion is recorded under that name):\n  ${orphanTargets.join("\n  ")}`);
    }
    if (unrecorded.length) {
      console.log(`\nDECLARED BUT NEVER RECORDED:\n  ${unrecorded.join("\n  ")}`);
    }
    controlsFailed += unguarded.length + orphanTargets.length + unrecorded.length;
  } else {
    console.log(
      `every one of the ${assertionNames.length} ASSERTIONS is recorded and is named as some control's target ` +
        `(${DECLARED_CHECKS.length} named + ${DECLARED_RELATIONS.length} generated relations, both declared)`,
    );
  }
}

process.exit(failed.length === 0 && controlsFailed === 0 ? 0 : 1);
