#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PRO_MANIFEST_URL = "https://pro.sevenui.dev/r/pro-manifest.json";

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
  const standalone = await standaloneRoutes(gallery, blocks);
  const notFound = ["/404"];

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
