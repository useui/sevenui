// Where the UI SDK flavour of a demo or gallery example comes from, and whether it has one. Plain Node
// (no "server-only", relative .ts imports) because scripts/build-flavour-map.ts runs it off-graph too.
//
// The contract with packages/registry (docs/superpowers/specs/2026-11-13-ui-sdk-flavour-design.md):
// - an example's flavour source is its overlay, registry/ui-sdk/examples/{demos|components}/<path>, when
//   one exists, else the original file;
// - packages/registry/.generated/ui-sdk/{demos|components}/<path> holds every example's flavour source
//   with its primitive imports already pointed at registry/ui-sdk (git-ignored, generated);
// - packages/registry/ui-sdk-compat.json classifies each example.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type ExampleKind = "demos" | "components";

export const REGISTRY_DIR = path.join(process.cwd(), "../../packages/registry");

/** The generated flavour example tree, relative to packages/registry (and so to the `@/` alias). */
export const GENERATED_TREE = ".generated/ui-sdk";

const OVERLAY_DIR = "registry/ui-sdk/examples";

/** `components/accordion/accordion-01.tsx` → the flavour overlay's path, relative to packages/registry. */
export function overlayPath(kind: ExampleKind, file: string): string {
  return `${OVERLAY_DIR}/${kind}/${file}`;
}

export function hasOverlay(kind: ExampleKind, file: string): boolean {
  return existsSync(path.join(REGISTRY_DIR, overlayPath(kind, file)));
}

/** The registry-relative source file a flavour shows for an example. */
export function exampleSourcePath(kind: ExampleKind, file: string, flavour: "base-ui" | "ui-sdk"): string {
  return flavour === "ui-sdk" && hasOverlay(kind, file) ? overlayPath(kind, file) : `${kind}/${file}`;
}

export type CompatStatus = "ok" | "differs" | "variant" | "unknown";

export interface ExampleCompat {
  status: CompatStatus;
  /** One sentence per recorded difference, as the manifest words it. */
  reasons: string[];
}

type RawEntry = { status?: unknown; reasons?: unknown };

const MANIFEST = "ui-sdk-compat.json";
const STATUSES = new Set(["ok", "differs", "variant"]);

let manifest: Record<string, RawEntry> | undefined;

// Read strictly: the site decides from it which examples get a UI SDK preview and which notes to show, so a
// missing or unreadable manifest must fail the build rather than quietly turn every note off.
// scripts/check-ui-sdk-compat.mjs (`pnpm check:ui-sdk-compat`) keeps it current.
function readManifest(): Record<string, RawEntry> {
  if (manifest) return manifest;
  const file = path.join(REGISTRY_DIR, MANIFEST);
  let raw: { items?: unknown };
  try {
    raw = JSON.parse(readFileSync(file, "utf8")) as { items?: unknown };
  } catch (error) {
    throw new Error(`ui-sdk-examples: cannot read ${file} (run node scripts/check-ui-sdk-compat.mjs --write)`, { cause: error });
  }
  if (!raw.items || typeof raw.items !== "object" || Object.keys(raw.items).length === 0) {
    throw new Error(`ui-sdk-examples: ${file} lists no examples`);
  }
  manifest = raw.items as Record<string, RawEntry>;
  return manifest;
}

/**
 * The compat manifest's verdict on one example. `unknown` means the manifest has no entry for it yet (a new
 * example before `check-ui-sdk-compat --write`); `pnpm check:ui-sdk-compat` fails on that in CI.
 * `key` is `components/<primitive>/<id>` or `demos/<primitive>/<file>` without the extension.
 */
export function exampleCompat(key: string): ExampleCompat {
  const entry = readManifest()[key];
  if (entry === undefined) return { status: "unknown", reasons: [] };
  if (!entry || typeof entry !== "object" || typeof entry.status !== "string" || !STATUSES.has(entry.status)) {
    throw new Error(`ui-sdk-examples: ${MANIFEST} has an unexpected entry for ${key}: ${JSON.stringify(entry)}`);
  }
  const reasons = Array.isArray(entry.reasons)
    ? entry.reasons
        .map((reason) =>
          typeof reason === "string"
            ? reason
            : reason && typeof reason === "object" && typeof (reason as { reason?: unknown }).reason === "string"
              ? (reason as { reason: string }).reason
              : undefined,
        )
        .filter((reason): reason is string => Boolean(reason))
    : [];
  return { status: entry.status as CompatStatus, reasons };
}

/**
 * Whether an example can render on UI SDK: it either needs no variant, or its variant (an overlay) exists.
 * An example that needs a variant nobody has written yet still imports a library UI SDK replaces, so the
 * site shows a note instead of a broken preview.
 */
export function uiSdkAvailable(kind: ExampleKind, file: string): boolean {
  if (hasOverlay(kind, file)) return true;
  return exampleCompat(`${kind}/${file.replace(/\.tsx$/, "")}`).status !== "variant";
}
