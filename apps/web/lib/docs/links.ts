import type { DocPage } from "./index";
import { stripFences } from "./headings";
import { currentTabForRoute, SITE_TABS } from "../site-tabs";
import { CUSTOM_ROUTES } from "../page-meta";

export type InternalLink = { href: string; line: number };

const LINK = /(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g;

const REF_DEF = /^ {0,3}\[[^\]]+\]:\s*(\S+)/;

function stripAngleBrackets(target: string): string {
  return target.startsWith("<") && target.endsWith(">") ? target.slice(1, -1) : target;
}

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

export function internalLinksOf(raw: string): InternalLink[] {
  const out: InternalLink[] = [];
  const lines = stripFences(raw).split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(LINK)) {
      const href = m[1];
      if (isInternal(href)) out.push({ href, line: i + 1 });
    }
    const refMatch = REF_DEF.exec(line);
    if (refMatch) {
      const href = stripAngleBrackets(refMatch[1]);
      if (isInternal(href)) out.push({ href, line: i + 1 });
    }
  });
  return out;
}

function hasHeading(index: DocPage[], path: string, hash: string): boolean {
  const page = index.find((p) => p.route === path);
  return page !== undefined && page.headings.some((h) => h.id === hash);
}

export function validateLinks(index: DocPage[]): void {
  const routes = new Set(index.map((p) => p.route));
  for (const page of index) {
    for (const { href, line } of internalLinksOf(page.raw)) {
      const [path, hash] = href.split("#");
      if (!path) continue; // pure same-page fragment, e.g. "#top"

      if (path === "/docs" || path.startsWith("/docs/")) {
        if (!routes.has(path)) {
          throw new Error(`${page.sourcePath}:${line}: link ${href} resolves to no docs route`);
        }
        if (hash && !hasHeading(index, path, hash)) {
          throw new Error(`${page.sourcePath}:${line}: anchor ${href} does not exist`);
        }
        continue;
      }

      if (currentTabForRoute(path, SITE_TABS) === undefined && !CUSTOM_ROUTES.has(path)) {
        throw new Error(
          `${page.sourcePath}:${line}: link ${href} matches no site-tabs.ts section and no page-meta.ts custom route`,
        );
      }
    }
  }
}
