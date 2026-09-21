import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DocPage } from "./index.ts";
import { installCommand } from "../registry.ts";
import { PACKAGE_MANAGERS } from "../package-manager.ts";

const REGISTRY_DIR = path.join(process.cwd(), "../../packages/registry");

type SerializableTagName = "Component" | "InstallCommand" | "PrimitiveIndex";

export const SERIALIZABLE_TAG_NAMES: readonly SerializableTagName[] = [
  "Component",
  "InstallCommand",
  "PrimitiveIndex",
];

const TAG_NAME_ALTERNATION = SERIALIZABLE_TAG_NAMES.join("|");

const SERIALIZABLE_TAG = new RegExp(
  `<(${TAG_NAME_ALTERNATION})\\b((?:\\s+[A-Za-z][\\w-]*(?:="[^"]*")?)*)\\s*/>`,
  "g",
);
const ATTR = /([A-Za-z][\w-]*)(?:="([^"]*)")?/g;

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

function fence(lang: string, code: string): string {
  return "```" + lang + "\n" + code.trimEnd() + "\n```";
}

const FENCE_MARKER = /^ {0,3}(`{3,}|~{3,})/;

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

function lineStartOffsets(lines: string[]): number[] {
  const starts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1; // +1 for the "\n" the split() consumed
  }
  return starts;
}

const BACKTICK_RUN = /`+/g;

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

export type DocPageSummary = Pick<DocPage, "route" | "title" | "description">;

const PRIMITIVES_PREFIX = "/docs/components/";

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

async function replaceTagsAsync(
  text: string,
  sourcePath: string,
  pages: readonly DocPageSummary[],
): Promise<string> {
  const matches = [...text.matchAll(SERIALIZABLE_TAG)];
  const ranges = protectedRanges(text, sourcePath);

  assertNoUnrenderedTags(text, new Set(matches.map((m) => m.index ?? -1)), ranges, sourcePath);

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

export async function toMarkdown(
  doc: Pick<DocPage, "raw" | "sourcePath">,
  pages: readonly DocPageSummary[],
): Promise<string> {
  const body = doc.raw.replace(/^\n+/, "");
  return replaceTagsAsync(body, doc.sourcePath, pages);
}
