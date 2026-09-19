#!/usr/bin/env node
// §17.1's route inventory. Derived from the repo plus the live pro manifest —
// never a checked-in list. The `/blocks` count moved from 16 to 18 during the
// spec effort; freezing this list would rot the moment pro ships another
// category, which is exactly the property this migration exists to preserve.
//
// Usage: node scripts/route-inventory.mjs
import { readdir } from "node:fs/promises";
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
// Pre-migration source: apps/web/legacy-pages/components/*.astro. Stage 4 moves
// this into the Next.js app; when it does, this function's source directory is
// what needs to change, not the count it produces.
async function galleryRoutes() {
  const galleryDir = join(REPO_ROOT, "apps/web/legacy-pages/components");
  const entries = await readdir(galleryDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".astro"))
    .map((entry) => entry.name.replace(/\.astro$/u, ""))
    .map((name) => (name === "index" ? "/components" : `/components/${name}`))
    .sort();
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
// Pre-migration source, same as galleryRoutes() above: apps/web/legacy-pages
// is quarantined ahead of removal. When it goes, this function's source
// directory must move with it — not just galleryRoutes()'s.
async function standaloneRoutes() {
  const legacyPagesDir = join(REPO_ROOT, "apps/web/legacy-pages");
  const entries = await readdir(legacyPagesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".astro"))
    .map((entry) => entry.name.replace(/\.astro$/u, ""))
    .map((name) => (name === "index" ? "/" : `/${name}`))
    .sort();
}

export async function buildInventory() {
  const [docs, gallery, blocks, standalone] = await Promise.all([
    docsRoutes(),
    galleryRoutes(),
    blocksRoutes(),
    standaloneRoutes(),
  ]);
  const notFound = ["/404"];
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
