// Emits the 69 per-page Markdown mirrors (`<page path>.md`) into `public/`,
// before `next build` runs (Task 8.2, §15.1/§15.2). The URL shape
// `<page path>.md` — `/docs.md`, `/docs/components/button.md` — cannot be
// expressed as a Next route segment: `app/docs/[[...slug]]/page.tsx` already
// matches the segment list `["components", "button.md"]`, so a root-level
// catch-all `route.ts` would never be reached for these paths, and a
// segment folder cannot carry a `.md` suffix after a dynamic bracket. The
// mirrors are therefore build-time output written straight into `public/`
// — the same shape `public/r/` (the registry build, `pnpm build:registry`)
// already uses, and byte-for-byte what the Astro build wrote to disk in
// production.
//
// This script runs as plain Node (`node scripts/build-md-mirrors.ts`, with
// cwd = `apps/web`), before `next build` even starts, so nothing it imports
// may transitively reach `server-only` (its non-`react-server` export is a
// bare `throw`). `lib/docs/serialize-md.ts`'s own header explains the two
// rules that follow from that — explicit `.ts` import specifiers for repo
// modules (Node's type-stripping resolves an explicit `.ts` specifier but
// not an extensionless relative TS import), and `DocPage` imported as a
// type only — and this file follows both. This file is `.ts`, not `.mts`:
// `apps/web/tsconfig.json`'s `include` is `**/*.ts`, so a `.ts` file is
// checked by `pnpm typecheck` and a `.mts` file silently would not be. Only
// erasable TypeScript syntax is used below so Node's default (from 22.18+)
// type stripping can load it with no build step.
//
// `getDocIndex()` (lib/docs/index.ts) cannot be called from here — that
// module's first line is `import "server-only"` — so this script reads the
// docs corpus through `lib/docs/corpus.ts` instead: the directory walk,
// route derivation and frontmatter handling `lib/docs/index.ts` itself now
// imports from the same place (fix round 1, Important 1 — these used to be
// two independently-typed copies; a review proved them byte-identical and
// they were merged into one). This script's output is still diffed
// byte-for-byte against 68 production fixtures, and `llms-full.txt`
// (Task 8.3) is still built from the real `getDocIndex()` inside Next and
// diffed against its own fixture — two callers of the same corpus reader,
// both pinned to the same production baseline.

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

// Anchored on process.cwd(), matching lib/docs/corpus.ts's DOCS_DIR comment
// and lib/docs/serialize-md.ts's REGISTRY_DIR comment, for the same reason.
const PUBLIC_DIR = path.join(process.cwd(), "public");

// One corpus page's data, in the shape this script needs: DocPageSummary's
// three fields (so the array of these can be passed straight to
// `toMarkdown` for `<PrimitiveIndex>`), plus `sourcePath`/`raw` (the two
// fields `toMarkdown` itself reads — see that function's narrowed
// parameter type) and `frontmatterBlock` (this script's own concern, not
// `toMarkdown`'s: the mirror's contract is the source `.mdx`'s own
// `---`-delimited block, exactly as authored, then a blank line, then the
// rendered body).
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
    // `parseFrontmatter` above already succeeded — vfile-matter's tolerant
    // YAML front-matter detection accepted this file's frontmatter block —
    // but `blankFrontmatter`'s exact `lines[0] === "---"` check did not.
    // The real, and ONLY reachable, trigger for this exact combination
    // (fix round 1, Minor 4; corrected again in fix round 2, item 2, after
    // an earlier version of this message ALSO named a byte-order mark —
    // measured directly and found wrong: a BOM makes vfile-matter miss the
    // frontmatter block entirely, so `parseFrontmatter` itself throws a
    // `ZodError` above, before this branch can ever run) is CRLF line
    // endings: a delimiter line of "---\r" still parses under
    // vfile-matter's tolerant detection but fails this exact-string check.
    // `lib/docs/corpus.ts`'s `blankFrontmatter` is shared by
    // `lib/docs/index.ts` too, and that caller does NOT guard against this
    // at all — it silently returns the original, unblanked content, and
    // that page's YAML frontmatter renders as visible body text on the
    // live site. This script fails the build instead, so a CRLF-authored
    // file surfaces here rather than shipping a mirror with the same
    // garbled top. (The corpus has zero CRLF files today — verified — so
    // this has never fired.)
    throw new Error(
      `scripts/build-md-mirrors.ts: ${fullPath} was parsed by vfile-matter as having valid frontmatter, ` +
        'but lib/docs/corpus.ts\'s blankFrontmatter found no literal "---" line to blank. The likely cause ' +
        'is CRLF line endings: a delimiter line of "---\\r" still parses under vfile-matter\'s tolerant ' +
        "detection but fails blankFrontmatter's exact string check. Re-save this file with LF line endings.",
    );
  }

  const relPath = path.relative(DOCS_DIR, fullPath).split(path.sep).join("/");
  // The original (unblanked) lines, verbatim — the mirror's frontmatter
  // block, as authored, byte-for-byte (task-8.2-brief.md's contract).
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

// Where one page's mirror is written. Exported (alongside
// `collectEmittedMdFiles` and `assertEmittedMatchesCorpus` below) purely so
// a test can exercise the exact path-resolution and re-walk logic this
// script ships against a scratch directory, without needing two colliding
// real `.mdx` source files on disk — which, on THIS machine's
// case-insensitive filesystem, cannot exist simultaneously in the first
// place (see `collectEmittedMdFiles`'s comment). Importing this module for
// these exports does NOT also run the real pipeline: see the `isMain`
// guard at the bottom of this file (fix round 2, item 1) — an earlier
// version had no such guard, and importing it for exactly this reason ran
// `main()` as an unrequested side effect against whatever `cwd` the
// importer had.
export function outPathFor(route: string, publicDir: string): string {
  return path.join(publicDir, `${route.slice(1)}.md`);
}

// Renders every page's mirror content fully into memory BEFORE anything on
// disk is touched (fix round 1, Minor 5). `toMarkdown` throws on a missing
// `<Component path>` file or an unrenderable tag; the previous version
// cleaned `public/docs.md` and `public/docs/` first and wrote as it
// rendered, so a failure partway through left the previous COMPLETE mirror
// set deleted and only a partial new one in its place. The `&&` chain in
// `package.json`'s `build` script stops `next build` from ever running
// against that half-written tree in a single `pnpm build` invocation, but a
// later BARE `next build` or `next start` — run without re-running this
// script — would serve the pruned tree silently. Rendering everything
// first means a throw here leaves the previous, complete `public/docs*`
// tree completely untouched: nothing is deleted until every page has
// already rendered successfully.
async function renderAll(pages: readonly Page[], publicDir: string): Promise<{ outPath: string; content: string }[]> {
  const rendered: { outPath: string; content: string }[] = [];
  for (const page of pages) {
    const outPath = outPathFor(page.route, publicDir);
    const body = await toMarkdown(page, pages);
    rendered.push({ outPath, content: `${page.frontmatterBlock}\n\n${body}` });
  }
  return rendered;
}

// Every `.md` file ACTUALLY present under the two locations this script
// ever writes: `<publicDir>/docs.md` and `<publicDir>/docs/**/*.md`.
//
// This replaces the previous version's `emitted` counter, which counted
// iterations of the write loop — an identity always equal to
// `pages.length`, since the loop has no `continue` and no filter, and
// therefore an assertion that could never fire (fix round 1, Important 2).
// The property that assertion claimed to check — one mirror per corpus
// `.mdx`, no more, no fewer, ON DISK — is a filesystem fact, not a loop
// fact, and only a re-walk of the actual emitted tree can see it disagree.
//
// Concretely: this machine's filesystem is case-insensitive (verified:
// writing "Foo.txt" immediately after "foo.txt" in the same directory
// produces ONE directory entry holding the second write's content, not
// two). Two corpus pages whose routes differ only by case — unreachable
// from THIS repo's actual `docs/` tree today, since the same
// case-insensitivity means two such `.mdx` SOURCE files could never
// coexist as distinct `readdir` entries here either, but reachable if the
// corpus were ever checked out from a case-SENSITIVE filesystem (e.g.
// Linux CI, where such a pair could exist as two real git blobs) onto this
// one — resolve to two DIFFERENT strings in `renderAll`'s output, and the
// second `writeFile` silently overwrites the first on disk. Counting write
// calls reports two; re-walking the disk reports one. Only the second
// number is the truth this script exists to guarantee.
// A missing file/directory (ENOENT) is a legitimate "contributes zero" —
// the length check in `assertEmittedMatchesCorpus` already reports that as
// a mismatch, with a clear message. Any OTHER error (EACCES on an
// unreadable `public/docs/`, ENOTDIR if something replaced it with a
// plain file, …) must not be swallowed into that same "zero" bucket: fix
// round 2, item 3, caught this — the previous version's bare `catch {
// return; }` reported a permission error as a short mirror count / a
// "case-collision" hint that had nothing to do with the actual cause. Only
// ENOENT is treated as absence; everything else propagates.
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
    // Absent — contributes zero. Its absence is still caught below by the
    // overall count mismatch, same as any other missing file would be.
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

// The guard itself, factored out so a test can call the exact function
// `main()` uses against a deliberately colliding scratch scenario, rather
// than a reimplementation of it (fix round 1's own instruction: "a guard
// that cannot fire is what this round is fixing; do not replace one with
// another" — the fix has to be shown firing on the real code path).
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

  // §15.2 / task-8.2-brief.md Step 2: "/docs" is a route, "/docs/index" is
  // not — there is nothing to normalize. Checked against the resolved
  // output paths below, before anything is written, so an emitter that
  // someday "normalizes" /docs into /docs/index fails the build instead of
  // silently creating a URL production never served.
  const forbiddenDocsIndex = path.join(PUBLIC_DIR, "docs", "index.md");

  // All-or-nothing: nothing on disk is touched until every page has
  // rendered (Minor 5's fix — see renderAll's comment).
  const rendered = await renderAll(pages, PUBLIC_DIR);

  if (rendered.some((r) => r.outPath === forbiddenDocsIndex)) {
    throw new Error(
      `scripts/build-md-mirrors.ts: about to write "${forbiddenDocsIndex}", which must never exist — ` +
        '"/docs" is a route ("/docs.md" is its mirror); "/docs/index" is not a route (§15.2). ' +
        "routeFor's slug rule was bypassed somewhere above this check.",
    );
  }

  // Defensive, and cheap, but not a substitute for the post-write re-walk
  // below: two pages resolving to the exact same output STRING is a
  // routeFor bug reachable with no filesystem quirk at all, and this
  // catches it immediately. It does NOT catch the case-insensitive
  // collision the re-walk exists for (two different strings, one physical
  // file) — a `Set` over strings cannot see a filesystem property.
  const outPaths = rendered.map((r) => r.outPath);
  if (new Set(outPaths).size !== outPaths.length) {
    throw new Error(
      "scripts/build-md-mirrors.ts: two or more corpus pages resolved to the identical output path " +
        "string. routeFor() must be injective over the corpus; find the duplicate route and fix its " +
        "source file.",
    );
  }

  // --- Clear stale output, precisely scoped ---------------------------
  // A deleted or renamed .mdx source must not leave a mirror on disk that
  // no current page claims — it would still be served as if it were live.
  // Scoped to exactly the two shapes this script ever writes:
  // `public/docs.md` (the single "/docs" route) and everything under
  // `public/docs/` (every other docs route). This is deliberately NOT a
  // wildcard clear of `public/` (or even of `public/*.md` up front,
  // matching the brief's own two-line .gitignore split): `public/r/` is
  // `pnpm build:registry`'s own output, lives in the same `public/` tree,
  // and deleting it here would break the site's shadcn registry endpoints
  // for a reason that has nothing to do with this script's job.
  //
  // Deliberately run AFTER renderAll, not before (Minor 5): every page has
  // already rendered successfully by this point, so a rendering failure
  // never reaches this line and the previous, complete mirror set is never
  // deleted out from under a build that then fails anyway.
  await rm(path.join(PUBLIC_DIR, "docs.md"), { force: true });
  await rm(path.join(PUBLIC_DIR, "docs"), { recursive: true, force: true });
  // The only evidence in a CI log that this step ran at all (fix round 2,
  // item 5 — dropped in fix round 1's rewrite and restored here).
  console.log("build-md-mirrors: cleared public/docs.md and public/docs/ (registry output under public/r/ is untouched).");

  for (const { outPath, content } of rendered) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, content, "utf8");
  }

  // The authoritative check (fix round 1, Important 2): re-walk what is
  // ACTUALLY on disk and compare against the corpus size. See
  // `collectEmittedMdFiles`'s and `assertEmittedMatchesCorpus`'s own
  // comments for why a loop-iteration count cannot see what this does.
  const emittedFiles = await collectEmittedMdFiles(PUBLIC_DIR);
  assertEmittedMatchesCorpus(files.length, emittedFiles);

  console.log(`build-md-mirrors: emitted ${emittedFiles.length} markdown mirrors into public/.`);
}

// Gated on `isMain` (fix round 2, item 1 — Important). Before this guard,
// `main()` ran unconditionally at module scope, which was harmless only
// because the module exported nothing — nobody had a reason to import it.
// Fix round 1 added three exports (`outPathFor`, `collectEmittedMdFiles`,
// `assertEmittedMatchesCorpus`) specifically so tests could exercise them
// in isolation, which turned "nobody imports this" into an invitation:
// the reviewer demonstrated that a five-line importer doing nothing but
// `import { assertEmittedMatchesCorpus } from "./build-md-mirrors.ts"` ran
// the real pipeline as a side effect — deleting a planted witness file
// under `public/docs/` and rewriting all 69 mirrors from whatever `cwd`
// the importing process happened to have — and that a second importer, run
// one directory up, printed a success message while exiting 1, because the
// unconditional `.catch` set `process.exitCode` on a `cwd` unrelated to
// the importer's own work. This repo already has the fix, applied in
// exactly the two other scripts that export functions
// (`scripts/route-inventory.mjs`, `scripts/extract-page-features.mjs`) —
// `scripts/check-pro-manifest.mjs`, which exports nothing, still calls
// `main()` unconditionally, matching the "exports ⇒ guard" split those two
// establish. `process.exit(1)` (not `process.exitCode = 1`) is part of the
// same idiom: it fixes the exit-code half in the same line, and has been
// confirmed to resolve correctly for a type-stripped `.ts` entry under
// Node 24 — no new risk from adopting it here.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
