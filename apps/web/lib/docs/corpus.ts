// Corpus-reading helpers shared by lib/docs/index.ts (the real, cached,
// server-only DocPage index Next reads at request/build time) and
// scripts/build-md-mirrors.ts (Task 8.2's plain-Node script, which cannot
// load index.ts — it starts with `import "server-only"`, whose
// non-`react-server` export is a bare `throw`). Both readers walk the same
// directory, turn the same relative path into the same route, and blank the
// same frontmatter block the same way; earlier these were two independent
// copies. A review (fix round 1, Important 1) sliced both copies of
// `routeFor`/`collectMdxFiles` apart and found them byte-identical, and ran
// both `blankFrontmatter`s over the full 69-file corpus plus six synthetic
// inputs with zero mismatches — a duplication that exact is removable, not
// merely worth asserting on. This module IS the fix: one copy, imported by
// both, so the two readers are provably the same reader instead of two a
// reviewer has to keep re-checking agree.
//
// This module must stay loadable by plain Node with no bundler: no runtime
// import here may transitively reach "server-only", and only erasable
// TypeScript syntax is used (no `enum`, no `namespace`, no constructor
// parameter properties) — the same two rules `lib/docs/serialize-md.ts`'s
// header documents, for the same reason.

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
// Explicit ".ts" specifier, unlike index.ts's own import of this same
// module: this file is loaded by TWO runtimes — Next/tsc (bundler
// resolution, tolerant of an extensionless specifier) AND plain Node via
// scripts/build-md-mirrors.ts's explicit-".ts" import chain (not tolerant:
// ERR_MODULE_NOT_FOUND on an extensionless relative specifier, verified).
// Every relative import inside a module reachable from that script's entry
// point needs this, not just the entry point's own imports of its
// siblings.
import { z } from "zod";
import { frontmatterSchema } from "./schema.ts";

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
export const DOCS_DIR = path.join(process.cwd(), "docs");

// Names the resolved path, the current cwd, and the fix, rather than
// letting a wrong-cwd invocation surface as a bare ENOENT with a stack
// trace and nothing else. Originally lib/docs/index.ts's own guard; moved
// here unchanged so scripts/build-md-mirrors.ts gets it too (fix round 1,
// Minor 3) — that script has no other reason to fail differently from
// `next build`/`next dev` on the same mistake.
export async function assertDocsDirExists(): Promise<void> {
  let isDirectory = false;
  try {
    isDirectory = (await stat(DOCS_DIR)).isDirectory();
  } catch {
    isDirectory = false;
  }
  if (!isDirectory) {
    throw new Error(
      `lib/docs/corpus.ts: expected a docs directory at "${DOCS_DIR}" but found none. ` +
        `This path is process.cwd() + "docs"; process.cwd() is currently "${process.cwd()}". ` +
        `Run the build/dev server, or scripts/build-md-mirrors.ts, with cwd = apps/web.`,
    );
  }
}

export async function collectMdxFiles(dir: string): Promise<string[]> {
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
export function routeFor(relPath: string): string {
  const withoutExt = relPath.slice(0, -path.extname(relPath).length);
  return withoutExt === "index" ? "/docs" : `/docs/${withoutExt}`;
}

// Blanks the leading YAML frontmatter block (both `---` delimiter lines and
// everything between) instead of deleting it, so line numbers in the
// remaining content stay aligned with the source file — the same trick
// stripFences uses for code fences. vfile-matter's own `strip: true`
// deletes the lines instead, which shifts every subsequent line number by
// the frontmatter's length; blanking keeps a heading's line in the result
// equal to its line in the source file, which lib/docs/index.ts's Task
// 2.4/2.9 callers need to report an accurate location. The closing `---`
// is blanked too — left in place it reads as a markdown thematic break
// (`hr`), a phantom construct for Task 2.4's scan.
//
// Returns `frontmatterEnd` (the closing delimiter's line index, or -1 if no
// frontmatter block was found) alongside the blanked text: lib/docs/index.ts
// only ever needed the blanked string, but scripts/build-md-mirrors.ts also
// needs to slice the ORIGINAL, unblanked lines out separately, for a
// mirror's own verbatim frontmatter header. One shared return shape serves
// both callers instead of a second near-identical function.
//
// NOT a guard against every malformed frontmatter block: a delimiter line
// of `"---\r"` (a CRLF-authored file) fails this function's exact
// `lines[0] !== "---"` check and returns `{ blanked: content,
// frontmatterEnd: -1 }` — content untouched — even though `vfile-matter`'s
// own, more tolerant YAML front-matter detection still parses that same
// file's title/description successfully (measured directly: a CRLF file's
// `matter()` call succeeds and `frontmatterSchema.parse` returns a valid
// object, while this function finds no `"---"` line at all). lib/docs/index.ts
// does not check for this at all: its `readPage` calls this function, gets
// `frontmatterEnd === -1` silently, and the returned `raw` is the ORIGINAL
// content, unblanked — that page's YAML frontmatter then renders as
// visible body text on the live site, today, if such a file were ever
// authored. scripts/build-md-mirrors.ts (the only current caller that
// inspects `frontmatterEnd`) turns this into a build failure instead (fix
// round 1, Minor 4) — but the corpus has zero CRLF files today (verified),
// so neither path has ever been exercised in production.
//
// A leading byte-order mark is NOT an instance of this — measured directly
// (fix round 2, item 2), a BOM makes `vfile-matter` MISS the frontmatter
// block entirely (`file.data.matter` comes back `{}`), so
// `frontmatterSchema.parse` throws a `ZodError` in `parseFrontmatter`
// before this function is ever reached, from either caller. A BOM-authored
// file cannot exercise this branch; an earlier version of this comment
// (and of scripts/build-md-mirrors.ts's corresponding error message)
// claimed otherwise without having checked.
export function blankFrontmatter(content: string): { blanked: string; frontmatterEnd: number } {
  const lines = content.split("\n");
  if (lines[0] !== "---") return { blanked: content, frontmatterEnd: -1 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { blanked: content, frontmatterEnd: -1 };
  const blankedLines = lines.slice();
  for (let i = 0; i <= end; i++) blankedLines[i] = "";
  return { blanked: blankedLines.join("\n"), frontmatterEnd: end };
}

// Derived from the schema, not hand-typed (fix round 2, item 4): a
// hand-written `{ title: string; description: string }` matches
// `frontmatterSchema` today, but a future field added there would be
// silently invisible to both callers of `parseFrontmatter` below unless
// this type is defined in terms of the schema itself.
export type ParsedFrontmatter = z.infer<typeof frontmatterSchema>;

// The frontmatter parse both readers used to run independently: vfile +
// vfile-matter extract the YAML block, `frontmatterSchema` (lib/docs/schema.ts)
// validates it — missing or malformed frontmatter throws here and fails the
// build, matching lib/docs/index.ts's original behaviour exactly (no
// `strip: true`; stripping deletes the frontmatter lines and shifts every
// line number after it, which is `blankFrontmatter`'s job to avoid instead).
// Synchronous: `matter()` and `frontmatterSchema.parse()` both are: nothing
// here does I/O (the caller already read `content` off disk).
export function parseFrontmatter(fullPath: string, content: string): ParsedFrontmatter {
  const file = new VFile({ path: fullPath, value: content });
  matter(file);
  return frontmatterSchema.parse(file.data.matter);
}
