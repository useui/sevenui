#!/usr/bin/env node
import { icons } from "lucide-react";
import { parseManifest } from "../apps/web/lib/pro-manifest-schema.ts";

const LIVE_URL = "https://pro.sevenui.dev/r/pro-manifest.json";
const source = process.argv[2] ?? process.env.CHECK_PRO_MANIFEST_SOURCE ?? LIVE_URL;

async function loadRaw(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) {
      throw new Error(`fetch failed (${res.status} ${res.statusText}) from ${src}`);
    }
    return res.json();
  }
  const { readFileSync } = await import("node:fs");
  return JSON.parse(readFileSync(src, "utf8"));
}

async function main() {
  console.log(`checking pro manifest from ${source}`);
  const raw = await loadRaw(source);
  parseManifest(raw, (pascalKey) => pascalKey in icons);
  console.log("pro manifest OK: groups/categories/items validated, all icon keys resolve.");
}

main().catch((err) => {
  console.error(`pro manifest canary FAILED: ${err.message}`);
  process.exit(1);
});
