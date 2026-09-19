import type { DocPage } from "./index";
import { stripFences } from "./headings";
import { currentTabForRoute } from "../site-tabs";
import { CUSTOM_ROUTES } from "../page-meta";

export type InternalLink = { href: string; line: number };

// Matches markdown link syntax `[text](target)`, not image syntax
// `![alt](target)` — the negative lookbehind excludes a leading `!` so an
// image source is never mistaken for a navigable link. Operates one line at
// a time against `stripFences`'d text (the same fence-blanking `headings.ts`
// uses) so a `](/…)` written as prose *inside* a fenced example — e.g. this
// file's own doc comments, or a future "here's what a link looks like" code
// sample — is never collected. `raw`'s line numbers are aligned 1:1 with the
// source file (Task 2.1 blanks rather than deletes both frontmatter and
// fence lines for exactly this reason), so the 1-based line returned here is
// the line to report.
const LINK = /(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g;

// Matches a CommonMark link *reference definition* — `[label]: target`,
// optionally indented 0-3 spaces and optionally trailed by a title — as
// opposed to a link *use* (`[text][label]` or `[text]`), which resolves
// through the definition and is not itself a target to validate. Without
// this, `[bad]: /docs/components/nope` paired with a use like `See [bad].`
// validated as fine: the use contains no `(...)` for `LINK` to match, so the
// broken target only ever appeared on the definition line, which `LINK`
// also does not match (no parens at all). That is a false *negative* — a
// broken link reported clean — which is the one failure mode this validator
// exists to rule out (a base-relative link is a WRONG PAGE, not a missing
// one), so it is collected here rather than left to a future task.
const REF_DEF = /^ {0,3}\[[^\]]+\]:\s*(\S+)/;

// A reference definition's target may be wrapped in `<...>` (CommonMark's
// escape for a target containing spaces); `LINK`'s inline targets never are,
// since `[^)\s]+` already stops at the first space.
function stripAngleBrackets(target: string): string {
  return target.startsWith("<") && target.endsWith(">") ? target.slice(1, -1) : target;
}

// Only root-relative targets (`/…`) and pure same-page fragments (`#…`) are
// "internal" — an absolute `https://…` link to another site, or a
// `mailto:`, is out of scope for this validator (and, per Task 2.9 Step 1,
// same-origin absolute links no longer exist in the corpus at all: they were
// rewritten to root-relative so `rehype-external-links` can run with plain
// options).
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

// A base-relative link is an ERROR, not a warning, because the failure mode
// is a WRONG PAGE, not a missing one (§4.6, §11.7). Blume rewrote them
// through basePath; there is no basePath here (§3).
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

      // A non-`/docs` root-relative link (e.g. `/components`, `/blocks`) can't
      // be checked against the content index — that index only knows docs
      // routes. It can't be checked against a real route set for those
      // sections either, because `/components`'s and `/blocks`'s pages don't
      // exist until Stage 4 and Stage 5 build them. The best this task can do
      // without inventing a second registry is accept the link if either
      // registry already in the repo knows the route: `lib/site-tabs.ts`'s
      // `SITE_TABS` (the site's sections — `/components`, `/blocks`, `/pro`,
      // …) or `lib/page-meta.ts`'s `CUSTOM_ROUTES` (declared custom pages —
      // `/`, `/terms`, `/privacy`, `/account`, …), which between them cover
      // every non-docs route this site actually has today. A path in
      // neither still throws, which is what catches a typo like
      // `/componentz`: letting any non-docs link pass unchecked would
      // silently accept a wrong page. Tightening the `/components`/`/blocks`
      // half to their real per-item routes is Stage 4/5's job.
      if (currentTabForRoute(path) === undefined && !CUSTOM_ROUTES.has(path)) {
        throw new Error(
          `${page.sourcePath}:${line}: link ${href} matches no site-tabs.ts section and no page-meta.ts custom route`,
        );
      }
    }
  }
}
