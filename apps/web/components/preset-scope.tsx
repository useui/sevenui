"use client";

import * as React from "react";
import { PRESET_SCOPE_ATTR } from "./preset-scope-attr";

/**
 * The scoped preset applier (task-2.8 brief, §8.4).
 *
 * `@sevenui/presets`'s root export (`index.ts`) re-exports `./apply`, and
 * `apply.ts` states its own rule in its top comment: "Only preview
 * documents may import this module — the site chrome is deliberately never
 * themed." A STATIC top-level import from the package root would drag
 * `apply.ts` into this file's module graph and, transitively, into the
 * root layout's graph the moment anything importing THIS file is ever
 * reached from `app/layout.tsx`. This file never imports the package root
 * at all — see below for why it does not statically import ANY subpath
 * either.
 *
 * ## Why every `@sevenui/presets` import here is a dynamic `import()`,
 * not a top-level one (fix round 2, IMPORTANT 1)
 *
 * `schema.ts`'s first line is `import { z } from "zod"`, executed
 * unconditionally at module load — zod is not behind any lazy branch
 * inside that file. `presets.ts` (the module `resolvePreset`/
 * `isDefaultConfig` live in) itself unconditionally imports `./schema`
 * for `DEFAULT_PRESET_CONFIG` and its types. `packages/presets` is a scope
 * wall (no edits, no `sideEffects` hints, no restructuring), and
 * `resolvePreset` is not optional — reimplementing it in `apps/web` would
 * mean duplicating the ~30 KB of base-color/theme token tables `presets.ts`
 * owns, which is a far worse duplication than anything this file could
 * introduce. So ANY top-level import of `@sevenui/presets/presets` OR
 * `@sevenui/presets/schema` — regardless of which named export is actually
 * used — pulls the zod runtime into whatever bundle imports this file.
 *
 * Measured directly, in that order:
 *  1. Static imports of both subpaths (this file's original shape):
 *     docs-page client JS (first-load only, i.e. eagerly `<script src>`d,
 *     summed as the UNION of chunk files across all 67 docs pages) went
 *     from baseline `836b47b`'s 2,045,043 B raw / 634,838 B gzip to
 *     2,445,184 B / 721,015 B — +86 KB gzip — with a dedicated ~409 KB
 *     chunk whose only library marker was zod.
 *  2. Replacing the SCHEMA import with a hand-written local reader that
 *     only touches `schema.ts`'s zod-free exports (`BASE_COLOR_NAMES`,
 *     `THEME_NAMES`, `RADIUS_NAMES`, `DEFAULT_PRESET_CONFIG` — never
 *     `presetConfigSchema`) did NOT remove the chunk: still ~404 KB,
 *     because `presets.ts`'s own untouchable import of `./schema` pulls
 *     the whole module (including its top-level `z.object(...)` call) in
 *     regardless of what THIS file asks for. A local duplicate schema was
 *     therefore pure downside (a second copy of the accepted values, with
 *     zero bytes saved) and was reverted.
 *  3. Deferring BOTH subpaths behind `import()` inside the effect below —
 *     what this file now does — removes the chunk from the eager/
 *     first-load set entirely: it is not referenced by any `<script src>`
 *     tag or `<link rel="preload"/"modulepreload">` on any docs page,
 *     only fetched on demand when a `PreviewPane` actually mounts. Docs
 *     client JS measured back down to 2,050,450 B / 635,662 B gzip —
 *     within ~5 KB raw / ~0.6 KB gzip of baseline, i.e. genuinely moved
 *     off the number §18 tracks, not merely relocated to a still-eager
 *     chunk under a different name.
 *
 * Trade-off accepted: applying a stored preset now costs one network round
 * trip for this chunk (browser-cached after the first fetch per session),
 * instead of zero. This is exactly the deferred "first-paint flash" cost
 * the task-2.8 review already put on Stage 5's ledger — nothing sets a
 * preset that reaches a docs page today, so no visitor pays this cost yet.
 */

const STYLE_ID = "preset-scope-vars";

// See the top-of-file comment: BOTH subpaths are dynamic, not static, so
// that `schema.ts`'s unconditional zod dependency — reached transitively
// through `presets.ts` too, not just directly — never lands in the eager
// bundle a docs page loads on first paint.
//
// Split from the DOM-touching half on purpose (fix round 3): a mount that
// unmounts before this resolves must be able to bail out AFTER the import
// settles but BEFORE anything below touches `document` or `activeInstances`
// — seeing only a combined "import + touch DOM" async function gives a
// caller nowhere to put that check that isn't already too late.
async function loadPresetModules() {
  const [{ isDefaultConfig, resolvePreset }, { readPresetConfig, PRESET_CONFIG_KEY }] = await Promise.all([
    import("@sevenui/presets/presets"),
    import("@sevenui/presets/schema"),
  ]);
  return { isDefaultConfig, resolvePreset, readPresetConfig, PRESET_CONFIG_KEY };
}

type PresetModules = Awaited<ReturnType<typeof loadPresetModules>>;

function applyScopedPresetCssWith({ isDefaultConfig, resolvePreset, readPresetConfig }: PresetModules): void {
  const config = readPresetConfig(window.localStorage);
  let css: string | null = null;
  if (!isDefaultConfig(config)) {
    const { light, dark } = resolvePreset(config);
    const rule = (selector: string, tokens: Record<string, string>) =>
      `${selector} {\n${Object.entries(tokens)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n")}\n}`;
    // Same shape as `apply.ts`'s own `buildPresetCss`, selectors swapped
    // for an attribute scope (`[data-preset-scope]` /
    // `[data-theme="dark"] [data-preset-scope]`) instead of `:root` /
    // `.dark, [data-theme="dark"]` — `apply.ts` themes an entire preview
    // document; this themes only the `PreviewPane` instance(s) that carry
    // the attribute, since Task 2.6 put demos in the SAME document as the
    // site chrome, which must never be scoped.
    css =
      `${rule(`[${PRESET_SCOPE_ATTR}]`, light)}\n` +
      `${rule(`[data-theme="dark"] [${PRESET_SCOPE_ATTR}]`, dark)}\n`;
  }
  // This `<style>` tag is a plain, top-level element with no `@layer`
  // wrapper — unlayered, matching how the base tokens it overrides are
  // themselves declared in `apps/web/app/globals.css` (the
  // `:root { --background: ...; }` block sits above that file's one
  // `@layer base { ... }`, i.e. it is unlayered too). Layering is not why
  // the override wins, though: `:root` only ever matches `<html>`, and
  // `[data-preset-scope]` only ever matches a `PreviewPane`'s outer div —
  // the two selectors never compete for the same element, so there is no
  // same-element conflict for a cascade layer to resolve either way. The
  // override wins the ordinary way a more specific ancestor declaration
  // wins over an inherited one, regardless of which layer (or no layer)
  // either rule sits in.
  //
  // What actually has to be true for this to work is narrower, and it's a
  // fact about this project's OWN CSS, checked directly against the built
  // output (fix round 2, MINOR 1 — the first check of this claim grepped
  // the wrong directory, `.next/static/css/`, which doesn't exist here;
  // Next emits CSS under `.next/static/chunks/`, and a grep against the
  // real 221,602-byte concatenation tells a narrower story than "no
  // indirection at all"): `apps/web/app/globals.css` declares its Tailwind
  // color tokens inside `@theme inline` blocks (e.g.
  // `--color-background: var(--background);`), and `--color-background`
  // specifically IS resolved away at build time — `.bg-background {
  // background-color: var(--background) }` reads the base token directly,
  // and `var(--color-background)` is read zero times anywhere in the built
  // CSS. But three other `--color-*` tokens do survive into the compiled
  // `@layer theme{:root,:host{...}}` block, and two of those ARE read by
  // real utilities elsewhere in this registry: `border-(--color-border)`
  // (`registry/base/ui/chart.tsx:224`) and
  // `after:bg-(--drawer-bleed-background,var(--color-popover))`
  // (`drawer.tsx:128`). Neither is a live scoping gap today only because
  // both call sites are shadowed by an element-local inline CSS variable
  // at the point of use, not because the indirection doesn't exist — so
  // this scoped override is safe for `--background` specifically (and
  // would need rechecking, not assuming, for any token whose `--color-*`
  // alias a future demo starts reading directly instead of through its
  // shadowed local).
  const existing = document.getElementById(STYLE_ID);
  if (css === null) {
    existing?.remove();
    return;
  }
  const tag = existing ?? document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = css;
  if (!existing) document.head.appendChild(tag);
}

// A page can render many `PreviewPane`s (a docs page can have several demos,
// and Stage 4's gallery will have many more), and every one of them calls
// `usePresetScope()`. All of them target the same singleton `<style>` tag,
// so re-applying is harmless, but only one `storage` listener — and, since
// fix round 2 (MINOR 2), only one `<style>` tag — should exist at a time for
// the whole page. This is reference-counted, not a one-way flag: the first
// call (of possibly many, possibly concurrent, `PreviewPane` instances) to
// finish loading the dynamic import attaches the listener, and the last
// instance to UNMOUNT (e.g. after an App Router client-side navigation to a
// demo-less page) removes the listener AND the `<style>` tag — so a page
// with zero panes left keeps neither a live listener nor a stale style node
// around. A one-way "attached once, never detached" flag was tried first
// and rejected: it left exactly that orphaned listener (and, until this
// round, the orphaned tag too), live for the rest of the session, on every
// subsequent demo-less page.
let activeInstances = 0;
let detachListener: (() => void) | null = null;

/**
 * Reflects whatever preset the `/blocks` customizer last wrote to
 * `localStorage["preset-config"]` into the shared `<style>` tag, and keeps
 * following it via the same native `storage` event `apply.ts` already
 * relies on. Called by `PreviewPane` (`components/demo/preview-pane.tsx`)
 * directly, as a hook — NOT via a separate `<PresetScope />` element —
 * specifically so calling it costs zero extra nodes in the render tree
 * (fix round 1, MINOR 2 — see that file's own comment for why that
 * matters for Base UI's `useId`).
 */
export function usePresetScope(): void {
  React.useEffect(() => {
    let disposed = false;
    let myCleanup: (() => void) | null = null;

    void (async () => {
      // fix round 3: the ONLY thing awaited before the `disposed` check is
      // `loadPresetModules()` — pure module resolution, no `document` touch,
      // no `activeInstances` mutation. A mount that unmounts before this
      // settles hits `disposed` here and returns having touched nothing,
      // so there is nothing for the (never-assigned) cleanup to undo. The
      // previous shape awaited `applyScopedPresetCss()` itself — which
      // ALREADY wrote to `document.head` as part of what was being
      // awaited — so checking `disposed` after it returned was too late:
      // a mount+unmount faster than the chunk fetch could leave the style
      // node orphaned with no cleanup assigned to remove it.
      const mods = await loadPresetModules();
      if (disposed) return;
      applyScopedPresetCssWith(mods);
      activeInstances += 1;
      if (activeInstances === 1) {
        const handler = (event: StorageEvent) => {
          if (event.key === mods.PRESET_CONFIG_KEY || event.key === null) applyScopedPresetCssWith(mods);
        };
        window.addEventListener("storage", handler);
        detachListener = () => window.removeEventListener("storage", handler);
      }
      myCleanup = () => {
        activeInstances -= 1;
        if (activeInstances === 0) {
          detachListener?.();
          detachListener = null;
          document.getElementById(STYLE_ID)?.remove();
        }
      };
    })();

    return () => {
      disposed = true;
      myCleanup?.();
    };
  }, []);
}
