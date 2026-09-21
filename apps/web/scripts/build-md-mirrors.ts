import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  assertDocsDirExists,
  blankFrontmatter,
  collectMdxFiles,
  DOCS_DIR,
  parseFrontmatter,
  routeFor,
} from "../lib/docs/corpus.ts";
import { toMarkdown, type DocPageSummary } from "../lib/docs/serialize-md.ts";

const PUBLIC_DIR = path.join(process.cwd(), "public");

type Page = DocPageSummary & {
  sourcePath: string;
  raw: string;
  frontmatterBlock: string;
};

async function readPage(fullPath: string): Promise<Page> {
  const content = await readFile(fullPath, "utf8");
  const frontmatter = parseFrontmatter(fullPath, content);
  const { blanked, frontmatterEnd } = blankFrontmatter(content);

  if (frontmatterEnd === -1) {
    throw new Error(
      `scripts/build-md-mirrors.ts: ${fullPath} was parsed by vfile-matter as having valid frontmatter, ` +
        'but lib/docs/corpus.ts\'s blankFrontmatter found no literal "---" line to blank. The likely cause ' +
        'is CRLF line endings: a delimiter line of "---\\r" still parses under vfile-matter\'s tolerant ' +
        "detection but fails blankFrontmatter's exact string check. Re-save this file with LF line endings.",
    );
  }

  const relPath = path.relative(DOCS_DIR, fullPath).split(path.sep).join("/");
  const frontmatterBlock = content.split("\n").slice(0, frontmatterEnd + 1).join("\n");

  return {
    route: routeFor(relPath),
    title: frontmatter.title,
    description: frontmatter.description,
    sourcePath: `docs/${relPath}`,
    raw: blanked,
    frontmatterBlock,
  };
}

export function outPathFor(route: string, publicDir: string): string {
  return path.join(publicDir, `${route.slice(1)}.md`);
}

async function renderAll(pages: readonly Page[], publicDir: string): Promise<{ outPath: string; content: string }[]> {
  const rendered: { outPath: string; content: string }[] = [];
  for (const page of pages) {
    const outPath = outPathFor(page.route, publicDir);
    const body = await toMarkdown(page, pages);
    rendered.push({ outPath, content: `${page.frontmatterBlock}\n\n${body}` });
  }
  return rendered;
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as NodeJS.ErrnoException).code === "ENOENT";
}

export async function collectEmittedMdFiles(publicDir: string): Promise<string[]> {
  const found: string[] = [];
  try {
    await readFile(path.join(publicDir, "docs.md"));
    found.push(path.join(publicDir, "docs.md"));
  } catch (error) {
    if (!isEnoent(error)) throw error;
  }
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (!isEnoent(error)) throw error;
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        found.push(fullPath);
      }
    }
  }
  await walk(path.join(publicDir, "docs"));
  return found;
}

export function assertEmittedMatchesCorpus(corpusCount: number, emittedFiles: readonly string[]): void {
  if (emittedFiles.length !== corpusCount) {
    throw new Error(
      `scripts/build-md-mirrors.ts: the docs corpus has ${corpusCount} .mdx sources, but re-walking ` +
        `public/docs.md and public/docs/ after writing found ${emittedFiles.length} files. These must be ` +
        "equal. A short count here (with no earlier error) means two or more pages wrote to the same " +
        "physical file — most likely two routes differing only by case, which a case-insensitive " +
        "filesystem silently collapses to one file even though routeFor produced two distinct route " +
        "strings for them.",
    );
  }
}

async function main(): Promise<void> {
  await assertDocsDirExists();
  const files = await collectMdxFiles(DOCS_DIR);
  const pages = await Promise.all(files.map((fullPath) => readPage(fullPath)));

  const forbiddenDocsIndex = path.join(PUBLIC_DIR, "docs", "index.md");

  const rendered = await renderAll(pages, PUBLIC_DIR);

  if (rendered.some((r) => r.outPath === forbiddenDocsIndex)) {
    throw new Error(
      `scripts/build-md-mirrors.ts: about to write "${forbiddenDocsIndex}", which must never exist — ` +
        '"/docs" is a route ("/docs.md" is its mirror); "/docs/index" is not a route (§15.2). ' +
        "routeFor's slug rule was bypassed somewhere above this check.",
    );
  }

  const outPaths = rendered.map((r) => r.outPath);
  if (new Set(outPaths).size !== outPaths.length) {
    throw new Error(
      "scripts/build-md-mirrors.ts: two or more corpus pages resolved to the identical output path " +
        "string. routeFor() must be injective over the corpus; find the duplicate route and fix its " +
        "source file.",
    );
  }

  await rm(path.join(PUBLIC_DIR, "docs.md"), { force: true });
  await rm(path.join(PUBLIC_DIR, "docs"), { recursive: true, force: true });
  console.log("build-md-mirrors: cleared public/docs.md and public/docs/ (registry output under public/r/ is untouched).");

  for (const { outPath, content } of rendered) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, content, "utf8");
  }

  const emittedFiles = await collectEmittedMdFiles(PUBLIC_DIR);
  assertEmittedMatchesCorpus(files.length, emittedFiles);

  console.log(`build-md-mirrors: emitted ${emittedFiles.length} markdown mirrors into public/.`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
