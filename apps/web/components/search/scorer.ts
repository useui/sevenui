import { SECTION_ORDER, type SearchEntry } from "../../lib/docs/search";

export type HighlightSegment = { readonly text: string; readonly match: boolean };

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
  readonly href: string;
  readonly score: number;
  /** The row's first line: the page title, or the heading's own text. */
  readonly title: readonly HighlightSegment[];
  readonly excerpt: readonly HighlightSegment[] | null;
};

export type SectionCount = { readonly label: string; readonly count: number };

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
const DESCRIPTION_TIERS: Tiers = {
  contains: DESCRIPTION_CONTAINS,
  allTerms: DESCRIPTION_ALL_TERMS,
};
const BODY_TIERS: Tiers = { contains: BODY_CONTAINS, allTerms: BODY_ALL_TERMS };

const EXCERPT_LENGTH = 180;
const EXCERPT_LEAD = 40;
const WORD_SNAP_RADIUS = 16;
const ELLIPSIS = "…";

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
  let earliest = -1;
  for (const token of tokens) {
    const at = lowerText.indexOf(token);
    if (at >= 0 && (earliest === -1 || at < earliest)) earliest = at;
  }
  return earliest;
}

type Needle = { readonly text: string; readonly wordStart: boolean };

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

function opensWord(text: string, at: number): boolean {
  if (at === 0) return true;
  return !WORD_CHARACTER.test(text[at - 1] ?? "");
}

function markSegments(text: string, needles: readonly Needle[]): HighlightSegment[] {
  const lower = text.toLowerCase();
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

function snapStart(text: string, at: number): number {
  const limit = Math.min(text.length, at + WORD_SNAP_RADIUS);
  for (let i = at; i < limit; i += 1) {
    if (text[i] === " ") return i + 1;
  }
  return at;
}

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

  if (entry.hash !== undefined) {
    // An anchored item with its own description (a component or a block) shows the description when the
    // query is found there; otherwise, like a docs heading, the page it lives on.
    const at = firstMatchIndex(prepared.lowerDescription, query, tokens);
    if (entry.description !== undefined && at >= 0) return excerptAround(entry.description, at, needles);
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
    // Docs headings carry a title only; anchored components and blocks also carry a description and
    // keywords, scored at the page tiers so a matching title still ranks the item above them.
    return Math.max(
      scoreField(prepared.lowerTitle, query, tokens, HEADING_TIERS),
      scoreField(prepared.lowerDescription, query, tokens, DESCRIPTION_TIERS),
      scoreField(prepared.lowerBody, query, tokens, BODY_TIERS),
    );
  }
  return Math.max(
    scoreField(prepared.lowerTitle, query, tokens, PAGE_TITLE_TIERS),
    scoreField(prepared.lowerDescription, query, tokens, DESCRIPTION_TIERS),
    scoreField(prepared.lowerBody, query, tokens, BODY_TIERS),
  );
}

export function rankEntries(
  prepared: readonly PreparedEntry[],
  rawQuery: string,
): SearchHit[] {
  const query = normalizeQuery(rawQuery);
  if (query === "") return [];
  const tokens = query.split(" ");
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

function compareHits(a: SearchHit, b: SearchHit): number {
  if (a.score !== b.score) return b.score - a.score;
  const aIsPage = a.entry.hash === undefined;
  const bIsPage = b.entry.hash === undefined;
  if (aIsPage !== bIsPage) return aIsPage ? -1 : 1;
  if (a.entry.title.length !== b.entry.title.length) {
    return a.entry.title.length - b.entry.title.length;
  }
  const byTitle = a.entry.title.localeCompare(b.entry.title);
  if (byTitle !== 0) return byTitle;
  return a.href.localeCompare(b.href);
}

export function countSections(hits: readonly SearchHit[]): SectionCount[] {
  const routesBySection = new Map<string, Set<string>>();
  for (const hit of hits) {
    let routes = routesBySection.get(hit.entry.section);
    if (routes === undefined) {
      routes = new Set<string>();
      routesBySection.set(hit.entry.section, routes);
    }
    // A docs heading counts toward its page; an anchored component or block is a result of its own.
    const standalone = hit.entry.hash !== undefined && hit.entry.description !== undefined;
    routes.add(standalone ? hit.href : hit.entry.route);
  }
  return [...routesBySection]
    .map(([label, routes]) => ({ label, count: routes.size }))
    .sort((a, b) => sectionRank(a.label) - sectionRank(b.label) || b.count - a.count || a.label.localeCompare(b.label));
}

/** Known sections follow SECTION_ORDER; any other nav group sorts after them. */
function sectionRank(label: string): number {
  const at = SECTION_ORDER.indexOf(label);
  return at === -1 ? SECTION_ORDER.length : at;
}
