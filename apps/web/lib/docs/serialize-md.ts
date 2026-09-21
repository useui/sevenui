// Renders one `DocPage`'s MDX body to plain Markdown, for the two agent
// surfaces that need it: the 68 `.md` mirrors (Task 8.2, a plain Node
// script) and `llms-full.txt` (Task 8.3, a Next.js route handler). Both
// callers compose their own wrapper around this function's output — a
// verbatim YAML front-matter block for `.md`, a `# <title>` / `Source: <url>`
// pair for `llms-full.txt` (§15.3 Step 4) — so `toMarkdown` returns the body
// only, with no front matter and no title line of its own.
//
// This module must load OUTSIDE the Next.js module graph: Task 8.2's script
// runs as `node apps/web/scripts/build-md-mirrors.ts`, before `next build`
// even starts, so nothing here may transitively reach `server-only` (its
// non-`react-server` export is a bare `throw`). Two rules follow from that,
// and both are load-bearing, not style:
//
//   1. `DocPage` is imported `import type` — erased by both tsc and Node's
//      type-stripping — so `./index.ts`'s `import "server-only"` is never
//      reached. A value import here would break the Task 8.2 script.
//   2. Every runtime import of a repo module uses an explicit `.ts`
//      specifier (`../registry.ts`, `../package-manager.ts`). Node's
//      type-stripping resolves an explicit `.ts` specifier but NOT an
//      extensionless relative TS import (`ERR_MODULE_NOT_FOUND`) — there is
//      no bundler here to paper over that the way Next's build does. (This
//      needs Node 22.18+: below it, an explicit `.ts` specifier itself fails
//      with `ERR_UNKNOWN_FILE_EXTENSION` — measured on 22.12.0 and 22.17.1 —
//      which is why CI and the root `engines.node` are pinned there.)
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DocPage } from "./index.ts";
import { installCommand } from "../registry.ts";
import { PACKAGE_MANAGERS } from "../package-manager.ts";

// Anchored on `process.cwd()`, not `import.meta.url` — the same rule, for
// the same reason, as `lib/docs/index.ts`'s `DOCS_DIR` and
// `components/demo/source-pane.tsx`'s `REGISTRY_DIR`: a bundled server
// build (or, here, a standalone `tsx`/Node run) does not put this module
// next to the repo it was authored in, so a source-relative climb can
// resolve inside a build artefact instead of the real `packages/registry`.
// `next build`, `next start`, `next dev` and the Task 8.2 script all run
// with cwd = `apps/web`, matching `source-pane.tsx`'s own comment.
const REGISTRY_DIR = path.join(process.cwd(), "../../packages/registry");

// The three JSX components this port's MDX body content ever allows (§6 as
// amended by Ruling 61; `lib/docs/elements.ts`'s `ALLOWED_JSX_TAGS` is the
// build-time proof the corpus contains no others). §15.3 originally closed
// this registry at two — `Component`, `InstallCommand` — but that sentence
// predates §11.3 adding `PrimitiveIndex` to `docs/components.mdx`; left
// unrecognised, that page's ENTIRE body is one raw JSX tag, which is
// exactly the defect this module exists to repair, newly created. All three
// are self-closing in every one of their 206 combined uses across the
// corpus (137 `<Component>`, 68 `<InstallCommand>` across 67 files —
// `installation.mdx` carries two, 1 `<PrimitiveIndex>` — grep-verified), so
// one shape covers all three: `<Name attr="…" attr2 />`. Attributes are
// parsed generically (rather than hard-coding `path` first, `item` only) so
// a reordered or additionally-attributed tag — e.g. `<Component path="…"
// contain />`, whose `contain` is presentational only (§15.3 note) and
// never affects the serialized output — still matches instead of silently
// falling through unrendered.
//
// The three tag names below are the single spelling: `SERIALIZABLE_TAG` and
// `TAG_NAME_OPEN` are both BUILT FROM `SERIALIZABLE_TAG_NAMES`, not
// hand-typed alternations of their own. That is a fix-round-3 change, not
// style — fix-round-2 tied `SERIALIZABLE_TAG_NAMES` to `lib/docs/elements.ts`'s
// `ALLOWED_JSX_TAGS` (see the export below) but left the two regexes as
// their own independent spellings, so a name could still be dropped from
// just the regexes while the array, the type, the assertion and the
// `switch` all stayed in sync — exactly reproducing Ruling 61 (the regex
// lacked `PrimitiveIndex` while the allow-list had it) with the new guard
// sitting right next to it, silent. Deriving the regex source strings from
// the array makes that drift impossible to write, not merely checked for.
//
// Kept as its own type (rather than inlining `string` at each call site) so
// the `switch` in `renderTag` below can be exhaustive: adding a fourth name
// to `SERIALIZABLE_TAG_NAMES` without updating this type is a compile error
// at that `switch`'s `never` check, and if the regex's capture ever produces
// a name outside this type at runtime (a `RegExp` built from a `string[]`
// still isn't type-checked against a union), `assertSerializableTagName`
// below throws instead of silently falling through to `PrimitiveIndex` — the
// exact "fourth name, wrong answer" failure this pair exists to rule out.
type SerializableTagName = "Component" | "InstallCommand" | "PrimitiveIndex";

// The same three names, as a runtime value, exported so `lib/docs/elements.ts`
// can assert equality against its own `ALLOWED_JSX_TAGS` at build time
// (fix-round-2 item 1). Before that export existed, the two files each
// spelled out "Component, InstallCommand, PrimitiveIndex" independently —
// Ruling 61 happened because they drifted (this file had two names, that one
// three) and nothing but a human reading the spec noticed. A plain array
// literal adds no import and no runtime cost, so it does not touch this
// file's bare-`node` constraint above; `elements.ts` is the one importing
// this, never the other way — this file may not import `elements.ts` or
// anything reaching `server-only`. This array is now ALSO the only spelling
// the two regexes below read from — see the comment above this type.
export const SERIALIZABLE_TAG_NAMES: readonly SerializableTagName[] = [
  "Component",
  "InstallCommand",
  "PrimitiveIndex",
];

// `SERIALIZABLE_TAG_NAMES.join("|")` — a regex-safe alternation because
// every name is an `[A-Za-z]+` identifier with no character `RegExp` source
// syntax could misparse (no `.`, `(`, `|`, `\`, …); a future name that
// wasn't a plain identifier would need this to escape it, but the type
// above only ever admits identifiers like these three.
const TAG_NAME_ALTERNATION = SERIALIZABLE_TAG_NAMES.join("|");

const SERIALIZABLE_TAG = new RegExp(
  `<(${TAG_NAME_ALTERNATION})\\b((?:\\s+[A-Za-z][\\w-]*(?:="[^"]*")?)*)\\s*/>`,
  "g",
);
const ATTR = /([A-Za-z][\w-]*)(?:="([^"]*)")?/g;

// Any occurrence of an allow-listed tag NAME, whether or not it parses as a
// well-formed `SERIALIZABLE_TAG` — the wider net Important 4's assertion
// needs. `<InstallCommand item='button' />` (single-quoted) and
// `<InstallCommand item={item} />` (an expression) are both legal MDX, both
// fail `SERIALIZABLE_TAG`'s `="[^"]*"` grammar, and both were, before that
// assertion existed, silently left as raw JSX in the output — the exact bug
// this module exists to fix, reopened by a shape its author didn't type.
const TAG_NAME_OPEN = new RegExp(`<(${TAG_NAME_ALTERNATION})\\b`, "g");

type Range = readonly [start: number, end: number];

function parseAttrs(attrString: string): Record<string, string | true> {
  const attrs: Record<string, string | true> = {};
  for (const match of attrString.matchAll(ATTR)) {
    const name = match[1];
    attrs[name] = match[2] ?? true;
  }
  return attrs;
}

// Wraps `code` in a fenced block the same way a hand-authored MDX code
// fence is written: an opening ```<lang> line, the code with any trailing
// newline trimmed (a source file's own trailing "\n" would otherwise leave
// a blank line before the closing fence, which no fixture has), and a
// closing ``` line.
function fence(lang: string, code: string): string {
  return "```" + lang + "\n" + code.trimEnd() + "\n```";
}

// ---------------------------------------------------------------------
// Protected regions: fenced code blocks and inline code spans that are
// already present in the SOURCE MDX, as opposed to the fences this module
// itself emits for a rendered `<Component>`/`<InstallCommand>`. A tag
// sitting inside either is prose ABOUT the component (a ```mdx illustration,
// a `` `<InstallCommand item="button" />` `` mention in running text), not a
// USE of it, and substituting it would corrupt the surrounding structure
// silently: replacing a quoted tag inside a fence with a real fenced block
// unbalances every fence after it, and replacing one inside an inline code
// span splices multi-line Markdown into the middle of a sentence.
//
// `lib/docs/elements.ts` already has this exact classification (it strips
// fences, then inline code, before its own JSX-tag scan — its own comment
// records 15 corpus tags that only exist inside inline code spans), but its
// job is to DISCARD those regions before scanning what's left. This
// module's job is the opposite: PRESERVE them verbatim in the output, so it
// needs the regions themselves, not text with them blanked out. That file's
// inline-code scan is also per-line, same as an earlier version of this
// one was — that is a SHARED blind spot the two files happen to have made
// the same way, not evidence that per-line scanning is correct (fix round
// 2 corrected it here; `elements.ts` is out of scope and tracked
// separately). See `codeSpanRangesInParagraph` below for why this file
// scans by paragraph instead.
// ---------------------------------------------------------------------

const FENCE_MARKER = /^ {0,3}(`{3,}|~{3,})/;

// Per-line "this line belongs to a fenced block" flags, using the identical
// open/close bookkeeping `lib/docs/headings.ts`'s `stripFences` uses (marker
// character and length must match to close — a stray tilde inside a
// backtick fence does not end it). Both the opening and closing marker
// lines themselves are flagged `true`, matching `stripFences`'s own
// treatment of them.
//
// Throws if a fence is still open at EOF: `stripFences` can afford to leave
// an unclosed fence's tail blanked forever (its caller only cares about
// headings outside fences), but this module cannot — the same "still
// inside a fence" state would make `protectedRanges` return one range
// running to the end of the document, silently protecting (and therefore
// never rendering) every tag after the stray marker. A malformed document
// like that needs a build failure naming the line, not a quiet skip.
function fenceLineFlags(lines: string[], sourcePath: string): boolean[] {
  const flags: boolean[] = [];
  let fenceChar: "`" | "~" | undefined;
  let fenceLen = 0;
  let openedAtLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = FENCE_MARKER.exec(lines[i]);
    if (m) {
      const marker = m[1][0] as "`" | "~";
      const len = m[1].length;
      if (fenceChar === undefined) {
        fenceChar = marker;
        fenceLen = len;
        openedAtLine = i;
      } else if (marker === fenceChar && len >= fenceLen) {
        fenceChar = undefined;
        fenceLen = 0;
        openedAtLine = -1;
      }
      flags.push(true);
      continue;
    }
    flags.push(fenceChar !== undefined);
  }
  if (fenceChar !== undefined) {
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath} has a fenced code block opened on line ${openedAtLine + 1} ` +
        "that is never closed. This document cannot be serialized as-is: every tag after the stray " +
        "fence marker would otherwise be silently treated as fenced content and left unrendered.",
    );
  }
  return flags;
}

// The character offset each line starts at within `text`, so a per-line
// finding (a fence flag, an inline-code match) can be turned into an
// absolute range against the original string the tag regexes run over.
function lineStartOffsets(lines: string[]): number[] {
  const starts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1; // +1 for the "\n" the split() consumed
  }
  return starts;
}

// A maximal run of backticks — a CommonMark code-span delimiter. A span
// opens at one run and closes at the next run of the SAME length; a run of
// a different length in between stays literal content of the span (or, if
// no same-length closer ever follows, the opening run itself is literal
// and scanning resumes after it). This corpus uses only single backticks
// today (verified: no "``" appears anywhere in `docs/**/*.mdx` outside a
// fence), but matching run LENGTH rather than special-casing length 1 costs
// nothing and is what the spec actually says — a future `` `code` `` for
// content containing a literal backtick would otherwise be mis-paired.
const BACKTICK_RUN = /`+/g;

// The code-span ranges within one PARAGRAPH's text (a contiguous slice of
// `text`, already known to contain no fence marker or blank line).
// `paraStart` is that slice's offset into the original `text`, so returned
// ranges are absolute. Pairing runs left-to-right (rather than only
// adjacent pairs) is what lets a span cross a line break inside the same
// paragraph: `` `side="inline-end"\nalign="start"` `` (two real corpus
// lines, `docs/components/dropdown-menu.mdx:133-134`) has its opening and
// closing backticks on different lines, and this function's `text` is the
// paragraph's full multi-line slice, backtick runs and all.
function codeSpanRangesInParagraph(text: string, paraStart: number): Range[] {
  const runs = [...text.matchAll(BACKTICK_RUN)].map((m) => ({
    start: paraStart + (m.index ?? 0),
    end: paraStart + (m.index ?? 0) + m[0].length,
    length: m[0].length,
  }));
  const ranges: Range[] = [];
  let i = 0;
  while (i < runs.length) {
    const open = runs[i];
    let j = i + 1;
    while (j < runs.length && runs[j].length !== open.length) j++;
    if (j < runs.length) {
      ranges.push([open.start, runs[j].end]);
      i = j + 1;
    } else {
      i++; // no matching closer anywhere later in this paragraph — literal
    }
  }
  return ranges;
}

// All ranges in `text` that must survive substitution untouched: fenced
// blocks (collapsed to one range per block, not one per line) and inline
// code spans within the paragraphs outside them.
//
// Spans are scanned by PARAGRAPH — a maximal run of consecutive lines that
// are neither fenced nor blank — not by line and not over the whole
// document: CommonMark lets a code span's delimiters sit on different
// lines, but never lets them cross a blank line, so the paragraph is the
// correct unit. A per-line scan misses a span like the one named above; a
// whole-document scan would instead happily pair a stray backtick in one
// paragraph with an unrelated one three paragraphs later.
function protectedRanges(text: string, sourcePath: string): Range[] {
  const lines = text.split("\n");
  const fenced = fenceLineFlags(lines, sourcePath);
  const starts = lineStartOffsets(lines);
  const ranges: Range[] = [];

  let i = 0;
  while (i < lines.length) {
    if (!fenced[i]) {
      i++;
      continue;
    }
    const start = starts[i];
    let j = i;
    while (j < lines.length && fenced[j]) j++;
    const end = j < lines.length ? starts[j] : text.length;
    ranges.push([start, end]);
    i = j;
  }

  let paraStartLine = -1;
  const flushParagraph = (endLineExclusive: number) => {
    if (paraStartLine === -1) return;
    const paraStart = starts[paraStartLine];
    // -1 drops the "\n" that separates this paragraph from the blank or
    // fenced line ending it, so the slice never reaches past the paragraph.
    const paraEnd = endLineExclusive < lines.length ? starts[endLineExclusive] - 1 : text.length;
    ranges.push(...codeSpanRangesInParagraph(text.slice(paraStart, paraEnd), paraStart));
    paraStartLine = -1;
  };
  for (let k = 0; k < lines.length; k++) {
    if (fenced[k] || lines[k].trim() === "") {
      flushParagraph(k);
      continue;
    }
    if (paraStartLine === -1) paraStartLine = k;
  }
  flushParagraph(lines.length);

  return ranges;
}

function isProtected(ranges: Range[], index: number): boolean {
  return ranges.some(([s, e]) => index >= s && index < e);
}

// <Component path="button/button-demo" /> -> the example's own source,
// fenced as ```tsx — every current example is a `.tsx` file (verified:
// `packages/registry/demos/**`, no other extension exists), so this is a
// literal, not a derivation from `relPath`; a future non-.tsx example needs
// this function to change, not just its data. This is exactly what the
// page's live Code tab already shows (`components/mdx/component.tsx` /
// `source-pane.tsx`), so the Markdown mirror and the rendered page agree —
// §15.3 Step 2's "verified non-defect": the fenced source uses
// `@/registry/base/ui/*` and only the hand-authored Usage prose says
// `@/components/ui/*`, which is correct on both sides.
async function renderComponent(attrs: Record<string, string | true>, sourcePath: string): Promise<string> {
  const demoPath = attrs.path;
  if (typeof demoPath !== "string") {
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath} has a <Component> tag with no "path" attribute.`,
    );
  }
  const relPath = `demos/${demoPath}.tsx`;
  const fullPath = path.join(REGISTRY_DIR, relPath);
  let source: string;
  try {
    source = await readFile(fullPath, "utf8");
  } catch {
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath}'s <Component path="${demoPath}" /> expected an example ` +
        `at "${fullPath}" but found none. This path is process.cwd() + ` +
        `"../../packages/registry/${relPath}"; process.cwd() is currently "${process.cwd()}". ` +
        "Run the build/script with cwd = apps/web.",
    );
  }
  return fence("tsx", source);
}

// <InstallCommand item="button" /> -> one fenced `bash` block holding all
// four package-manager dialects (§15.3 Step 3, §17.6 #1). Today this tag
// reaches agents as raw, unrendered JSX on 68 pages — the Installation
// section of every primitive page's Markdown mirror is empty of
// instruction — so this is a deliberate, spec-recorded improvement over
// production parity, not a reproduction of it. The four commands are built
// from `installCommand` (lib/registry.ts, "Single source of truth for
// shadcn CLI install commands") and `PACKAGE_MANAGERS` (lib/package-manager.ts)
// rather than re-typing any dialect here, in that module's own order
// (npm, pnpm, yarn, bun) — the Markdown counterpart of the rendered page's
// `<InstallCommand>` component, which builds its four variants the same way.
function renderInstallCommand(attrs: Record<string, string | true>, sourcePath: string): string {
  const item = attrs.item;
  if (typeof item !== "string") {
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath} has an <InstallCommand> tag with no "item" attribute.`,
    );
  }
  const commands = PACKAGE_MANAGERS.map((pm) => installCommand(item, pm));
  return fence("bash", commands.join("\n"));
}

// A minimal, module-private shape of the whole corpus's page metadata —
// only the three fields the link list below reads. Deliberately not
// `DocPage` itself: this module's whole point is loading with no runtime
// edge into `lib/docs/index.ts` (see the header comment), and a type-only
// `Pick<DocPage, …>` costs nothing there (types are erased) while a runtime
// signature of the full type would invite a caller to just forward a
// `DocPage[]` it already built by calling `getDocIndex()` — fine for
// Task 8.2/8.3 (both already enumerate the corpus that way), but this
// module has no business requiring that specific origin for its data.
export type DocPageSummary = Pick<DocPage, "route" | "title" | "description">;

// The same prefix `components/mdx/primitive-index.tsx` groups the
// `/docs/components` grid by. Re-declared here rather than imported, for
// the identical reason that file gives for not exporting its own copy: it
// is the one constant one file needs, and widening either file's surface to
// share a single string is a worse trade than two small, independently
// obvious copies. `lib/docs/elements.ts`'s `assertElementsAllowed` and
// `lib/docs/nav.ts`'s own build-time assertions are what keep the two
// derivations of "which pages are primitives" from silently disagreeing.
const PRIMITIVES_PREFIX = "/docs/components/";

// <PrimitiveIndex /> -> a bare Markdown link list, one row per primitive:
// `- [<title>](<route>): <description>` (Ruling 61). Same filter (route
// starts with `/docs/components/`) and same sort (ascending by `route`) as
// the live grid `primitive-index.tsx` renders, so the two never drift —
// labels and descriptions come from each page's own frontmatter in both
// places. Hrefs are root-relative, matching both that component's own
// `href={page.route}` and this corpus's existing link convention (internal
// `/docs/...` links stay relative everywhere else in this module's output
// too; `llms.txt`'s absolute form is that file's own convention, not this
// corpus's).
//
// Throws on an empty filtered list rather than emitting a blank body: an
// empty or partial `pages` array (today, neither caller — Task 8.2's script
// nor Task 8.3's route handler — is written yet, so nothing guarantees what
// gets passed) would otherwise ship `/docs/components.md` as front matter
// plus nothing at all. Ruling 61 exists because front matter plus raw JSX
// is unacceptable; front matter plus silence is the same defect with the
// evidence of it removed, which is worse, not better.
function renderPrimitiveIndex(pages: readonly DocPageSummary[], sourcePath: string): string {
  const primitives = pages
    .filter((page) => page.route.startsWith(PRIMITIVES_PREFIX))
    .slice()
    .sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));
  if (primitives.length === 0) {
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath} has a <PrimitiveIndex /> tag, but the "pages" argument ` +
        `passed to toMarkdown() contains no route starting with "${PRIMITIVES_PREFIX}". Pass the full ` +
        "corpus's page list, not a partial or empty one — an empty body here is the same defect Ruling " +
        "61 exists to fix, just with the evidence of it removed.",
    );
  }
  return primitives.map((page) => `- [${page.title}](${page.route}): ${page.description}`).join("\n");
}

// `SerializableTagName` and `SERIALIZABLE_TAG_NAMES` — the single spelling
// both regexes above are built from — are declared near the top of this
// file, immediately before `SERIALIZABLE_TAG`, so that regex's construction
// can reference the array. See the comment there.

function assertSerializableTagName(name: string): asserts name is SerializableTagName {
  if (name !== "Component" && name !== "InstallCommand" && name !== "PrimitiveIndex") {
    throw new Error(
      `lib/docs/serialize-md.ts: SERIALIZABLE_TAG matched an unexpected tag name "${name}". ` +
        "This regex and renderTag()'s dispatch must list exactly the same tag names.",
    );
  }
}

function renderTag(
  tagName: SerializableTagName,
  attrs: Record<string, string | true>,
  sourcePath: string,
  pages: readonly DocPageSummary[],
): string | Promise<string> {
  switch (tagName) {
    case "Component":
      return renderComponent(attrs, sourcePath);
    case "InstallCommand":
      return renderInstallCommand(attrs, sourcePath);
    case "PrimitiveIndex":
      return renderPrimitiveIndex(pages, sourcePath);
    default: {
      const exhaustive: never = tagName;
      throw new Error(`lib/docs/serialize-md.ts: unreachable tag name "${String(exhaustive)}".`);
    }
  }
}

// Every occurrence of an allow-listed tag NAME must either be a
// `SERIALIZABLE_TAG` match this function is about to render (`matchedStarts`
// records those, by their start offset) or sit inside a protected region
// (prose about the component). Anything else is a tag whose attribute
// SHAPE this module's grammar could not parse — legal MDX, silently left
// as raw JSX before this assertion existed, which is precisely the bug
// §15.3 exists to fix, reopened. Region-aware for the same reason
// Important 3's substitution is: a tag legitimately quoted in a fence or an
// inline code span is not a use of it, and must not trip this.
function assertNoUnrenderedTags(text: string, matchedStarts: Set<number>, ranges: Range[], sourcePath: string): void {
  for (const m of text.matchAll(TAG_NAME_OPEN)) {
    const idx = m.index ?? 0;
    if (isProtected(ranges, idx)) continue;
    if (matchedStarts.has(idx)) continue;
    throw new Error(
      `lib/docs/serialize-md.ts: ${sourcePath} has a <${m[1]}> tag whose attributes this serializer ` +
        "could not parse (attribute values must be double-quoted literals, e.g. " +
        `<${m[1]} item="…" />, not single-quoted or a {expression}), so it would otherwise reach ` +
        "agents as raw, unrendered JSX.",
    );
  }
}

// `String.prototype.replace` has no async form, so matches are collected
// up front, their (possibly async) replacements resolved together, and the
// result rebuilt by hand from the original match offsets. `<Component>`'s
// replacement reads a file; running that read serially per match would work
// too, but `Promise.all` costs nothing extra here and keeps the three tag
// kinds on the same code path.
async function replaceTagsAsync(
  text: string,
  sourcePath: string,
  pages: readonly DocPageSummary[],
): Promise<string> {
  const matches = [...text.matchAll(SERIALIZABLE_TAG)];
  const ranges = protectedRanges(text, sourcePath);

  assertNoUnrenderedTags(text, new Set(matches.map((m) => m.index ?? -1)), ranges, sourcePath);

  // Only tags OUTSIDE a protected region are live uses to render; a
  // well-formed tag inside a fence or inline code span is prose and must
  // reach the output byte-for-byte (Important 3).
  const liveMatches = matches.filter((m) => !isProtected(ranges, m.index ?? 0));
  if (liveMatches.length === 0) return text;

  const replacements = await Promise.all(
    liveMatches.map((match) => {
      const [, tagName, attrString] = match;
      assertSerializableTagName(tagName);
      return renderTag(tagName, parseAttrs(attrString ?? ""), sourcePath, pages);
    }),
  );

  let result = "";
  let lastIndex = 0;
  liveMatches.forEach((match, i) => {
    const start = match.index ?? 0;
    result += text.slice(lastIndex, start);
    result += replacements[i];
    lastIndex = start + match[0].length;
  });
  result += text.slice(lastIndex);
  return result;
}

/**
 * Render one `DocPage`'s MDX body to plain Markdown.
 *
 * Returns the body only — no YAML front matter, no `# <title>` line, no
 * `Source:` line (§15.3 Step 4). `doc.raw` has its front matter BLANKED, not
 * removed (`lib/docs/index.ts`'s `blankFrontmatter`, kept that way so a
 * heading's line number stays aligned with the source file for Task 2.4 /
 * 2.9), so `raw` begins with as many empty lines as the frontmatter block
 * plus its own trailing blank separator line occupied in the source file.
 * Those leading blank lines are never part of any fixture's body, so they
 * are trimmed here rather than left for both callers to trim independently.
 *
 * @param doc Only `raw` and `sourcePath` are read, so the parameter is typed
 *   `Pick<DocPage, "raw" | "sourcePath">` rather than the full `DocPage`
 *   (Task 8.2 controller decision). Task 8.2's script cannot call
 *   `getDocIndex()` (this module's own header explains why) and so builds
 *   its own page objects by hand; a full `DocPage` would force it to
 *   fabricate a `headings` array it has no honest value for
 *   (`scanHeadings` exists to serve Task 2.4/2.9's location reporting, not
 *   this task), and `headings: []` would be a typed lie a later reader
 *   could believe. Task 8.3's caller still has a real `DocPage` in hand
 *   (from `getDocIndex()`) and passes it here unchanged — a wider object
 *   structurally satisfies a `Pick` of itself.
 * @param pages Every page's route/title/description, for `<PrimitiveIndex>`
 *   (Ruling 61) — both callers already enumerate the full corpus to build
 *   their own indexes (the `.md` mirror script writes one file per page; the
 *   `llms-full.txt` handler concatenates all of them), so passing it through
 *   costs neither caller an extra read. Only the one page using the tag
 *   reads this parameter; every other call ignores it.
 *
 * Async because `<Component>` reads its example source off disk
 * (`node:fs/promises`). `readFileSync` would satisfy the brief's literal
 * `string`-returning signature just as well — this isn't a case with no
 * synchronous option — but a page can carry several `<Component>` tags, and
 * `Promise.all` (see `replaceTagsAsync`) reads them concurrently instead of
 * blocking the event loop through each in turn; both callers already run in
 * an async context, so nothing here forces a caller across a boundary it
 * wasn't already on.
 */
export async function toMarkdown(
  doc: Pick<DocPage, "raw" | "sourcePath">,
  pages: readonly DocPageSummary[],
): Promise<string> {
  const body = doc.raw.replace(/^\n+/, "");
  return replaceTagsAsync(body, doc.sourcePath, pages);
}
