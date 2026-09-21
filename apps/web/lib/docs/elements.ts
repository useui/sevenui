import type { DocPage } from "./index";
import { stripFences } from "./headings";
import { SERIALIZABLE_TAG_NAMES } from "./serialize-md";

// If any MDX file introduces an element with no override, the build fails.
// Cost is zero, and it converts "the corpus is narrow" from a lucky fact into
// an invariant — the day someone writes a blockquote it is a build error
// rather than a silently unstyled page (§6).
const FORBIDDEN: Array<[RegExp, string]> = [
  [/^\s*>\s/mu, "blockquote"],
  [/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/mu, "hr"],
  [/^\s*#{4,6}\s/mu, "h4-h6"],
  [/^\s*#\s/mu, "h1"],
  [/^\s*\d+\.\s/mu, "ordered list"],
  [/!\[[^\]]*\]\(/u, "image"],
  [/~~[^~]+~~/u, "strikethrough"],
  [/^\s*[-*]\s+\[[ x]\]/mu, "task list"],
  [/<!--/u, "html comment"],
];

// The three JSX components this port ever allows in MDX body content.
// `Component` (Task 2.6) and `InstallCommand` (Task 2.7) don't exist yet in
// this repo, and `PrimitiveIndex` is Stage 3 — allow-listing their NAMES
// here does not import them, so this file does not violate the
// nothing-imported-before-it-exists rule mdx-components.tsx documents.
const ALLOWED_JSX_TAGS = new Set(["Component", "InstallCommand", "PrimitiveIndex"]);

// The tie this list was missing (fix-wave item 1). Ruling 61 happened because
// this Set and `lib/docs/serialize-md.ts`'s own tag registry each spelled out
// the same three names independently and nothing forced them to agree: this
// file had three names, the serializer had two, and a human reading the spec
// was what caught it, not the build. Asserted at MODULE LOAD, not inside
// `assertElementsAllowed` below — this file is imported unconditionally by
// `lib/docs/index.ts`, so loading it is itself "every build," and a
// module-scope throw fires even if the corpus happens to contain zero pages
// using the drifted tag, which a per-page scan below could not. Every entry
// in one Set must be in the other; `elements.ts` may import
// `serialize-md.ts` (both live inside the Next module graph), but not the
// reverse — `serialize-md.ts`'s own header explains why it must stay
// loadable under bare `node`.
{
  const serializable = new Set<string>(SERIALIZABLE_TAG_NAMES);
  const onlyInElements = [...ALLOWED_JSX_TAGS].filter((tag) => !serializable.has(tag));
  const onlyInSerializer = [...serializable].filter((tag) => !ALLOWED_JSX_TAGS.has(tag));
  if (onlyInElements.length > 0 || onlyInSerializer.length > 0) {
    throw new Error(
      "lib/docs/elements.ts: ALLOWED_JSX_TAGS and lib/docs/serialize-md.ts's SERIALIZABLE_TAG_NAMES have " +
        `drifted apart. Only in lib/docs/elements.ts: [${onlyInElements.join(", ") || "none"}]. Only in ` +
        `lib/docs/serialize-md.ts: [${onlyInSerializer.join(", ") || "none"}]. A tag either file allows but ` +
        "the other does not either ships as raw JSX to agents (Ruling 61's defect, reopened) or is rejected " +
        "by this file's own build-time scan for no reason a reader can see. Add the tag to both lists, in " +
        "the same edit.",
    );
  }
}

// A JSX/MDX component tag: `<UpperCamelCase`. Plain HTML tags used in MDX
// bodies (`<pre>`, `<div>`, …) start with a lower-case letter and are not
// matched — this scan only cares about custom components.
const JSX_TAG = /<([A-Z][A-Za-z0-9]*)\b/gu;

// Inline code spans (`` `text` ``) never span multiple lines in this
// corpus's fenced-and-inline convention, so a non-greedy same-line match is
// enough. A fence-only scan (fences already stripped by the caller) reports
// 15 extra tags across the corpus that all sit inside an inline code span —
// prose *about* a component, not a use of one — so those spans must be
// excluded here or the JSX-tag assertion produces 15 false failures.
function stripInlineCode(text: string): string {
  return text.replace(/`[^`\n]*`/gu, "");
}

function assertNoForbiddenConstructs(strippedFences: string, sourcePath: string): void {
  for (const [pattern, name] of FORBIDDEN) {
    if (pattern.test(strippedFences)) {
      throw new Error(
        `lib/docs/elements.ts: ${sourcePath} contains a ${name}, which has no MDX element override. ` +
          "The element map in mdx-components.tsx is closed by design (task-2.4 §6) — nine element " +
          "types render, and nothing else may. Remove the construct, or extend the element map and " +
          "this scan together.",
      );
    }
  }
}

function assertJsxTagsAllowed(strippedFences: string, sourcePath: string): void {
  const scanned = stripInlineCode(strippedFences);
  for (const match of scanned.matchAll(JSX_TAG)) {
    const tag = match[1] ?? "";
    if (!ALLOWED_JSX_TAGS.has(tag)) {
      throw new Error(
        `lib/docs/elements.ts: ${sourcePath} uses <${tag}>, which is not one of the three JSX ` +
          `components this port allows in MDX body content (${[...ALLOWED_JSX_TAGS].join(", ")}). ` +
          "If this is a genuinely new component, it needs its own task before an MDX file can use it.",
      );
    }
  }
}

// Wired into lib/docs/index.ts's readAll() per-build assertions seam
// (Task 2.4's line in that file's comment). Runs over each page's raw MDX
// with fences stripped, exactly as the brief specifies — frontmatter is
// already blanked in `raw` by the time it reaches here (Task 2.1).
export function assertElementsAllowed(pages: DocPage[]): void {
  for (const page of pages) {
    const strippedFences = stripFences(page.raw);
    assertNoForbiddenConstructs(strippedFences, page.sourcePath);
    assertJsxTagsAllowed(strippedFences, page.sourcePath);
  }
}
