import "server-only";

import { getDocIndex, type DocPage } from "./index";
import { stripFences } from "./headings";
import { buildNavTree, isNavGroup, type NavNode } from "./nav";
import { POPULAR, type SearchEntry } from "./search";

// §9's measurement: 509 h2/h3 headings across the corpus, only 261 distinct,
// and these three strings alone account for 195 of the 509 occurrences —
// every page repeats the same "Installation / Usage / API reference"
// skeleton. Indexing them would put three maximally non-selective entries on
// nearly every page (the section right above this one names the actual
// number: full-text search on this corpus already struggles because 65 of
// 69 pages share one skeleton; doing the same thing at heading granularity
// would make it worse, not better). The 314 headings that remain after
// excluding these three are the page-specific ones — "Loading", "With
// icons", "Controlled" — that a query can actually discriminate on.
const GENERIC_HEADINGS = new Set(["Installation", "Usage", "API reference"]);

// Tag-shaped only — a name (or a closing slash) right after `<`, nothing
// past the next `>`. This is deliberately the same shape Blume's own
// `HTML_OR_JSX` regex uses (`node_modules/blume/src/search/documents.ts`):
// it catches both bare HTML (`<details>`) and MDX component usage
// (`<Component path="…" />`, `<InstallCommand item="…" />`) without needing
// to know this corpus's component names, and it leaves a bare `<` in prose
// ("costs < 5 credits") alone because that is not followed by a tag-shaped
// run.
const JSX_OR_HTML_TAG = /<\/?[a-zA-Z][^\n<>]*>|<\/?>/g;

// MDX's own import/export lines. None exist in this corpus today outside
// fenced code samples (which `stripFences` has already blanked by the time
// this runs), but the body reducer is not allowed to assume that stays
// true — a future page could add a real `import { Foo } from "./foo"` at
// the top, and without this it would read as body prose instead of being
// dropped.
const MDX_IMPORT_EXPORT_LINE = /^[ \t]*(?:import|export)\b.*$/gm;

const MARKDOWN_HEADING_MARKER = /^[ \t]{0,3}#{1,6}[ \t]+/gm;

// A GFM table's separator row — `| --- | --- |`, `|:---|---:|`, or the same
// without the outer pipes — carries zero words, only alignment punctuation.
// Left in place it is pure noise (a prop table's separator row is
// indistinguishable from three dashes typed as an em-dash substitute), so
// the whole line is dropped rather than reduced to spaces like everything
// else here. `MARKDOWN_TABLE_PIPE` below then turns every remaining `|` —
// a header row's and every data row's cell delimiters — into a space, so a
// table degrades to space-separated cell text instead of surviving as
// pipe-fenced markup; this corpus's API-reference tables are 59 of this
// task's 69 pages, so this is not a rare case worth leaving unhandled.
const MARKDOWN_TABLE_SEPARATOR_ROW =
  /^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/gm;

// A cell that needs a literal `|` in its rendered text (a union-type prop
// value like `true | false | "trap-focus"`, `sheet.mdx:82`) writes it
// backslash-escaped — `\|` — so CommonMark's table parser does not read it
// as a cell boundary. `MARKDOWN_TABLE_PIPE` below turns every unescaped `|`
// into a space; run unescaped first, or the backslash has nothing left to
// belong to once its pipe becomes a space and survives alone (a real defect
// found in review: `disablePointerDismissal`'s row rendered as `true \
// false \ "trap-focus" true`, stray backslash and all — 141 occurrences
// across 43 of the 69 pages). Unescaping first folds `\|` into an ordinary
// `|`, which the very next pass then turns into a space like any other cell
// delimiter — the union's members end up space-separated words
// (`true false "trap-focus"`), which is what a search body wants from them
// anyway.
const MARKDOWN_ESCAPED_PIPE = /\\\|/g;
const MARKDOWN_TABLE_PIPE = /\|/g;

// `[text](target)` keeps `text`, drops the target — the same trade Blume's
// `toPlainText` makes (it walks the mdast tree instead of regexing, but
// lands on the identical rule: a link's visible words are searchable body
// text, its destination is not).
const MARKDOWN_LINK = /\[([^\]\n]+)\]\([^)\n]+\)/g;

// Inline emphasis/code delimiters: `**bold**`, `*italic*`, `_italic_`,
// `` `code` ``. Stripping the delimiter and keeping what is between it
// (nothing further needed — the text itself is already left in place by a
// character-class strip) is what Step 5's "no markup left in it" asks for;
// it does not need the underlying words to survive with their emphasis
// intact, only for the `*`/`_`/`` ` `` characters themselves to be gone.
//
// This is unconditional, including word-internally, so a future
// `snake_case` prop name or a `*.tsx` glob written in prose loses a
// character and becomes unsearchable by its real spelling (`snake_case`
// reduces to `snakecase`). Considered and accepted rather than fixed: zero
// occurrences in the corpus today (this codebase's prop names are
// camelCase, not snake_case, and no page's prose contains a glob), and a
// word-boundary-aware version would have to special-case exactly the `_`
// that legitimately opens/closes emphasis vs. one sitting inside a word —
// the kind of edge a full Markdown parser resolves for free and a
// hand-rolled regex cannot without becoming its own small parser.
const MARKDOWN_EMPHASIS_MARKER = /\*\*|\*|__|_|~~|`/g;

const WHITESPACE_RUN = /\s+/g;

/**
 * Reduce a page's raw MDX (`DocPage.raw`, already frontmatter-blanked by
 * `lib/docs/index.ts`) to plain, searchable prose. Reuses `stripFences` —
 * the exact function `rehype`'s own heading scan uses to blank fenced code
 * before it runs — rather than writing a second fence stripper that could
 * drift from it. This is intentionally not a full Markdown parse (Blume's
 * `toPlainText` in `documents.ts` walks an mdast tree for that, at the cost
 * of two new production dependencies — `mdast-util-from-markdown` and
 * `mdast-util-gfm` are today only transitive under the `blume`
 * devDependency); a page-level search body does not need a perfect
 * reduction, and a regex pipeline gets close for a fraction of the
 * dependency cost.
 *
 * "Close" is deliberate wording, not "complete" — this pipeline has two
 * known blind spots, found in review, that are accepted rather than chased
 * with more regex:
 *
 * - `JSX_OR_HTML_TAG`'s `[^\n<>]*` cannot span an inner `<...>`, so a
 *   NESTED JSX expression abandons its outer tag: `<BubbleContent
 *   render={<div />}>` (`bubble.mdx:30`) leaves a stray `render={ }>`
 *   fragment in the body instead of disappearing entirely. 8 occurrences
 *   across 3 files today (`bubble.mdx`, `toolbar.mdx`, `navigation-menu.mdx`).
 * - Markdown LIST MARKERS (`- `, `* ` at a line start) are not stripped by
 *   anything in this pipeline, so a bulleted line keeps its leading `- `
 *   token as body noise. 46 lines across 7 files today.
 *
 * Both are real but rare (a low single-digit percentage of pages each), and
 * a regex fix for either invites the same per-case special-casing that
 * justified not reaching for a parser in the first place — the fix for
 * nested JSX is "handle arbitrary nesting depth," which a regex cannot do
 * at all; a parser would. If either count grows, that is the signal to
 * revisit the parser trade above, not to add a third layer of lookaround.
 */
function toSearchBody(raw: string): string {
  return stripFences(raw)
    .replace(MDX_IMPORT_EXPORT_LINE, " ")
    .replace(JSX_OR_HTML_TAG, " ")
    .replace(MARKDOWN_HEADING_MARKER, "")
    .replace(MARKDOWN_TABLE_SEPARATOR_ROW, "")
    .replace(MARKDOWN_ESCAPED_PIPE, "|")
    .replace(MARKDOWN_TABLE_PIPE, " ")
    .replace(MARKDOWN_LINK, "$1")
    .replace(MARKDOWN_EMPHASIS_MARKER, "")
    .replace(WHITESPACE_RUN, " ")
    .trim();
}

/**
 * Maps every content-index route to its search "section" — Blume's
 * `SearchDocument.section`, the field its own `documents.ts` (lines
 * 146-180) calls "top-level section label, used by the search filter
 * pills", reproduced under its accurate name (`breadcrumb` is not carried;
 * §9 Step 7 says it is "never rendered", so nothing here builds it). The
 * rule, copied from `buildCrumbIndex` at `documents.ts:156-188`: a page's
 * section is its nearest ancestor nav GROUP's label, defaulting to "Docs"
 * for a page with no group ancestor — and a group's own landing page
 * (`documents.ts:158-170`'s point) carries that group's own label rather
 * than the label of whatever it is nested under, because reaching a group
 * node while walking is not the same as being a member of it.
 *
 * With `buildNavTree`'s current shape (§11.3 groups are never nested inside
 * one another) this resolves to exactly two labels: "Docs" for the three
 * loose root pages, "Primitives" for `/docs/components` itself (the group's
 * own `href`) and every page under `/docs/components/`. The walk is written
 * generically rather than as a route-prefix test — `route.startsWith(...)`
 * would silently stop tracking the nav tree the moment a second group is
 * added — so this function is the one place that has to change if that
 * ever happens, not every call site.
 */
function buildSectionIndex(tree: NavNode[]): Map<string, string> {
  const sections = new Map<string, string>();
  const walk = (nodes: NavNode[], section: string): void => {
    for (const node of nodes) {
      if (isNavGroup(node)) {
        if (node.href !== undefined) sections.set(node.href, node.label);
        walk(node.children, node.label);
      } else {
        sections.set(node.href, section);
      }
    }
  };
  walk(tree, "Docs");
  return sections;
}

// §9 Step 5's assertions (four in the brief, plus two review findings —
// see below), moved here from the brief's non-runnable verify script (it
// `require()`s a `.json` and a `.ts` file in a `"type": "module"` repo, so
// it cannot run as written). Living inside the builder means a violation
// fails `next build` itself — the artifact simply cannot be produced —
// instead of failing a script someone has to remember to run after the
// fact and that a diff would not otherwise catch.

// A corpus-wide floor on total page-body length (§9 Step 2's "body text
// stays, page-level only"), added in review: none of the original checks
// inspected `body` at all. Measured at ~80.6K characters today — the same
// quantity §9.3 independently states as "81 KiB of body text" for this
// corpus, confirming the reducer is at or slightly under the spec's own
// measurement of the same quantity (the asset's overshoot against §9.2's
// 113 KiB lives entirely in per-entry JSON overhead, not in body text — see
// the task report). The floor is set at roughly half that, deliberately
// loose: this is not pinning the corpus's exact size, it exists purely as a
// trip wire for the one failure mode nothing else here catches — `body`
// silently going empty or near-empty. `/docs/components` legitimately ships
// `"body": ""` (its source is a single `<PrimitiveIndex />`), so "some
// pages have an empty body" is a reachable, correct state and cannot be the
// check; only the SUM across all pages can tell a legitimate single empty
// body apart from a reducer bug (say, `JSX_OR_HTML_TAG` widened to also
// match plain prose, or reordered ahead of `stripFences`) that empties
// every page's body at once. Before this assertion existed, that failure
// mode passed every other check and `next build` would have shipped it
// silently.
const MIN_TOTAL_BODY_CHARS = 40_000;

function assertSearchIndex(entries: SearchEntry[], pages: DocPage[]): void {
  // Unreachable today, kept as a backstop rather than a live check:
  // `getDocIndex()` throws via `assertDocsDirExists()` on a missing docs
  // directory, and `buildNavTree()` throws on a missing skeleton route,
  // both well before an empty `pages` array (and so a zero-length `entries`)
  // could ever reach this function. Left in because "unreachable given
  // today's callers" is not the same guarantee as "unreachable forever."
  if (entries.length === 0) {
    throw new Error(
      "lib/docs/search-index.ts: the search index has zero entries; a vacuous index must fail the build, not diff clean",
    );
  }

  const pageEntries = entries.filter((e) => e.hash === undefined);
  const headingEntries = entries.filter((e) => e.hash !== undefined);

  // Every source page contributes exactly one page-level entry, so this
  // count has to equal the content index's own page count. This is the
  // meaningful half of the brief's "entry count, page count and heading
  // count are internally consistent" ask — the check below is the other
  // half, and it is not meaningful in the same way (see its own comment).
  if (pageEntries.length !== pages.length) {
    throw new Error(
      `lib/docs/search-index.ts: expected ${pages.length} page entries (one per content-index page), found ${pageEntries.length}`,
    );
  }
  // Cannot fail as written: `pageEntries` and `headingEntries` are two
  // complementary `filter`s over `entries` on `e.hash === undefined` and
  // its negation, so their lengths sum to `entries.length` by construction
  // of `filter` itself, independent of anything `buildSearchIndex`'s loop
  // does. Kept anyway as a shape guard — the day a third entry kind exists
  // (neither a bare page nor a `hash`-bearing heading) this stops being a
  // tautology and starts being the check that notices `entries` grew a
  // member neither filter above claims.
  if (pageEntries.length + headingEntries.length !== entries.length) {
    throw new Error(
      `lib/docs/search-index.ts: ${pageEntries.length} page entries + ${headingEntries.length} heading entries ` +
        `!== ${entries.length} total entries`,
    );
  }

  const totalBodyChars = pageEntries.reduce((sum, e) => sum + (e.body?.length ?? 0), 0);
  if (totalBodyChars < MIN_TOTAL_BODY_CHARS) {
    throw new Error(
      `lib/docs/search-index.ts: total page body length is ${totalBodyChars} characters, below the ` +
        `${MIN_TOTAL_BODY_CHARS}-character floor — toSearchBody may be silently emptying body text ` +
        `(measured ~80,600 characters on a healthy corpus; see MIN_TOTAL_BODY_CHARS above)`,
    );
  }

  // Case-folded and trimmed ON PURPOSE, while the exclusion this guards
  // (`GENERIC_HEADINGS.has(heading.text)`, below in `buildSearchIndex`) stays
  // an EXACT match. An exact-vs-exact check here would be tautological — no
  // corpus input can make the exact exclusion skip a heading that an
  // identically-exact check then also fails to catch, which is what this
  // assertion originally did before review caught it. Normalizing only the
  // assertion means the two now disagree on exactly the inputs that matter:
  // an author writing `## API Reference` (capital R) or `## Usage ` (trailing
  // space) sails past the exact exclusion — `GENERIC_HEADINGS.has(...)`
  // returns false for either — and lands in `headingEntries` as a real
  // entry, which this normalized check then catches and fails the build on,
  // naming the offending heading and its route. No such variant exists in
  // this corpus today, so this is a LATENT guard against a future authoring
  // slip, not a check exercised by any input in the repo right now.
  const normalize = (s: string): string => s.trim().toLowerCase();
  const normalizedGeneric = new Set([...GENERIC_HEADINGS].map(normalize));
  for (const entry of headingEntries) {
    if (normalizedGeneric.has(normalize(entry.title))) {
      throw new Error(
        `lib/docs/search-index.ts: heading "${entry.title}" on ${entry.route}#${entry.hash} is a case/whitespace ` +
          `variant of a generic heading that should have been excluded (compare against: ${[...GENERIC_HEADINGS].join(", ")})`,
      );
    }
  }

  for (const popular of POPULAR) {
    if (!popular.href.startsWith("/docs/")) {
      throw new Error(
        `lib/docs/search-index.ts: POPULAR entry "${popular.href}" is missing the literal /docs/ prefix ` +
          `(§9 Step 4 — Blume applied this through basePath; there is no basePath here)`,
      );
    }
  }

  // The check that would actually have caught the landmine §9 Step 4 names:
  // `/docs/components/button` passing the prefix check above says nothing
  // about whether it is the RIGHT page — a typo like
  // `/docs/components/buton` also starts with `/docs/` and would sail
  // through the assertion above. Resolving each href against the real
  // content-index route set is the only check that fails on that typo.
  const routes = new Set(pages.map((p) => p.route));
  for (const popular of POPULAR) {
    if (!routes.has(popular.href)) {
      throw new Error(
        `lib/docs/search-index.ts: POPULAR entry "${popular.href}" has no matching page in the content index`,
      );
    }
  }
}

/**
 * Builds the docs search index (§9 Steps 1-4): one page entry plus one
 * heading entry per non-generic h2/h3, for all 69 `.mdx` pages
 * (`/docs/components` included — it is authored MDX like every other page,
 * so it needs no special-casing here). Called once, at build time, by
 * `app/search-index.json/route.ts` — the same server-only `fs` module
 * `getDocIndex` already reads for the sidebar and the pages themselves, so
 * this is not a second reader of the corpus, only a second shape derived
 * from the one read (§9 Step 2).
 *
 * No memoisation here, deliberately: this function has exactly one call
 * site (the route handler above), which itself runs exactly once per
 * production build under `force-static` — there is no request-time fan-in
 * to collapse. `getDocIndex()`, which this calls, already caches its own
 * `fs` read under `NODE_ENV=production` (`lib/docs/index.ts`), so a second
 * cache here would only be memoising the cheap map/filter work on top of an
 * already-cached read — complexity with no request it is answering.
 */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const pages = await getDocIndex();
  const sections = buildSectionIndex(buildNavTree(pages));

  const entries: SearchEntry[] = [];
  for (const page of pages) {
    const section = sections.get(page.route) ?? "Docs";

    entries.push({
      route: page.route,
      title: page.title,
      description: page.description,
      body: toSearchBody(page.raw),
      section,
    });

    for (const heading of page.headings) {
      if (GENERIC_HEADINGS.has(heading.text)) continue;
      entries.push({
        route: page.route,
        hash: heading.id,
        title: heading.text,
        pageTitle: page.title,
        section,
      });
    }
  }

  assertSearchIndex(entries, pages);
  return entries;
}
