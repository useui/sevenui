import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { scanHeadings, type Heading } from "./headings";
import { POPUP_PRIMITIVES, UI_SDK_NOTES } from "../ui-sdk-notes";
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

/** Whether a primitive page's UI SDK API reference renders a "Differences on UI SDK" list. */
function hasUiSdkDifferences(relPath: string): boolean {
  const name = relPath.match(/^components\/([a-z0-9-]+)\.mdx$/)?.[1];
  return name !== undefined && (POPUP_PRIMITIVES.has(name) || (UI_SDK_NOTES[name]?.length ?? 0) > 0);
}

async function readPage(fullPath: string): Promise<DocPage> {
  const content = await readFile(fullPath, "utf8");

  const frontmatter = parseFrontmatter(fullPath, content);

  const { blanked: raw } = blankFrontmatter(content);
  const relPath = path.relative(DOCS_DIR, fullPath).split(path.sep).join("/");

  return {
    route: routeFor(relPath),
    title: frontmatter.title,
    description: frontmatter.description,
    headings: scanHeadings(raw, { uiSdkDifferences: hasUiSdkDifferences(relPath) }),
    sourcePath: `docs/${relPath}`,
    raw,
  };
}

async function readAll(): Promise<DocPage[]> {
  await assertDocsDirExists();
  const files = await collectMdxFiles(DOCS_DIR);
  const pages = await Promise.all(files.map((fullPath) => readPage(fullPath)));

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
