import type { DocPage } from "./index";
import { stripFences } from "./headings";
import { SERIALIZABLE_TAG_NAMES } from "./serialize-md";

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

const ALLOWED_JSX_TAGS = new Set(["Component", "InstallCommand", "PrimitiveIndex"]);

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

const JSX_TAG = /<([A-Z][A-Za-z0-9]*)\b/gu;

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

export function assertElementsAllowed(pages: DocPage[]): void {
  for (const page of pages) {
    const strippedFences = stripFences(page.raw);
    assertNoForbiddenConstructs(strippedFences, page.sourcePath);
    assertJsxTagsAllowed(strippedFences, page.sourcePath);
  }
}
