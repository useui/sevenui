import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanHeadings, type Heading } from "./headings";
import { validateLinks } from "./links";
import { assertNavCoversIndex, buildNavTree } from "./nav";
import { assertElementsAllowed } from "./elements";
import { assertDocsDirExists, blankFrontmatter, collectMdxFiles, DOCS_DIR, parseFrontmatter, routeFor } from "./corpus";

export type { Heading };

export type DocPage = {
  route: string;
  title: string;
  description: string;
  headings: Heading[];
  sourcePath: string;
  raw: string;
};

// Directory walking, route derivation, frontmatter blanking and frontmatter
// parsing all moved to ./corpus (fix round 1, Important 1) — this module
// and scripts/build-md-mirrors.ts both need the exact same answers to
// "which files, what route, what's blanked," and a review proved the two
// prior copies were byte-identical, which makes one shared copy strictly
// better than two checked-equal copies. What genuinely cannot move stays
// here: the `server-only` marker itself, `scanHeadings` (only this
// module's DocPage carries `headings`), the per-build assertion seam below,
// and the production cache.

async function readPage(fullPath: string): Promise<DocPage> {
  const content = await readFile(fullPath, "utf8");

  // Missing or malformed frontmatter throws here and fails the build (see
  // ./corpus's parseFrontmatter — no `strip: true`: stripping deletes the
  // frontmatter lines and shifts every line number after it; `raw` is
  // blanked instead, below).
  const frontmatter = parseFrontmatter(fullPath, content);

  const { blanked: raw } = blankFrontmatter(content);
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
  //   - Task 2.2: assertNavCoversIndex(pages, buildNavTree(pages)) — every
  //     page has a nav entry, exactly once (done — see below)
  //   - Task 2.4: forbidden-construct + JSX-tag scan over each page's
  //     `raw`, asserting the nine-element map is actually closed
  //     (done — see below)
  //   - Task 2.9: link validator over each page's `raw` (done — see below)
  // ---------------------------------------------------------------------
  validateLinks(pages);
  assertNavCoversIndex(pages, buildNavTree(pages));
  assertElementsAllowed(pages);

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
