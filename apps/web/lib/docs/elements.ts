import type { DocPage } from "./index";
import { stripFences } from "./headings";

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

// A JSX/MDX component tag: `<UpperCamelCase`. Plain HTML tags used in MDX
// bodies (`<pre>`, `<div>`, …) start lowercase and are not matched — this
// scan only cares about custom components.
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
