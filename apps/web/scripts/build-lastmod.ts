// Writes lib/lastmod.generated.json: each page route's last-modified date, taken from the git
// history of the files that page is built from, for the sitemap's <lastmod>. A date Google cannot
// trust is worse than none, so a route is left out whenever its date cannot be known:
// - no git (an export without .git): every route is left out;
// - a shallow clone: a route whose last commit is a shallow boundary is left out, because the
//   boundary commit only claims files that really changed earlier, out of the clone's reach.
// Blocks pages are built from the pro manifest, which carries no dates, so they never get one.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WEB = process.cwd();
const REPO = path.join(WEB, "../..");
const OUTPUT = path.join(WEB, "lib/lastmod.generated.json");

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function walk(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, ext);
    return entry.name.endsWith(ext) ? [full] : [];
  });
}

const sources = new Map<string, string[]>();

// Docs: one MDX file per route.
const docsDir = path.join(WEB, "docs");
for (const file of walk(docsDir, ".mdx")) {
  const slug = path.relative(docsDir, file).split(path.sep).join("/").replace(/\.mdx$/, "");
  sources.set(slug === "index" ? "/docs" : `/docs/${slug}`, [file]);
}

// Gallery: a page is its registry folder; the hub is every folder plus its own page.
const galleryDir = path.join(REPO, "packages/registry/components");
const galleryFolders = readdirSync(galleryDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(galleryDir, entry.name));
for (const folder of galleryFolders) sources.set(`/components/${path.basename(folder)}`, [folder]);
sources.set("/components", [path.join(WEB, "app/components/page.tsx"), galleryDir]);

// Custom pages: their own page file (and a colocated FAQ, where there is one).
sources.set("/", [path.join(WEB, "app/page.tsx")]);
for (const route of ["/pro", "/support", "/roadmap", "/terms", "/privacy", "/block-request", "/blocks"]) {
  const dir = path.join(WEB, "app", route.slice(1));
  sources.set(
    route,
    readdirSync(dir)
      .filter((name) => name.endsWith(".tsx"))
      .map((name) => path.join(dir, name)),
  );
}

let dates: Record<string, string> = {};
try {
  const shallow = git(["rev-parse", "--is-shallow-repository"]) === "true";
  const shallowFile = git(["rev-parse", "--git-path", "shallow"]);
  const boundaries = new Set(
    shallow && existsSync(path.resolve(REPO, shallowFile))
      ? readFileSync(path.resolve(REPO, shallowFile), "utf8").split("\n").filter(Boolean)
      : [],
  );
  for (const [route, files] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
    const line = git(["log", "-1", "--format=%H %cI", "--", ...files]);
    if (!line) continue;
    const [hash, date] = line.split(" ");
    if (boundaries.has(hash)) continue;
    dates[route] = date;
  }
  console.log(`scripts/build-lastmod.ts: ${Object.keys(dates).length}/${sources.size} routes dated${shallow ? " (shallow clone)" : ""}`);
} catch {
  dates = {};
  console.warn("scripts/build-lastmod.ts: git history unavailable — the sitemap ships without <lastmod>");
}

writeFileSync(OUTPUT, `${JSON.stringify(dates, null, 2)}\n`);
