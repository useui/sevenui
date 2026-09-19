import GithubSlugger from "github-slugger";

export type Heading = { depth: 2 | 3; text: string; id: string };

// Matches a CommonMark fence marker line: 0-3 leading spaces (fences may be
// indented that much and still count), then 3+ backticks or 3+ tildes.
const FENCE_MARKER = /^ {0,3}(`{3,}|~{3,})/;

// Removes fenced code blocks before the heading scan runs, so a `## ` inside
// a fence is never mistaken for a heading. Tracks which marker character
// (backtick or tilde) and length opened the fence, because CommonMark
// allows both, and a closing fence must match the opening marker character
// and be at least as long — a stray tilde line inside a backtick fence (or
// vice versa) does not close it. Lines inside a fence are blanked rather
// than deleted, which keeps this a pure text transform with no line-number
// bookkeeping to get wrong.
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

// Scans the raw MDX text (not compiled output) for h2/h3 headings and
// derives their ids with github-slugger — the same library rehype-slug
// uses, so ids match production anchors by construction. The page <h1>
// comes from frontmatter `title`, not from the body, so it carries no id
// and must never advance the slugger; scanHeadings never sees it because
// no file's body contains an h1.
export function scanHeadings(raw: string): Heading[] {
  const slugger = new GithubSlugger(); // one instance per document
  const out: Heading[] = [];
  for (const line of stripFences(raw).split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/u.exec(line);
    if (!m) continue;
    const text = m[2];
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}
