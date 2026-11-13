import GithubSlugger from "github-slugger";

/**
 * `flavour` marks a heading that exists for one primitive flavour only: the h3s of an "API reference"
 * section, which lib/mdx/remark-flavour-api.mjs shows to Base UI readers only.
 */
export type Heading = { depth: 2 | 3; text: string; id: string; flavour?: "base-ui" };

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

export function scanHeadings(raw: string): Heading[] {
  const slugger = new GithubSlugger(); // one instance per document
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
  }
  return out;
}
