import GithubSlugger from "github-slugger";

/**
 * `flavour` marks a heading that exists for one primitive flavour only: the h3s of an "API reference"
 * section, which lib/mdx/remark-flavour-api.mjs shows to Base UI readers only, and the "Differences on
 * UI SDK" h3 (components/flavour/ui-sdk-primitive-note.tsx) that UI SDK readers see in its place.
 */
export type Heading = { depth: 2 | 3; text: string; id: string; flavour?: "base-ui" | "ui-sdk" };

/** The UI SDK API reference's own h3; its id is fixed so the table of contents can link to it. */
export const UI_SDK_DIFFERENCES = { text: "Differences on UI SDK", id: "differences-on-ui-sdk" } as const;

const FENCE_MARKER = /^ {0,3}(`{3,}|~{3,})/;

export function stripFences(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  let fenceChar: "`" | "~" | undefined;
  let fenceLen = 0;
  for (const line of lines) {
    const m = FENCE_MARKER.exec(line);
    if (m) {
      const marker = m[1][0] as "`" | "~";
      const len = m[1].length;
      if (fenceChar === undefined) {
        fenceChar = marker;
        fenceLen = len;
      } else if (marker === fenceChar && len >= fenceLen) {
        fenceChar = undefined;
        fenceLen = 0;
      }
      out.push("");
      continue;
    }
    out.push(fenceChar === undefined ? line : "");
  }
  return out.join("\n");
}

/** `uiSdkDifferences`: the page is a primitive whose UI SDK API reference lists differences. */
export function scanHeadings(raw: string, { uiSdkDifferences = false }: { uiSdkDifferences?: boolean } = {}): Heading[] {
  const slugger = new GithubSlugger(); // one instance per document
  slugger.slug(UI_SDK_DIFFERENCES.id); // reserved, so no authored heading takes the id
  const out: Heading[] = [];
  let inApiReference = false;
  for (const line of stripFences(raw).split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/u.exec(line);
    if (!m) continue;
    const text = m[2];
    const depth = m[1].length as 2 | 3;
    if (depth === 2) inApiReference = text === "API reference";
    const heading: Heading = { depth, text, id: slugger.slug(text) };
    if (depth === 3 && inApiReference) heading.flavour = "base-ui";
    out.push(heading);
    if (depth === 2 && inApiReference && uiSdkDifferences) out.push({ depth: 3, ...UI_SDK_DIFFERENCES, flavour: "ui-sdk" });
  }
  return out;
}
