import type { SearchEntry } from "../../lib/docs/search";

// The only import in this file is a TYPE import, which TypeScript erases:
// nothing here reaches React, the DOM, `next/*`, or `lib/docs/search`'s
// runtime half. That is deliberate and it is the whole reason the matcher
// lives in its own module rather than inside `command-dialog.tsx`. §21
// records that no automated gate covers this surface — the index is none of
// §17.2's four inventoried route families, the palette renders on no route,
// and Blume's dialog is deleted so there is no old side to diff against — so
// the one mitigation available is to keep the piece that actually decides
// what a reader sees callable from a plain unit test with no jsdom and no
// render.

/**
 * One run of the row's text, flagged by whether the reader's query matched
 * it. Blume's equivalent was an HTML string built by `highlight()` and
 * assigned with `innerHTML`, which is why it needed `highlight()` to escape
 * per segment (so a query like `amp` could not mark the inside of an entity)
 * and `sanitizeExcerpt()` to reduce provider markup to bare `<mark>`. Both
 * are ~60 lines of security-critical code with no successor here, and that
 * is the point (§9.8): a segment array is rendered by React as text nodes
 * and `<mark>` elements, so there is no HTML string to escape and no markup
 * to sanitize. If this type ever grows a field that ends up in
 * `dangerouslySetInnerHTML`, that whole argument collapses and both
 * functions have to come back.
 */
export type HighlightSegment = { readonly text: string; readonly match: boolean };

/**
 * A `SearchEntry` with the derived values that would otherwise be recomputed
 * on every keystroke. The corpus is 383 entries carrying ~81 KiB of body
 * text; `toLowerCase()`-ing all of it per keystroke is not expensive enough
 * to be a bug, but it is pure waste when the index is immutable once fetched
 * — hence one preparation pass, held by the caller for the palette's
 * lifetime.
 */
export type PreparedEntry = {
  readonly entry: SearchEntry;
  /** `route`, or `route#hash` for a heading entry — the row's link target. */
  readonly href: string;
  readonly lowerTitle: string;
  readonly lowerDescription: string;
  readonly lowerBody: string;
};

export type SearchHit = {
  readonly entry: SearchEntry;
  /**
   * `route` for a page entry, `route#hash` for a heading entry — the row's
   * link target, and the caller's React key. It is unique across the corpus
   * without any help: a page href never contains `#`, a heading href always
   * does, and `rehype-slug` gives every heading on a page a distinct id.
   * An earlier revision carried a separate `key` field documented as
   * guarding a page/heading collision on a shared route; no such collision
   * is reachable, so the field is gone rather than left standing as a
   * warning about a hazard nothing guards.
   */
  readonly href: string;
  readonly score: number;
  /** The row's first line: the page title, or the heading's own text. */
  readonly title: readonly HighlightSegment[];
  /**
   * The row's second line: a matched window of the page's description or
   * body, or — for a heading entry — the owning page's title, which §9.7
   * puts there "in place of the excerpt". `null` only when a page has
   * neither description nor body (`/docs/components` ships `body: ""`).
   */
  readonly excerpt: readonly HighlightSegment[] | null;
};

export type SectionCount = { readonly label: string; readonly count: number };

// The ladder from §9.3, as numbers. The gaps are wide and the tiers never
// overlap because the ordering they encode has to be absolute, not
// negotiable by accumulating small bonuses:
//
//   exact title > title prefix > title substring
//     > heading substring > description substring > body substring
//
// §9 measured why this cannot be a plain substring filter. On this corpus 65
// of 69 pages are the same skeleton, so body text is nearly non-selective:
// `installation` appears in 67 of 68 page bodies, `usage` in 66, `props` in
// 47. A matcher that scores a body hit anywhere near a title hit answers
// "installation" with 67 pages in arbitrary order and buries
// `/docs/installation` among them. Base UI's own filter is exactly that —
// an `Intl.Collator`-backed `contains` returning a boolean, no score — which
// is why §9.3 hands it `filteredItems` instead of letting it filter.
//
// A HEADING entry's `title` is a heading, so it is scored on the heading
// rungs rather than the page-title rungs. That single fact is what delivers
// "a page's own entry ranked above its headings, so a page and its sections
// do not interleave": no heading can reach 600, and any page whose title so
// much as contains the query is at 600 or above.
const PAGE_TITLE_EXACT = 1000;
const PAGE_TITLE_PREFIX = 800;
const PAGE_TITLE_CONTAINS = 600;
const PAGE_TITLE_ALL_TERMS = 500;
const HEADING_EXACT = 460;
const HEADING_PREFIX = 430;
const HEADING_CONTAINS = 400;
const HEADING_ALL_TERMS = 350;
const DESCRIPTION_CONTAINS = 200;
const DESCRIPTION_ALL_TERMS = 160;
const BODY_CONTAINS = 100;
const BODY_ALL_TERMS = 80;

type Tiers = {
  readonly exact?: number;
  readonly prefix?: number;
  readonly contains: number;
  readonly allTerms: number;
};

const PAGE_TITLE_TIERS: Tiers = {
  exact: PAGE_TITLE_EXACT,
  prefix: PAGE_TITLE_PREFIX,
  contains: PAGE_TITLE_CONTAINS,
  allTerms: PAGE_TITLE_ALL_TERMS,
};
const HEADING_TIERS: Tiers = {
  exact: HEADING_EXACT,
  prefix: HEADING_PREFIX,
  contains: HEADING_CONTAINS,
  allTerms: HEADING_ALL_TERMS,
};
// No `exact`/`prefix` rung: a description or a body is prose, so "the query
// is the whole field" and "the query opens the field" carry no more signal
// than "the query is in the field" — a body that happens to start with the
// query is not a better answer than one that mentions it in its second
// sentence.
const DESCRIPTION_TIERS: Tiers = {
  contains: DESCRIPTION_CONTAINS,
  allTerms: DESCRIPTION_ALL_TERMS,
};
const BODY_TIERS: Tiers = { contains: BODY_CONTAINS, allTerms: BODY_ALL_TERMS };

// How much of the matched field the excerpt shows, and how much of it sits
// before the match. The row clamps to two lines at `text-xs` in a 40rem
// dialog, so anything much past ~180 characters is clipped by CSS and only
// costs layout work.
const EXCERPT_LENGTH = 180;
const EXCERPT_LEAD = 40;
// Snapping the window to a word boundary is only an improvement while the
// boundary is near the cut; past this many characters the nearest space is
// far enough away that honouring it would drop real context, so the cut
// stays mid-word and the ellipsis says so.
const WORD_SNAP_RADIUS = 16;
const ELLIPSIS = "…";

/**
 * Lower-cases and collapses a query the same way every field is prepared, so
 * `indexOf` comparisons are apples to apples. Returns `""` for a query with
 * nothing in it, which every caller treats as "show the empty state".
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function prepareEntries(entries: readonly SearchEntry[]): PreparedEntry[] {
  return entries.map((entry) => ({
    entry,
    href: entry.hash === undefined ? entry.route : `${entry.route}#${entry.hash}`,
    lowerTitle: entry.title.toLowerCase(),
    lowerDescription: (entry.description ?? "").toLowerCase(),
    lowerBody: (entry.body ?? "").toLowerCase(),
  }));
}

function scoreField(
  lowerText: string,
  query: string,
  tokens: readonly string[],
  tiers: Tiers,
): number {
  if (lowerText === "") return 0;
  if (tiers.exact !== undefined && lowerText === query) return tiers.exact;
  if (tiers.prefix !== undefined && lowerText.startsWith(query)) return tiers.prefix;
  if (lowerText.includes(query)) return tiers.contains;
  // The all-terms rung only exists for multi-word queries: for a one-word
  // query it would be the `contains` test again at a lower score, which
  // would let an entry be scored twice on the same evidence. "with icons"
  // finding a page that says "icons" in its title and "with" in its body is
  // a real, weaker match; "button" finding "button" is not two matches.
  if (tokens.length > 1 && tokens.every((token) => lowerText.includes(token))) {
    return tiers.allTerms;
  }
  return 0;
}

function firstMatchIndex(
  lowerText: string,
  query: string,
  tokens: readonly string[],
): number {
  const phrase = lowerText.indexOf(query);
  if (phrase >= 0) return phrase;
  // No phrase hit: anchor on the EARLIEST token so the window opens on the
  // first thing the reader typed that this field actually contains, rather
  // than on whichever token happens to be listed first.
  let earliest = -1;
  for (const token of tokens) {
    const at = lowerText.indexOf(token);
    if (at >= 0 && (earliest === -1 || at < earliest)) earliest = at;
  }
  return earliest;
}

/**
 * What to mark, and where it is allowed to match.
 *
 * `wordStart` exists because the two kinds of needle want opposite rules. A
 * needle that is the reader's WHOLE query should match mid-word — typing
 * `acc` and seeing `[Acc]ordion`, or `controlled` and seeing
 * `un[controlled]`, is the highlight doing its job. A needle that is one
 * TOKEN of a longer query should not: on the query `base ui`, an
 * unrestricted `ui` marks the middle of `b[ui]lt`, which tells the reader
 * their search matched a word it did not match. Requiring a token to open a
 * word removes that class of false positive and costs only mid-word token
 * hits, which were the weak half of an already-weak all-terms match.
 */
type Needle = { readonly text: string; readonly wordStart: boolean };

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

function opensWord(text: string, at: number): boolean {
  if (at === 0) return true;
  return !WORD_CHARACTER.test(text[at - 1] ?? "");
}

/**
 * Splits `text` into marked and unmarked runs. `needles` are matched
 * case-insensitively and overlapping hits are merged, so a phrase needle and
 * the token needles it contains produce one `<mark>`, not three nested ones.
 */
function markSegments(text: string, needles: readonly Needle[]): HighlightSegment[] {
  const lower = text.toLowerCase();
  // Case folding is not length-preserving for every script (Turkish dotted
  // capital İ folds to two code units, ẞ to two characters), and every index
  // below is computed on `lower` but sliced out of `text`. Where the two
  // lengths diverge those indices point at the wrong characters, which would
  // cut a word in half rather than mark it. The corpus is English-only by
  // repo rule so this is unreachable today; when it is not, showing the row
  // unmarked is the correct degradation, not showing it mis-sliced.
  if (lower.length !== text.length) return [{ text, match: false }];

  const ranges: Array<[number, number]> = [];
  for (const needle of needles) {
    if (needle.text === "") continue;
    let from = 0;
    for (;;) {
      const at = lower.indexOf(needle.text, from);
      if (at < 0) break;
      if (!needle.wordStart || opensWord(lower, at)) {
        ranges.push([at, at + needle.text.length]);
      }
      // Advance by one, not by the needle's length: a rejected mid-word hit
      // must not skip past a legitimate word-opening hit that overlaps it.
      from = needle.wordStart ? at + 1 : at + needle.text.length;
    }
  }
  if (ranges.length === 0) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last !== undefined && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([range[0], range[1]]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}

/**
 * Moves the window's opening edge FORWARD to just past the next space, so
 * the excerpt does not begin mid-word. Bounded by `WORD_SNAP_RADIUS`: the
 * edge only ever moves toward the match, and never far enough to swallow the
 * lead-in the match needs to be readable in context.
 */
function snapStart(text: string, at: number): number {
  const limit = Math.min(text.length, at + WORD_SNAP_RADIUS);
  for (let i = at; i < limit; i += 1) {
    if (text[i] === " ") return i + 1;
  }
  return at;
}

/**
 * Moves the window's closing edge BACKWARD onto the previous space. The
 * space itself becomes the exclusive end, so the slice stops after the last
 * whole word and the trailing ellipsis sits flush against it.
 */
function snapEnd(text: string, at: number): number {
  const limit = Math.max(0, at - WORD_SNAP_RADIUS);
  for (let i = at; i > limit; i -= 1) {
    if (text[i] === " ") return i;
  }
  return at;
}

function excerptAround(
  text: string,
  at: number,
  needles: readonly Needle[],
): HighlightSegment[] {
  const rawStart = Math.max(0, at - EXCERPT_LEAD);
  const start = rawStart === 0 ? 0 : snapStart(text, rawStart);
  const rawEnd = Math.min(text.length, start + EXCERPT_LENGTH);
  const end = rawEnd === text.length ? text.length : snapEnd(text, rawEnd);

  const segments = markSegments(text.slice(start, end), needles);
  // The ellipses are ordinary unmarked segments rather than characters glued
  // onto the neighbouring segment's text, so no needle can ever be found
  // straddling the boundary between real text and the marker.
  if (start > 0) segments.unshift({ text: ELLIPSIS, match: false });
  if (end < text.length) segments.push({ text: ELLIPSIS, match: false });
  return segments;
}

function buildExcerpt(
  prepared: PreparedEntry,
  query: string,
  tokens: readonly string[],
  needles: readonly Needle[],
): HighlightSegment[] | null {
  const { entry } = prepared;

  // §9.7: a heading row puts its page's title on the second line in place of
  // the excerpt. Left unmarked on purpose — it is the row's provenance ("the
  // `With icons` section of `Button`"), not a place the query was found, and
  // marking it would claim a match that did not contribute to the score
  // (`pageTitle` is deliberately excluded from scoring below; see
  // `scoreEntry`).
  if (entry.hash !== undefined) {
    return entry.pageTitle === undefined ? null : [{ text: entry.pageTitle, match: false }];
  }

  const sources: Array<{ raw: string; lower: string }> = [
    { raw: entry.description ?? "", lower: prepared.lowerDescription },
    { raw: entry.body ?? "", lower: prepared.lowerBody },
  ];
  for (const source of sources) {
    if (source.raw === "") continue;
    const at = firstMatchIndex(source.lower, query, tokens);
    if (at >= 0) return excerptAround(source.raw, at, needles);
  }

  // The query matched the title only, so there is no window to centre on:
  // show the head of whatever prose the page has, which is what the row
  // would show for an empty query anyway.
  const fallback = entry.description !== undefined && entry.description !== ""
    ? entry.description
    : (entry.body ?? "");
  return fallback === "" ? null : excerptAround(fallback, 0, needles);
}

function scoreEntry(
  prepared: PreparedEntry,
  query: string,
  tokens: readonly string[],
): number {
  if (prepared.entry.hash !== undefined) {
    // A heading entry is scored on its own text and nothing else. In
    // particular `pageTitle` is NOT scored: it is the same string for every
    // heading on a page, so counting it would give all ~5 of the Button
    // page's headings the query `button` scores on, and they would crowd out
    // five genuinely different pages — the exact interleaving §9.3 asks this
    // matcher to prevent.
    return scoreField(prepared.lowerTitle, query, tokens, HEADING_TIERS);
  }
  return Math.max(
    scoreField(prepared.lowerTitle, query, tokens, PAGE_TITLE_TIERS),
    scoreField(prepared.lowerDescription, query, tokens, DESCRIPTION_TIERS),
    scoreField(prepared.lowerBody, query, tokens, BODY_TIERS),
  );
}

/**
 * Ranks the whole corpus against a query. Returns EVERY match, uncapped and
 * unfiltered: §9.7's section pills count distinct pages across the full
 * result set, so capping here would make the pill counts a function of
 * `SEARCH_RESULT_LIMIT` rather than of the corpus. The caller derives the
 * counts, applies the section filter, and only then takes the first
 * `SEARCH_RESULT_LIMIT` rows.
 */
export function rankEntries(
  prepared: readonly PreparedEntry[],
  rawQuery: string,
): SearchHit[] {
  const query = normalizeQuery(rawQuery);
  if (query === "") return [];
  const tokens = query.split(" ");
  // The whole phrase leads so that on a multi-word query the merge in
  // `markSegments` produces one mark spanning "with icon" rather than two
  // marks with an unmarked space wedged between them. Its tokens follow,
  // word-anchored, to cover the all-terms case where the phrase itself is
  // nowhere in the field — see `Needle` for why only they are anchored.
  const needles: Needle[] =
    tokens.length > 1
      ? [{ text: query, wordStart: false }, ...tokens.map((text) => ({ text, wordStart: true }))]
      : [{ text: query, wordStart: false }];

  const hits: SearchHit[] = [];
  for (const entry of prepared) {
    const score = scoreEntry(entry, query, tokens);
    if (score === 0) continue;
    hits.push({
      entry: entry.entry,
      href: entry.href,
      score,
      title: markSegments(entry.entry.title, needles),
      excerpt: buildExcerpt(entry, query, tokens, needles),
    });
  }

  hits.sort(compareHits);
  return hits;
}

/**
 * Total order over hits. Everything after the score exists so that two
 * different corpora orderings — or two different `Array.prototype.sort`
 * implementations — cannot produce two different result lists for one query:
 * a matcher whose output depends on input order is one nobody can write a
 * test for.
 */
function compareHits(a: SearchHit, b: SearchHit): number {
  if (a.score !== b.score) return b.score - a.score;
  // §9.3's tie-break, stated in the spec as "a page's own entry ranked above
  // its headings on ties".
  //
  // **This branch is unreachable as the ladder currently stands, and that is
  // the ladder doing the work, not this line.** Page entries can only score
  // from {1000, 800, 600, 500, 200, 160, 100, 80} and heading entries only
  // from {460, 430, 400, 350}; the two sets are disjoint, so `a.score ===
  // b.score` already implies both hits are the same kind and the comparison
  // below always returns 0. (The all-terms rungs are not the exception they
  // look like: 500 against 350 is still a gap.) §9.3's requirement is
  // therefore met structurally by the tier separation documented at the
  // score table above, not by this branch.
  //
  // Kept anyway, as a guard rather than a mechanism: the bands are two
  // hand-maintained lists of constants, and nothing but review stops a
  // future rung from being given a value that lands in both. On the day that
  // happens this stops being dead and starts being the line that keeps a
  // page above its own sections.
  const aIsPage = a.entry.hash === undefined;
  const bIsPage = b.entry.hash === undefined;
  if (aIsPage !== bIsPage) return aIsPage ? -1 : 1;
  // A shorter title containing the query is a larger fraction of that title,
  // so it is the more specific answer: `Button` before `Button group` for
  // the query `button`.
  if (a.entry.title.length !== b.entry.title.length) {
    return a.entry.title.length - b.entry.title.length;
  }
  const byTitle = a.entry.title.localeCompare(b.entry.title);
  if (byTitle !== 0) return byTitle;
  return a.href.localeCompare(b.href);
}

/**
 * §9.7's pill counts: **distinct pages, not entries**, "so heading entries
 * cannot inflate them". Querying `button` matches the Button page plus every
 * heading on it; counting entries would report Primitives 6 when the reader
 * can only navigate to one page.
 *
 * Ordered by count descending, then by label, so the strip does not reshuffle
 * between two queries that happen to produce the same sections. Blume's
 * search client returned `sections` in provider order, which was not a
 * documented order at all.
 */
export function countSections(hits: readonly SearchHit[]): SectionCount[] {
  const routesBySection = new Map<string, Set<string>>();
  for (const hit of hits) {
    let routes = routesBySection.get(hit.entry.section);
    if (routes === undefined) {
      routes = new Set<string>();
      routesBySection.set(hit.entry.section, routes);
    }
    routes.add(hit.entry.route);
  }
  return [...routesBySection]
    .map(([label, routes]) => ({ label, count: routes.size }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
