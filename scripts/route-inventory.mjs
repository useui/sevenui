#!/usr/bin/env node
// §17.1's route inventory. Derived from the repo plus the live pro manifest —
// never a checked-in list. The `/blocks` count moved from 16 to 18 during the
// spec effort; freezing this list would rot the moment pro ships another
// category, which is exactly the property this migration exists to preserve.
//
// Usage: node scripts/route-inventory.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PRO_MANIFEST_URL = "https://pro.sevenui.dev/r/pro-manifest.json";

// --- docs: every apps/web/docs/**/*.mdx file, walked (no glob dependency) ---
//
// Deliberately excluded, not missed: /docs/blume-examples/* (~137 live 200s,
// generated from the demo registry as iframe payloads for the docs pages'
// inline examples, not pages a reader navigates to). The site's own
// `apps/web/dist/sitemap.xml` has 85 <loc> entries and zero blume-examples
// URLs, so the site itself does not treat them as routes. Whether they may
// stop returning 200 during the migration is Stage 2's call, not this
// script's — this inventory only asserts what it deliberately covers.
async function walkMdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMdxFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(full);
    }
  }
  return files;
}

async function docsRoutes() {
  const docsDir = join(REPO_ROOT, "apps/web/docs");
  const files = await walkMdxFiles(docsDir);
  return files
    .map((file) => {
      const rel = relative(docsDir, file).split(sep).join("/").replace(/\.mdx$/u, "");
      return rel === "index" ? "/docs" : `/docs/${rel}`;
    })
    .sort();
}

// --- gallery: the component gallery page set (index + one page per component) ---
// Source: packages/registry/components/registry.json — every item's
// files[0].path is "<folder>/<name>.tsx", and the folder set is the
// gallery's component set. This is the same fact apps/web/lib/gallery.ts
// reads, and that module asserts at build time, in either direction, that
// its own pinned GALLERY_SLUGS list and this registry's folder set agree —
// so reading the folder set here reads what the site already enforces,
// not a second copy of it that could quietly drift from the first.
//
// Adding a registry item does not add a route: that is a *pinned* property
// of lib/gallery.ts (GALLERY_SLUGS), enforced there, not something this
// script re-derives — this function's route count depends on that
// build-time assertion continuing to hold.
//
// Guards mirror blocksRoutes() below, for the same reason: an empty folder
// set would silently publish an empty /components, and an item with no
// folder segment in its path would silently vanish from the count instead
// of failing loudly.
async function galleryRoutes() {
  const registryPath = join(REPO_ROOT, "packages/registry/components/registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const folders = new Set();
  for (const item of registry.items) {
    const [folder, ...rest] = item.files[0].path.split("/");
    if (rest.length === 0) {
      throw new Error(
        `packages/registry/components/registry.json: item "${item.name}" has files[0].path ` +
          `"${item.files[0].path}" with no folder segment — its gallery route can't be derived.`,
      );
    }
    folders.add(folder);
  }
  if (folders.size === 0) {
    throw new Error(
      "packages/registry/components/registry.json: no items — refusing to report an empty /components gallery",
    );
  }
  const routes = ["/components"];
  for (const folder of folders) routes.push(`/components/${folder}`);
  return routes.sort();
}

// --- blocks: 1 index + one page per group + one page per category, from the
// live pro manifest. This is the section most likely to drift day to day.
// Guards mirror apps/web/lib/pro-manifest.ts's parseManifest (the build-time
// loader for the same manifest, for the same /blocks routes): an empty
// groups array would silently publish an empty /blocks, and an orphan
// category (naming a group id that doesn't exist) would silently emit a
// route the site never serves. Both are reproduced here, not reinvented. ---
async function blocksRoutes() {
  const res = await fetch(PRO_MANIFEST_URL);
  if (!res.ok) {
    throw new Error(`failed to fetch pro manifest: ${res.status} ${res.statusText}`);
  }
  const manifest = await res.json();
  if (!Array.isArray(manifest.groups) || manifest.groups.length === 0) {
    throw new Error("pro manifest: no groups — refusing to report an empty /blocks");
  }
  const groupIds = new Set(manifest.groups.map((group) => group.id));
  for (const category of manifest.categories ?? []) {
    if (!groupIds.has(category.group)) {
      throw new Error(`pro manifest: category "${category.id}" names unknown group "${category.group}"`);
    }
  }
  const routes = ["/blocks"];
  for (const group of manifest.groups) routes.push(`/blocks/${group.id}`);
  for (const category of manifest.categories) {
    routes.push(`/blocks/${category.group}/${category.id}`);
  }
  return routes.sort();
}

// --- standalone: top-level pages that are neither docs, gallery nor blocks ---
// Source: the App Router itself. apps/web/app/page.tsx is "/", and each
// depth-1 directory holding a page.tsx is "/<dir>". Route groups ("(name)"),
// dynamic segments ("[name]", "[[...name]]") and private directories
// ("_name") add no URL segment of their own, and a directory whose "page"
// is a route.ts rather than a page.tsx is a text/JSON endpoint (llms.txt,
// robots.txt, og, …) — this inventory has never counted those and must not
// start now. apps/web/app/docs has no depth-1 page.tsx, so it falls out of
// this scan on its own; docsRoutes() owns it separately.
//
// Two of the remaining directories, "components" and "blocks", are index
// pages of surfaces galleryRoutes()/blocksRoutes() already produce, so they
// must not double-count here. Which two those are is derived from what
// those two functions actually returned — a name is only excluded once the
// route data itself says it owns that directory, and that ownership claim
// is checked against the directories that actually exist on disk. A
// hand-mirrored literal exclusion list is exactly the failure class this
// repo has paid for repeatedly: it agrees with reality right up until one
// side changes and nobody notices.
function ownedSegment(routes, label, candidates) {
  const indexRoute = routes.find((route) => route.split("/").length === 2);
  if (!indexRoute) {
    throw new Error(
      `standaloneRoutes: ${label}Routes() returned no top-level index route among [${routes.join(", ")}]`,
    );
  }
  const segment = indexRoute.slice(1);
  if (!candidates.includes(segment)) {
    throw new Error(
      `standaloneRoutes: ${label}Routes() claims "/${segment}" but apps/web/app/${segment} has no page.tsx — ` +
        "the surfaces have drifted apart, and excluding it here would be fiction.",
    );
  }
  return segment;
}

async function standaloneRoutes(gallery, blocks) {
  const appDir = join(REPO_ROOT, "apps/web/app");
  const entries = await readdir(appDir, { withFileTypes: true });

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const { name } = entry;
    if (/^\(.+\)$/u.test(name) || /^\[.*\]$/u.test(name) || name.startsWith("_")) continue;
    const children = await readdir(join(appDir, name));
    if (!children.includes("page.tsx")) continue;
    candidates.push(name);
  }

  const owned = new Set([
    ownedSegment(gallery, "gallery", candidates),
    ownedSegment(blocks, "blocks", candidates),
  ]);
  const standaloneDirs = candidates.filter((name) => !owned.has(name));

  return ["/", ...standaloneDirs.map((name) => `/${name}`)].sort();
}

export async function buildInventory() {
  const [docs, gallery, blocks] = await Promise.all([docsRoutes(), galleryRoutes(), blocksRoutes()]);
  // standaloneRoutes() needs gallery and blocks in hand to know which
  // directories they already own, so it can't join the Promise.all above.
  const standalone = await standaloneRoutes(gallery, blocks);
  const notFound = ["/404"];

  // standaloneRoutes() only knows to exclude two named surfaces (gallery,
  // blocks). A third top-level surface added later, with its own index page
  // and its own routes function, would land its index route in BOTH
  // standalone and its own array unless someone remembers to add another
  // ownedSegment() call above -- and a comment asking a future author to
  // remember is the hand-mirrored guard this file exists to not have. This
  // is the observable consequence instead: no route may appear in more than
  // one of the five arrays, checked directly, every run.
  const seenIn = new Map(); // route -> the first array name that claimed it
  for (const [name, routes] of Object.entries({ docs, gallery, blocks, standalone, notFound })) {
    for (const route of routes) {
      const firstSeenIn = seenIn.get(route);
      if (firstSeenIn) {
        throw new Error(
          `route-inventory: "${route}" appears in both "${firstSeenIn}" and "${name}" -- the five arrays must be pairwise disjoint.`,
        );
      }
      seenIn.set(route, name);
    }
  }

  const total = docs.length + gallery.length + blocks.length + standalone.length + notFound.length;
  return { docs, gallery, blocks, standalone, notFound, total };
}

async function main() {
  const inventory = await buildInventory();
  process.stdout.write(JSON.stringify(inventory));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
