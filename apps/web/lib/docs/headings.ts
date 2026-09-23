import GithubSlugger from "github-slugger";

export type Heading = { depth: 2 | 3; text: string; id: string };

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
  for (const line of stripFences(raw).split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/u.exec(line);
    if (!m) continue;
    const text = m[2];
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}
