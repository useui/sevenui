import "server-only";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import { frontmatterSchema } from "./schema";
import { scanHeadings, type Heading } from "./headings";
import { validateLinks } from "./links";

export type { Heading };

export type DocPage = {
  route: string;
  title: string;
  description: string;
  headings: Heading[];
  sourcePath: string;
  raw: string;
};

// Anchored on process.cwd(), not on this module's own location
// (import.meta.url). A source-relative path looks more "robust to cwd",
// but a bundled Next server build emits this module into
// .next/server/chunks/…, so import.meta.url would point at the emitted
// chunk and a "../../docs" climb would resolve inside the build output,
// not the repo — readdir would then throw ENOENT. next build / next start /
// next dev, and `pnpm --filter @sevenui/web build`, all run with
// cwd = apps/web (also the Vercel root directory), and process.cwd() is
// the path Next itself documents for filesystem reads. Do not change this
// back to a source-relative path.
const DOCS_DIR = path.join(process.cwd(), "docs");

async function assertDocsDirExists(): Promise<void> {
  let isDirectory = false;
  try {
    isDirectory = (await stat(DOCS_DIR)).isDirectory();
  } catch {
    isDirectory = false;
  }
  if (!isDirectory) {
    throw new Error(
      `lib/docs/index.ts: expected a docs directory at "${DOCS_DIR}" but found none. ` +
        `This path is process.cwd() + "docs"; process.cwd() is currently "${process.cwd()}". ` +
        `Run the build/dev server with cwd = apps/web.`,
    );
  }
}

async function collectMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }
  return files;
}

// docs/index.mdx -> /docs, docs/installation.mdx -> /docs/installation,
// docs/components/button.mdx -> /docs/components/button
function routeFor(relPath: string): string {
  const withoutExt = relPath.slice(0, -path.extname(relPath).length);
  return withoutExt === "index" ? "/docs" : `/docs/${withoutExt}`;
}

// Blanks the leading YAML frontmatter block (both `---` delimiter lines and
// everything between) instead of deleting it, so `raw`'s line numbers stay
// aligned with the source file — the same trick stripFences uses for code
// fences. vfile-matter's own `strip: true` deletes the lines instead, which
// shifts every subsequent line number by the frontmatter's length; blanking
// keeps a heading's line in `raw` equal to its line in the source file,
// which Task 2.4/2.9 need to report an accurate location. The closing `---`
// is blanked too — left in place it reads as a markdown thematic break
// (`hr`), a phantom construct for Task 2.4's scan.
function blankFrontmatter(content: string): string {
  const lines = content.split("\n");
  if (lines[0] !== "---") return content;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return content;
  for (let i = 0; i <= end; i++) lines[i] = "";
  return lines.join("\n");
}

async function readPage(fullPath: string): Promise<DocPage> {
  const content = await readFile(fullPath, "utf8");
  const file = new VFile({ path: fullPath, value: content });

  // Missing or malformed frontmatter throws here and fails the build.
  // No `strip: true`: stripping deletes the frontmatter lines and shifts
  // every line number after it; `raw` is blanked instead, below.
  matter(file);
  const frontmatter = frontmatterSchema.parse(file.data.matter);

  const raw = blankFrontmatter(content);
  const relPath = path.relative(DOCS_DIR, fullPath).split(path.sep).join("/");

  return {
    route: routeFor(relPath),
    title: frontmatter.title,
    description: frontmatter.description,
    headings: scanHeadings(raw),
    sourcePath: `docs/${relPath}`,
    raw,
  };
}

async function readAll(): Promise<DocPage[]> {
  await assertDocsDirExists();
  const files = await collectMdxFiles(DOCS_DIR);
  const pages = await Promise.all(files.map((fullPath) => readPage(fullPath)));

  // --- Per-build assertions seam -------------------------------------
  // Later tasks in this stage validate the fully assembled index here,
  // before it is handed to any consumer. Each should throw to fail the
  // build on violation:
  //   - Task 2.2: assertNavCoversIndex(pages) — every page has a nav entry
  //   - Task 2.4: forbidden-construct scan over each page's `raw`
  //   - Task 2.9: link validator over each page's `raw` (done — see below)
  // ---------------------------------------------------------------------
  validateLinks(pages);

  return pages;
}

let cached: Promise<DocPage[]> | undefined;

export function getDocIndex(): Promise<DocPage[]> {
  if (process.env.NODE_ENV === "production" && cached) return cached;
  const p = readAll();
  if (process.env.NODE_ENV === "production") cached = p;
  return p;
}

export async function getDoc(route: string): Promise<DocPage | undefined> {
  const index = await getDocIndex();
  return index.find((page) => page.route === route);
}
