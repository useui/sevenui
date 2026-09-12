# Theme Customizer (public repo side) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "Customize" panel on the `/blocks` gallery that themes every free and pro block preview live (primary color, base color, radius) via `localStorage["preset-config"]` and native `storage` events, without touching the site chrome.

**Architecture:** A new workspace package `@sevenui/presets` holds the zod-validated config contract, hand-authored oklch preset data (shadcn's base-color/theme split), and a DOM applier that writes a runtime `<style id="preset-vars">` tag. Preview documents load the applier; the gallery's Customize panel only writes localStorage. Pro previews become same-origin via a Vercel rewrite so the same storage events reach them.

**Tech Stack:** TypeScript, zod, vitest + jsdom, Astro (Blume), pnpm workspace, Vercel rewrites.

**Spec:** `docs/superpowers/specs/2026-09-12-theme-customizer-design.md` — read it first; every task below argues from it.

## Global Constraints

- Everything in English: code, comments, commit messages, identifiers (AGENTS.md).
- Kebab-case file names.
- Conventional Commits (`type(scope): summary`), imperative mood, no attribution trailers of any kind.
- `packages/registry` is never touched — its layout is the `/r/*.json` byte-parity contract.
- The applier must NEVER be imported by non-preview pages (gallery, docs, landing, account). Site chrome stays unthemed.
- Default config must render byte-identical to today: no `<style>` tag emitted for the default.
- zod stays scoped to `packages/presets`.
- Node >= 22.12, pnpm@12.

## Cross-repo ordering

This plan is Tasks 1–4 (presets package), then Tasks 5–7 (site integration). Between them, the **sevenui-pro plan** (`sevenui-pro/docs/plans/2026-09-12-theme-customizer-pro.md`) must be executed and deployed: it bumps the submodule to pick up `packages/presets` and makes the pro previews apply the config. Tasks 5–7 here go last (spec "Rollout order" steps 3–4).

---

### Task 1: `packages/presets` scaffold + config schema

**Files:**
- Create: `packages/presets/package.json`
- Create: `packages/presets/tsconfig.json`
- Create: `packages/presets/vitest.config.ts`
- Create: `packages/presets/schema.ts`
- Test: `packages/presets/tests/schema.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces (used by every later task):
  - `PRESET_CONFIG_KEY = "preset-config"`
  - `BASE_COLOR_NAMES`, `THEME_NAMES`, `RADIUS_NAMES` (readonly const tuples)
  - `BaseColorName`, `ThemeName`, `RadiusName`, `PresetConfig` types
  - `DEFAULT_PRESET_CONFIG: PresetConfig`
  - `presetConfigSchema` (zod)
  - `readPresetConfig(storage: Pick<Storage, "getItem">): PresetConfig`

- [ ] **Step 1: Scaffold the package**

`packages/presets/package.json`:

```json
{
  "name": "@sevenui/presets",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./schema": "./schema.ts",
    "./presets": "./presets.ts",
    "./apply": "./apply.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "jsdom": "^30.0.1",
    "typescript": "^7.0.2",
    "vitest": "^4.1.11"
  }
}
```

(Exports point at TS source on purpose — every consumer is a bundler: Astro/Vite here, Vite in sevenui-pro. `index.ts` is created in Task 4; that's fine, nothing imports `.` until then.)

`packages/presets/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "verbatimModuleSyntax": true
  },
  "include": ["*.ts", "tests/**/*.ts", "scripts/**/*.mjs"]
}
```

`packages/presets/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
  },
});
```

Run: `pnpm install` (repo root — registers the new workspace package, installs zod).

- [ ] **Step 2: Write the failing tests**

`packages/presets/tests/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_PRESET_CONFIG, readPresetConfig } from "../schema";

const store = (value: string | null) => ({ getItem: () => value });

describe("readPresetConfig", () => {
  it("returns the default when the key is missing", () => {
    expect(readPresetConfig(store(null))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on malformed JSON", () => {
    expect(readPresetConfig(store("{not json"))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on a non-object value", () => {
    expect(readPresetConfig(store('"blue"'))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on an unknown theme name", () => {
    const stored = JSON.stringify({ version: 1, baseColor: "neutral", theme: "hotpink", radius: "default" });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on an unrecognized version", () => {
    const stored = JSON.stringify({ ...DEFAULT_PRESET_CONFIG, version: 2 });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default when a field is missing", () => {
    const stored = JSON.stringify({ version: 1, baseColor: "zinc", theme: "blue" });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns a valid stored config verbatim", () => {
    const config = { version: 1, baseColor: "zinc", theme: "blue", radius: "large" };
    expect(readPresetConfig(store(JSON.stringify(config)))).toEqual(config);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @sevenui/presets test`
Expected: FAIL — cannot resolve `../schema`.

- [ ] **Step 4: Implement `schema.ts`**

```ts
import { z } from "zod";

// The localStorage contract between the /blocks customizer panel and every
// preview document (free previews in this repo, pro previews in sevenui-pro).
// See docs/superpowers/specs/2026-09-12-theme-customizer-design.md.
export const PRESET_CONFIG_KEY = "preset-config";

export const BASE_COLOR_NAMES = ["neutral", "stone", "zinc", "gray", "slate"] as const;
export const THEME_NAMES = ["neutral", "blue", "green", "orange", "red", "rose", "violet", "yellow"] as const;
export const RADIUS_NAMES = ["none", "small", "default", "large"] as const;

export type BaseColorName = (typeof BASE_COLOR_NAMES)[number];
export type ThemeName = (typeof THEME_NAMES)[number];
export type RadiusName = (typeof RADIUS_NAMES)[number];

export const presetConfigSchema = z.object({
  version: z.literal(1),
  baseColor: z.enum(BASE_COLOR_NAMES),
  theme: z.enum(THEME_NAMES),
  radius: z.enum(RADIUS_NAMES),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;

export const DEFAULT_PRESET_CONFIG: PresetConfig = {
  version: 1,
  baseColor: "neutral",
  theme: "neutral",
  radius: "default",
};

// Tolerant read: a preview must never break because of a bad config, so any
// failure (missing key, malformed JSON, unknown value, foreign version)
// yields the default silently.
export function readPresetConfig(storage: Pick<Storage, "getItem">): PresetConfig {
  const raw = storage.getItem(PRESET_CONFIG_KEY);
  if (raw === null) return DEFAULT_PRESET_CONFIG;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_PRESET_CONFIG;
  }
  const result = presetConfigSchema.safeParse(parsed);
  return result.success ? result.data : DEFAULT_PRESET_CONFIG;
}
```

(Check the actual latest zod major before installing; if zod 4's `z.enum` signature differs for readonly tuples, `z.enum([...BASE_COLOR_NAMES])` is the fallback. The tests are the arbiter.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @sevenui/presets test`
Expected: 7 passing.

- [ ] **Step 6: Typecheck and commit**

Run: `pnpm --filter @sevenui/presets typecheck`

```bash
git add packages/presets pnpm-lock.yaml
git commit -m "feat(presets): add preset config schema with tolerant read"
```

---

### Task 2: Preset data — base colors, themes, radius

**Files:**
- Create: `packages/presets/scripts/generate-base-colors.mjs`
- Create: `packages/presets/presets.ts` (data part; merge/CSS functions come in Task 3)
- Test: `packages/presets/tests/presets-data.test.ts`

**Interfaces:**
- Consumes: `BASE_COLOR_NAMES`, `THEME_NAMES`, `RADIUS_NAMES`, types from `schema.ts`.
- Produces:
  - `type TokenMap = Record<string, string>`
  - `BASE_COLORS: Record<BaseColorName, { light: TokenMap; dark: TokenMap }>`
  - `THEMES: Record<ThemeName, { light: TokenMap; dark: TokenMap }>`
  - `RADIUS: Record<RadiusName, string>`
  - `BASE_TOKEN_KEYS: readonly string[]` (the 32-token contract each base color must satisfy)

- [ ] **Step 1: Write the failing structural-invariant tests**

`packages/presets/tests/presets-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BASE_COLOR_NAMES, THEME_NAMES } from "../schema";
import { BASE_COLORS, BASE_TOKEN_KEYS, RADIUS, THEMES } from "../presets";

// Keys a theme overlay must define — always as a complete set, in both
// modes, so primary and primary-foreground can never come from different
// palettes (the contrast guarantee).
const OVERLAY_KEYS = [
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar-primary",
  "sidebar-primary-foreground",
];

describe("BASE_COLORS", () => {
  it("has an entry per schema name and no extras", () => {
    expect(Object.keys(BASE_COLORS).sort()).toEqual([...BASE_COLOR_NAMES].sort());
  });

  it.each([...BASE_COLOR_NAMES])("%s defines the full token set in both modes", (name) => {
    for (const mode of ["light", "dark"] as const) {
      expect(Object.keys(BASE_COLORS[name][mode]).sort()).toEqual([...BASE_TOKEN_KEYS].sort());
    }
  });

  it("neutral reproduces today's default primary", () => {
    expect(BASE_COLORS.neutral.light.primary).toBe("oklch(0.205 0 0)");
    expect(BASE_COLORS.neutral.dark.primary).toBe("oklch(0.922 0 0)");
  });

  it("never contains a radius token (radius is its own field)", () => {
    for (const name of BASE_COLOR_NAMES) {
      expect(BASE_COLORS[name].light).not.toHaveProperty("radius");
      expect(BASE_COLORS[name].dark).not.toHaveProperty("radius");
    }
  });
});

describe("THEMES", () => {
  it("has an entry per schema name and no extras", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_NAMES].sort());
  });

  it("neutral is the empty overlay", () => {
    expect(THEMES.neutral).toEqual({ light: {}, dark: {} });
  });

  it.each([...THEME_NAMES].filter((name) => name !== "neutral"))(
    "%s defines exactly the overlay keys in both modes",
    (name) => {
      for (const mode of ["light", "dark"] as const) {
        expect(Object.keys(THEMES[name][mode]).sort()).toEqual([...OVERLAY_KEYS].sort());
      }
    },
  );
});

describe("RADIUS", () => {
  it("maps every radius name to a CSS length", () => {
    expect(RADIUS).toEqual({ none: "0", small: "0.45rem", default: "0.625rem", large: "0.875rem" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sevenui/presets test tests/presets-data.test.ts`
Expected: FAIL — cannot resolve `../presets`.

- [ ] **Step 3: Add the base-color generation script**

`packages/presets/scripts/generate-base-colors.mjs`:

```js
// Regenerates the BASE_COLORS literal in ../presets.ts from shadcn's
// published base-color registry JSON (the same data ui.shadcn.com/create
// uses). One-time by hand: run and paste the output over the BASE_COLORS
// value. Kept in the repo for provenance and future refresh.
//
//   node packages/presets/scripts/generate-base-colors.mjs
//
// Transformations vs the upstream JSON:
// - `radius` is dropped (radius is its own config field, not a palette token).
// - `destructive-foreground` is added (upstream v4 dropped it; our components
//   and preview.css still define it). Value is today's default in both modes.
const NAMES = ["neutral", "stone", "zinc", "gray", "slate"];
const DROP = new Set(["radius"]);
const EXTRA = { "destructive-foreground": { light: "oklch(0.985 0 0)", dark: "oklch(0.985 0 0)" } };

const entries = await Promise.all(
  NAMES.map(async (name) => {
    const res = await fetch(`https://ui.shadcn.com/r/colors/${name}.json`);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const { cssVarsV4 } = await res.json();
    const pick = (mode) => {
      const out = {};
      for (const [key, value] of Object.entries(cssVarsV4[mode])) {
        if (!DROP.has(key)) out[key] = value;
      }
      for (const [key, value] of Object.entries(EXTRA)) out[key] = value[mode];
      return out;
    };
    return [name, { light: pick("light"), dark: pick("dark") }];
  }),
);
process.stdout.write(JSON.stringify(Object.fromEntries(entries), null, 2) + "\n");
```

Run it, verify the output has all five names and spot-check `neutral.light.primary === "oklch(0.205 0 0)"`.

- [ ] **Step 4: Write `presets.ts` (data)**

Structure (paste the script output as the `BASE_COLORS` literal):

```ts
import type { BaseColorName, RadiusName, ThemeName } from "./schema";

export type TokenMap = Record<string, string>;

// The 32 tokens every base color defines (shadcn v4's base-color set, minus
// radius, plus destructive-foreground — see scripts/generate-base-colors.mjs).
export const BASE_TOKEN_KEYS = [
  "background", "foreground", "card", "card-foreground", "popover",
  "popover-foreground", "primary", "primary-foreground", "secondary",
  "secondary-foreground", "muted", "muted-foreground", "accent",
  "accent-foreground", "destructive", "destructive-foreground", "border",
  "input", "ring", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground", "sidebar-primary",
  "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "sidebar-ring",
] as const;

// Generated by scripts/generate-base-colors.mjs — do not hand-edit values.
export const BASE_COLORS: Record<BaseColorName, { light: TokenMap; dark: TokenMap }> = {
  /* PASTE SCRIPT OUTPUT HERE (five entries: neutral, stone, zinc, gray, slate) */
};

// Hand-authored theme overlays, copied verbatim from shadcn-ui/ui
// apps/v4/registry/themes.ts (cssVars.light/.dark, overlay keys only).
// primary and primary-foreground always travel together per mode — that
// adjacency is the contrast guarantee; there is no runtime contrast math.
export const THEMES: Record<ThemeName, { light: TokenMap; dark: TokenMap }> = {
  neutral: { light: {}, dark: {} },
  blue: {
    light: {
      primary: "oklch(0.488 0.243 264.376)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.809 0.105 251.813)",
      "chart-2": "oklch(0.623 0.214 259.815)",
      "chart-3": "oklch(0.546 0.245 262.881)",
      "chart-4": "oklch(0.488 0.243 264.376)",
      "chart-5": "oklch(0.424 0.199 265.638)",
      "sidebar-primary": "oklch(0.546 0.245 262.881)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
    },
    dark: {
      primary: "oklch(0.424 0.199 265.638)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.809 0.105 251.813)",
      "chart-2": "oklch(0.623 0.214 259.815)",
      "chart-3": "oklch(0.546 0.245 262.881)",
      "chart-4": "oklch(0.488 0.243 264.376)",
      "chart-5": "oklch(0.424 0.199 265.638)",
      "sidebar-primary": "oklch(0.623 0.214 259.815)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
    },
  },
  green: {
    light: {
      primary: "oklch(0.527 0.154 150.069)",
      "primary-foreground": "oklch(0.982 0.018 155.826)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.871 0.15 154.449)",
      "chart-2": "oklch(0.723 0.219 149.579)",
      "chart-3": "oklch(0.627 0.194 149.214)",
      "chart-4": "oklch(0.527 0.154 150.069)",
      "chart-5": "oklch(0.448 0.119 151.328)",
      "sidebar-primary": "oklch(0.627 0.194 149.214)",
      "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)",
    },
    dark: {
      primary: "oklch(0.448 0.119 151.328)",
      "primary-foreground": "oklch(0.982 0.018 155.826)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.871 0.15 154.449)",
      "chart-2": "oklch(0.723 0.219 149.579)",
      "chart-3": "oklch(0.627 0.194 149.214)",
      "chart-4": "oklch(0.527 0.154 150.069)",
      "chart-5": "oklch(0.448 0.119 151.328)",
      "sidebar-primary": "oklch(0.723 0.219 149.579)",
      "sidebar-primary-foreground": "oklch(0.982 0.018 155.826)",
    },
  },
  orange: {
    light: {
      primary: "oklch(0.553 0.195 38.402)",
      "primary-foreground": "oklch(0.98 0.016 73.684)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.837 0.128 66.29)",
      "chart-2": "oklch(0.705 0.213 47.604)",
      "chart-3": "oklch(0.646 0.222 41.116)",
      "chart-4": "oklch(0.553 0.195 38.402)",
      "chart-5": "oklch(0.47 0.157 37.304)",
      "sidebar-primary": "oklch(0.646 0.222 41.116)",
      "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)",
    },
    dark: {
      primary: "oklch(0.47 0.157 37.304)",
      "primary-foreground": "oklch(0.98 0.016 73.684)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.837 0.128 66.29)",
      "chart-2": "oklch(0.705 0.213 47.604)",
      "chart-3": "oklch(0.646 0.222 41.116)",
      "chart-4": "oklch(0.553 0.195 38.402)",
      "chart-5": "oklch(0.47 0.157 37.304)",
      "sidebar-primary": "oklch(0.705 0.213 47.604)",
      "sidebar-primary-foreground": "oklch(0.98 0.016 73.684)",
    },
  },
  red: {
    light: {
      primary: "oklch(0.505 0.213 27.518)",
      "primary-foreground": "oklch(0.971 0.013 17.38)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.808 0.114 19.571)",
      "chart-2": "oklch(0.637 0.237 25.331)",
      "chart-3": "oklch(0.577 0.245 27.325)",
      "chart-4": "oklch(0.505 0.213 27.518)",
      "chart-5": "oklch(0.444 0.177 26.899)",
      "sidebar-primary": "oklch(0.577 0.245 27.325)",
      "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)",
    },
    dark: {
      primary: "oklch(0.444 0.177 26.899)",
      "primary-foreground": "oklch(0.971 0.013 17.38)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.808 0.114 19.571)",
      "chart-2": "oklch(0.637 0.237 25.331)",
      "chart-3": "oklch(0.577 0.245 27.325)",
      "chart-4": "oklch(0.505 0.213 27.518)",
      "chart-5": "oklch(0.444 0.177 26.899)",
      "sidebar-primary": "oklch(0.637 0.237 25.331)",
      "sidebar-primary-foreground": "oklch(0.971 0.013 17.38)",
    },
  },
  rose: {
    light: {
      primary: "oklch(0.514 0.222 16.935)",
      "primary-foreground": "oklch(0.969 0.015 12.422)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.81 0.117 11.638)",
      "chart-2": "oklch(0.645 0.246 16.439)",
      "chart-3": "oklch(0.586 0.253 17.585)",
      "chart-4": "oklch(0.514 0.222 16.935)",
      "chart-5": "oklch(0.455 0.188 13.697)",
      "sidebar-primary": "oklch(0.586 0.253 17.585)",
      "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)",
    },
    dark: {
      primary: "oklch(0.455 0.188 13.697)",
      "primary-foreground": "oklch(0.969 0.015 12.422)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.81 0.117 11.638)",
      "chart-2": "oklch(0.645 0.246 16.439)",
      "chart-3": "oklch(0.586 0.253 17.585)",
      "chart-4": "oklch(0.514 0.222 16.935)",
      "chart-5": "oklch(0.455 0.188 13.697)",
      "sidebar-primary": "oklch(0.645 0.246 16.439)",
      "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)",
    },
  },
  violet: {
    light: {
      primary: "oklch(0.491 0.27 292.581)",
      "primary-foreground": "oklch(0.969 0.016 293.756)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.811 0.111 293.571)",
      "chart-2": "oklch(0.606 0.25 292.717)",
      "chart-3": "oklch(0.541 0.281 293.009)",
      "chart-4": "oklch(0.491 0.27 292.581)",
      "chart-5": "oklch(0.432 0.232 292.759)",
      "sidebar-primary": "oklch(0.541 0.281 293.009)",
      "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)",
    },
    dark: {
      primary: "oklch(0.432 0.232 292.759)",
      "primary-foreground": "oklch(0.969 0.016 293.756)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.811 0.111 293.571)",
      "chart-2": "oklch(0.606 0.25 292.717)",
      "chart-3": "oklch(0.541 0.281 293.009)",
      "chart-4": "oklch(0.491 0.27 292.581)",
      "chart-5": "oklch(0.432 0.232 292.759)",
      "sidebar-primary": "oklch(0.606 0.25 292.717)",
      "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)",
    },
  },
  yellow: {
    light: {
      primary: "oklch(0.852 0.199 91.936)",
      "primary-foreground": "oklch(0.421 0.095 57.708)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      "chart-1": "oklch(0.905 0.182 98.111)",
      "chart-2": "oklch(0.795 0.184 86.047)",
      "chart-3": "oklch(0.681 0.162 75.834)",
      "chart-4": "oklch(0.554 0.135 66.442)",
      "chart-5": "oklch(0.476 0.114 61.907)",
      "sidebar-primary": "oklch(0.681 0.162 75.834)",
      "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)",
    },
    dark: {
      primary: "oklch(0.795 0.184 86.047)",
      "primary-foreground": "oklch(0.421 0.095 57.708)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      "chart-1": "oklch(0.905 0.182 98.111)",
      "chart-2": "oklch(0.795 0.184 86.047)",
      "chart-3": "oklch(0.681 0.162 75.834)",
      "chart-4": "oklch(0.554 0.135 66.442)",
      "chart-5": "oklch(0.476 0.114 61.907)",
      "sidebar-primary": "oklch(0.795 0.184 86.047)",
      "sidebar-primary-foreground": "oklch(0.987 0.026 102.212)",
    },
  },
};

export const RADIUS: Record<RadiusName, string> = {
  none: "0",
  small: "0.45rem",
  default: "0.625rem",
  large: "0.875rem",
};
```

(Upstream's rose dark block carries a stray `sidebar` key — deliberately not copied; the overlay key set is strict and the tests enforce it.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @sevenui/presets test`
Expected: all passing (schema + data invariants). If a base-color test fails on key mismatch, the upstream JSON changed shape — fix the generation script's DROP/EXTRA lists, not the test.

- [ ] **Step 6: Typecheck and commit**

Run: `pnpm --filter @sevenui/presets typecheck`

```bash
git add packages/presets
git commit -m "feat(presets): add hand-authored base color and theme data"
```

---

### Task 3: Merge + CSS emission (`resolvePreset`, `buildPresetCss`)

**Files:**
- Modify: `packages/presets/presets.ts` (append functions)
- Test: `packages/presets/tests/presets-resolve.test.ts`

**Interfaces:**
- Consumes: `BASE_COLORS`, `THEMES`, `RADIUS`, `TokenMap` (Task 2); `PresetConfig`, `DEFAULT_PRESET_CONFIG` (Task 1).
- Produces:
  - `resolvePreset(config: PresetConfig): { light: TokenMap; dark: TokenMap }`
  - `isDefaultConfig(config: PresetConfig): boolean`
  - `buildPresetCss(config: PresetConfig): string | null` — `null` for the default config.

- [ ] **Step 1: Write the failing tests**

`packages/presets/tests/presets-resolve.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "../schema";
import { BASE_COLORS, buildPresetCss, isDefaultConfig, resolvePreset, THEMES } from "../presets";

const config = (overrides: Partial<PresetConfig>): PresetConfig => ({
  ...DEFAULT_PRESET_CONFIG,
  ...overrides,
});

describe("resolvePreset", () => {
  it("lets the theme overlay win over the base color", () => {
    const { light } = resolvePreset(config({ baseColor: "zinc", theme: "blue" }));
    expect(light.primary).toBe(THEMES.blue.light.primary);
    expect(light.background).toBe(BASE_COLORS.zinc.light.background);
  });

  it("keeps the base color's primary for the neutral theme", () => {
    const { light } = resolvePreset(config({ baseColor: "slate" }));
    expect(light.primary).toBe(BASE_COLORS.slate.light.primary);
  });

  it("omits radius for the default step and emits it otherwise", () => {
    expect(resolvePreset(config({ theme: "blue" })).light).not.toHaveProperty("radius");
    const { light, dark } = resolvePreset(config({ radius: "large" }));
    expect(light.radius).toBe("0.875rem");
    expect(dark.radius).toBe("0.875rem");
  });
});

describe("buildPresetCss", () => {
  it("returns null for the default config (byte-identical default render)", () => {
    expect(isDefaultConfig(DEFAULT_PRESET_CONFIG)).toBe(true);
    expect(buildPresetCss(DEFAULT_PRESET_CONFIG)).toBeNull();
  });

  it("emits one :root rule and one dark rule with -- prefixed tokens", () => {
    const css = buildPresetCss(config({ theme: "blue" }));
    expect(css).toContain(":root {");
    expect(css).toContain('.dark, [data-theme="dark"] {');
    expect(css).toContain(`--primary: ${THEMES.blue.light.primary};`);
    expect(css).toContain(`--primary: ${THEMES.blue.dark.primary};`);
  });

  it("emits --radius only when non-default", () => {
    expect(buildPresetCss(config({ theme: "blue" }))).not.toContain("--radius:");
    expect(buildPresetCss(config({ radius: "none" }))).toContain("--radius: 0;");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sevenui/presets test tests/presets-resolve.test.ts`
Expected: FAIL — `resolvePreset` not exported.

- [ ] **Step 3: Append the functions to `presets.ts`**

```ts
import { DEFAULT_PRESET_CONFIG, type PresetConfig } from "./schema";
// (merge into the existing import from "./schema" at the top of the file)

export function resolvePreset(config: PresetConfig): { light: TokenMap; dark: TokenMap } {
  const base = BASE_COLORS[config.baseColor];
  const theme = THEMES[config.theme];
  const radius = config.radius === "default" ? {} : { radius: RADIUS[config.radius] };
  return {
    light: { ...base.light, ...theme.light, ...radius },
    dark: { ...base.dark, ...theme.dark, ...radius },
  };
}

export function isDefaultConfig(config: PresetConfig): boolean {
  return (
    config.baseColor === DEFAULT_PRESET_CONFIG.baseColor &&
    config.theme === DEFAULT_PRESET_CONFIG.theme &&
    config.radius === DEFAULT_PRESET_CONFIG.radius
  );
}

// The dark rule matches both `.dark` (pro workbench, class toggle) and
// `[data-theme="dark"]` (Blume's convention) so one applier serves every
// preview context.
export function buildPresetCss(config: PresetConfig): string | null {
  if (isDefaultConfig(config)) return null;
  const { light, dark } = resolvePreset(config);
  const rule = (selector: string, tokens: TokenMap) =>
    `${selector} {\n${Object.entries(tokens)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n")}\n}`;
  return `${rule(":root", light)}\n${rule('.dark, [data-theme="dark"]', dark)}\n`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @sevenui/presets test`
Expected: all passing.

- [ ] **Step 5: Typecheck and commit**

```bash
pnpm --filter @sevenui/presets typecheck
git add packages/presets
git commit -m "feat(presets): resolve preset config to merged CSS text"
```

---

### Task 4: DOM applier (`apply.ts`), package index, root test wiring

**Files:**
- Create: `packages/presets/apply.ts`
- Create: `packages/presets/index.ts`
- Modify: `package.json` (repo root, `test` script)
- Test: `packages/presets/tests/apply.test.ts`

**Interfaces:**
- Consumes: `buildPresetCss`, `readPresetConfig`, `PRESET_CONFIG_KEY`.
- Produces (what preview documents call — including sevenui-pro):
  - `PRESET_STYLE_ID = "preset-vars"`
  - `applyPresetConfig(doc?: Document): void`
  - `watchPresetConfig(doc?: Document): void` — apply once + re-apply on `storage` events.
  - `index.ts` re-exports everything from `schema.ts`, `presets.ts`, `apply.ts`.

- [ ] **Step 1: Write the failing tests**

`packages/presets/tests/apply.test.ts` (jsdom environment — `document`/`localStorage` are real):

```ts
import { afterEach, describe, expect, it } from "vitest";
import { PRESET_CONFIG_KEY } from "../schema";
import { applyPresetConfig, PRESET_STYLE_ID, watchPresetConfig } from "../apply";

const setConfig = (value: object) => localStorage.setItem(PRESET_CONFIG_KEY, JSON.stringify(value));
const styleTag = () => document.getElementById(PRESET_STYLE_ID);

afterEach(() => {
  localStorage.clear();
  styleTag()?.remove();
});

describe("applyPresetConfig", () => {
  it("writes a style tag for a non-default config", () => {
    setConfig({ version: 1, baseColor: "neutral", theme: "blue", radius: "default" });
    applyPresetConfig(document);
    expect(styleTag()?.textContent).toContain("--primary: oklch(0.488 0.243 264.376);");
  });

  it("removes the style tag for the default config", () => {
    setConfig({ version: 1, baseColor: "neutral", theme: "blue", radius: "default" });
    applyPresetConfig(document);
    expect(styleTag()).not.toBeNull();
    localStorage.removeItem(PRESET_CONFIG_KEY);
    applyPresetConfig(document);
    expect(styleTag()).toBeNull();
  });

  it("renders the default (no tag) on a corrupt config", () => {
    localStorage.setItem(PRESET_CONFIG_KEY, "{corrupt");
    applyPresetConfig(document);
    expect(styleTag()).toBeNull();
  });

  it("reuses a single tag on repeat application", () => {
    setConfig({ version: 1, baseColor: "neutral", theme: "blue", radius: "default" });
    applyPresetConfig(document);
    applyPresetConfig(document);
    expect(document.querySelectorAll(`#${PRESET_STYLE_ID}`)).toHaveLength(1);
  });
});

describe("watchPresetConfig", () => {
  it("applies immediately and re-applies on a storage event for the key", () => {
    watchPresetConfig(document);
    expect(styleTag()).toBeNull();
    setConfig({ version: 1, baseColor: "neutral", theme: "green", radius: "default" });
    window.dispatchEvent(new StorageEvent("storage", { key: PRESET_CONFIG_KEY }));
    expect(styleTag()?.textContent).toContain("--primary: oklch(0.527 0.154 150.069);");
  });

  it("re-applies on a null-key event (localStorage.clear)", () => {
    setConfig({ version: 1, baseColor: "neutral", theme: "green", radius: "default" });
    watchPresetConfig(document);
    expect(styleTag()).not.toBeNull();
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(styleTag()).toBeNull();
  });

  it("ignores storage events for other keys", () => {
    watchPresetConfig(document);
    setConfig({ version: 1, baseColor: "neutral", theme: "green", radius: "default" });
    window.dispatchEvent(new StorageEvent("storage", { key: "blume-theme" }));
    expect(styleTag()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @sevenui/presets test tests/apply.test.ts`
Expected: FAIL — cannot resolve `../apply`.

- [ ] **Step 3: Implement `apply.ts` and `index.ts`**

`packages/presets/apply.ts`:

```ts
import { buildPresetCss } from "./presets";
import { PRESET_CONFIG_KEY, readPresetConfig } from "./schema";

export const PRESET_STYLE_ID = "preset-vars";

// Reads localStorage["preset-config"] and reflects it as a <style> tag in
// <head>. Only preview documents may import this module — the site chrome
// (gallery, docs, landing, account) is deliberately never themed.
export function applyPresetConfig(doc: Document = document): void {
  const win = doc.defaultView;
  if (!win) return;
  const css = buildPresetCss(readPresetConfig(win.localStorage));
  const existing = doc.getElementById(PRESET_STYLE_ID);
  if (css === null) {
    existing?.remove();
    return;
  }
  const tag = existing ?? doc.createElement("style");
  tag.id = PRESET_STYLE_ID;
  tag.textContent = css;
  if (!existing) doc.head.appendChild(tag);
}

// Apply once, then follow cross-document changes. The native storage event
// fires in every OTHER same-origin document when the customizer panel
// writes the key — the same mechanism the blocks gallery already uses for
// blume-theme dark-mode sync. key === null means localStorage.clear().
export function watchPresetConfig(doc: Document = document): void {
  applyPresetConfig(doc);
  doc.defaultView?.addEventListener("storage", (event) => {
    if (event.key === PRESET_CONFIG_KEY || event.key === null) applyPresetConfig(doc);
  });
}
```

`packages/presets/index.ts`:

```ts
export * from "./schema";
export * from "./presets";
export * from "./apply";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @sevenui/presets test`
Expected: all passing.

- [ ] **Step 5: Wire the package into the root test script**

In the root `package.json`, change:

```json
"test": "pnpm --filter @sevenui/registry test",
```

to:

```json
"test": "pnpm --filter @sevenui/registry test && pnpm --filter @sevenui/presets test",
```

Run: `pnpm test` (repo root)
Expected: registry suite and presets suite both pass.

- [ ] **Step 6: Typecheck everything and commit**

```bash
pnpm typecheck
git add packages/presets package.json
git commit -m "feat(presets): add DOM applier with storage-event sync"
```

**Checkpoint:** Tasks 1–4 are spec rollout step 1 — pure addition, deployable on its own. Merge/push here, then execute the sevenui-pro plan (its submodule bump needs these commits on `main`) before continuing with Task 5.

---

### Task 5: Serve pro previews same-origin

**Files:**
- Modify: `apps/web/vercel.json`
- Modify: `apps/web/pages/blocks/index.astro` (the pro-cards template string, around line 117)

**Interfaces:**
- Consumes: the deployed pro.sevenui.dev static preview build (unchanged URLs, `/previews/...` namespace).
- Produces: pro preview iframes on the sevenui.dev origin — the transport every later task assumes.

**Precondition:** the sevenui-pro plan is deployed (pro previews already carry the applier and the blume-theme sync), per the spec's rollout order. The rewrite itself is also safe to ship earlier — it changes the origin, not the content.

- [ ] **Step 1: Add the rewrite**

In `apps/web/vercel.json`, add to the existing `rewrites` array:

```json
{ "source": "/previews/:path*", "destination": "https://pro.sevenui.dev/previews/:path*" }
```

The pro build namespaces pages and assets under `/previews/` (Vite `base: "/previews/"`), so this one rule covers both.

- [ ] **Step 2: Point the pro iframes at the same-origin path**

In `apps/web/pages/blocks/index.astro`, in the `renderProBlocks` template, change:

```html
<iframe src="https://pro.sevenui.dev/previews/${item.name}/" ...>
```

to:

```html
<iframe src="/previews/${item.name}/" ...>
```

- [ ] **Step 3: Verify**

- `pnpm typecheck` (root) — clean.
- `pnpm build` (root) — clean.
- Local dev note: `/previews/*` does not resolve under `blume dev` (rewrites are Vercel-level) — expected; the pro section is hidden in dev anyway because the manifest fetch fails. Full verification happens on a Vercel preview deployment: pro cards render, and toggling the site theme now flips the pro iframes live (the previously broken dark-mode sync).

- [ ] **Step 4: Commit**

```bash
git add apps/web/vercel.json apps/web/pages/blocks/index.astro
git commit -m "feat(web): serve pro previews same-origin via rewrite

Pro preview iframes could not see localStorage on the pro.sevenui.dev
origin, so the site's theme toggle never reached them. Same-origin also
carries the upcoming preset-config customizer to pro frames for free."
```

---

### Task 6: Apply presets in the free preview route

**Files:**
- Modify: `apps/web/package.json` (add dependency)
- Modify: `apps/web/pages/blocks/preview/[slug].astro`

**Interfaces:**
- Consumes: `watchPresetConfig` from `@sevenui/presets/apply`.
- Produces: free preview documents that re-theme live on `preset-config` changes.

- [ ] **Step 1: Add the workspace dependency**

In `apps/web/package.json` `dependencies`:

```json
"@sevenui/presets": "workspace:*",
```

Run: `pnpm install`

- [ ] **Step 2: Load the applier in the preview route**

In `apps/web/pages/blocks/preview/[slug].astro`, after the existing inline blume-theme sync `<script data-mode=... is:inline>` block, add a separate bundled module script:

```astro
<script>
  // Preset customizer hookup — preview documents only (site chrome is
  // deliberately never themed). Applies localStorage["preset-config"] and
  // follows the customizer panel live via native storage events, exactly
  // like the blume-theme sync script above. The preset CSS defines values
  // for both modes; the data-theme attribute picks which set applies, so
  // the two mechanisms compose.
  import { watchPresetConfig } from "@sevenui/presets/apply";
  watchPresetConfig();
</script>
```

(No `is:inline` — this one must be bundled so the import resolves.)

- [ ] **Step 3: Verify in dev**

Run: `pnpm dev`, open `http://localhost:<port>/blocks/preview/login-01`.
In the browser console:

```js
localStorage.setItem("preset-config", JSON.stringify({ version: 1, baseColor: "zinc", theme: "blue", radius: "large" }));
```

Reload → the login card's primary button is blue, radius larger, `<style id="preset-vars">` present in `<head>`. Then from a second same-origin tab run the same `setItem` with `"theme": "green"` — the first tab (or an embedding gallery page's iframe) updates without reload. `localStorage.removeItem("preset-config")` from the second tab reverts to default and removes the tag.

Also open `/blocks` and confirm the gallery chrome (header, sidebar) did NOT change while the free preview iframes did.

- [ ] **Step 4: Typecheck, build, commit**

```bash
pnpm typecheck && pnpm build
git add apps/web/package.json pnpm-lock.yaml "apps/web/pages/blocks/preview/[slug].astro"
git commit -m "feat(web): apply preset customizer config in free block previews"
```

---

### Task 7: Customize panel on the /blocks pages

**Files:**
- Create: `apps/web/components/blocks-customizer.astro`
- Modify: `apps/web/components/blocks-sidebar.astro`

**Interfaces:**
- Consumes: `BASE_COLOR_NAMES`, `RADIUS_NAMES`, `THEME_NAMES`, `PRESET_CONFIG_KEY`, `readPresetConfig`, `DEFAULT_PRESET_CONFIG` from `@sevenui/presets/schema`; `BASE_COLORS`, `THEMES` from `@sevenui/presets/presets`.
- Produces: the user-facing customizer. Writes `localStorage["preset-config"]`; open preview iframes react via storage events (Task 6 + the pro plan).

- [ ] **Step 1: Create the panel component**

`apps/web/components/blocks-customizer.astro`:

```astro
---
// Global theme customizer for the /blocks gallery. Its ONLY side effect is
// writing localStorage["preset-config"] (Reset removes the key); every open
// preview iframe — free and pro, all same-origin — re-themes via the native
// storage event. The gallery page itself never loads the preset applier, so
// the site chrome stays untouched by design.
// Spec: docs/superpowers/specs/2026-09-12-theme-customizer-design.md
import { BASE_COLOR_NAMES, RADIUS_NAMES, THEME_NAMES } from "@sevenui/presets/schema";
import { BASE_COLORS, THEMES } from "@sevenui/presets/presets";

// Swatch colors are resolved at build time from the preset data; the
// neutral theme has an empty overlay, so it falls back to the default
// base color's own primary.
const themeSwatch = (name: (typeof THEME_NAMES)[number]) =>
  THEMES[name].light.primary ?? BASE_COLORS.neutral.light.primary;
const baseSwatch = (name: (typeof BASE_COLOR_NAMES)[number]) =>
  BASE_COLORS[name].light.foreground;
const RADIUS_LABELS: Record<(typeof RADIUS_NAMES)[number], string> = {
  none: "None",
  small: "SM",
  default: "MD",
  large: "LG",
};
---

<section data-customizer class="mt-8 border-t border-border pt-6">
  <h2 class="text-sm font-medium">Customize</h2>
  <p class="mt-1 text-xs text-muted-foreground">Preview every block in your theme.</p>

  <fieldset class="mt-4">
    <legend class="text-xs font-medium text-muted-foreground">Theme</legend>
    <div class="mt-2 flex flex-wrap gap-1.5">
      {THEME_NAMES.map((name) => (
        <button
          type="button"
          data-field="theme"
          data-value={name}
          title={name}
          aria-pressed="false"
          class="size-5 rounded-full border border-border aria-pressed:ring-2 aria-pressed:ring-ring aria-pressed:ring-offset-1"
          style={`background:${themeSwatch(name)}`}
        >
          <span class="sr-only">{name}</span>
        </button>
      ))}
    </div>
  </fieldset>

  <fieldset class="mt-4">
    <legend class="text-xs font-medium text-muted-foreground">Base color</legend>
    <div class="mt-2 flex flex-wrap gap-1.5">
      {BASE_COLOR_NAMES.map((name) => (
        <button
          type="button"
          data-field="baseColor"
          data-value={name}
          title={name}
          aria-pressed="false"
          class="size-5 rounded-full border border-border aria-pressed:ring-2 aria-pressed:ring-ring aria-pressed:ring-offset-1"
          style={`background:${baseSwatch(name)}`}
        >
          <span class="sr-only">{name}</span>
        </button>
      ))}
    </div>
  </fieldset>

  <fieldset class="mt-4">
    <legend class="text-xs font-medium text-muted-foreground">Radius</legend>
    <div class="mt-2 flex gap-1">
      {RADIUS_NAMES.map((name) => (
        <button
          type="button"
          data-field="radius"
          data-value={name}
          aria-pressed="false"
          class="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
        >
          {RADIUS_LABELS[name]}
        </button>
      ))}
    </div>
  </fieldset>

  <button
    type="button"
    data-action="reset"
    class="mt-4 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
  >
    Reset
  </button>
</section>

<script>
  import { PRESET_CONFIG_KEY, readPresetConfig } from "@sevenui/presets/schema";

  // One panel instance per page (the sidebar renders it once). Buttons carry
  // data-field/data-value; clicks merge into the stored config. The panel's
  // own page never re-themes (no applier here) — only pressed states update.
  const panel = document.querySelector<HTMLElement>("[data-customizer]");
  if (panel) {
    const buttons = panel.querySelectorAll<HTMLButtonElement>("button[data-field]");
    const sync = () => {
      const config = readPresetConfig(localStorage) as unknown as Record<string, string>;
      for (const button of buttons) {
        button.setAttribute(
          "aria-pressed",
          String(config[button.dataset.field!] === button.dataset.value),
        );
      }
    };
    panel.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!button) return;
      if (button.dataset.action === "reset") {
        localStorage.removeItem(PRESET_CONFIG_KEY);
      } else if (button.dataset.field && button.dataset.value) {
        const next = { ...readPresetConfig(localStorage), [button.dataset.field]: button.dataset.value };
        localStorage.setItem(PRESET_CONFIG_KEY, JSON.stringify(next));
      } else {
        return;
      }
      sync();
    });
    sync();
  }
</script>
```

- [ ] **Step 2: Render it in the sidebar**

In `apps/web/components/blocks-sidebar.astro`: import it in the frontmatter —

```ts
import BlocksCustomizer from "./blocks-customizer.astro";
```

— and render `<BlocksCustomizer />` once, as the last child of the sidebar's outer `<div>` (after the `lg:block` nav), so it appears on the directory, group, and category pages at every breakpoint.

- [ ] **Step 3: Verify in dev**

Run: `pnpm dev`, open `/blocks/auth/login` (any category page with previews):
- Pick the blue theme swatch → every free preview iframe on the page turns blue live, no reload; the page's own header/sidebar/buttons do not change.
- Pick base color + radius → previews follow; pressed states track the selection.
- Navigate to another category → panel shows the persisted selection; previews arrive already themed.
- Reset → previews revert to default; `localStorage` no longer has `preset-config`.
- Toggle site dark mode → previews show the theme's dark values.

- [ ] **Step 4: Typecheck, build, commit**

```bash
pnpm typecheck && pnpm build
git add apps/web/components/blocks-customizer.astro apps/web/components/blocks-sidebar.astro
git commit -m "feat(web): add theme customizer panel to the blocks gallery"
```

---

### Task 8: End-to-end verification (deployed)

**Files:** none (verification only).

- [ ] **Step 1: Full local gate**

Run: `pnpm typecheck && pnpm check:registry && pnpm test && pnpm build` — all green.

- [ ] **Step 2: Manual checklist on a Vercel preview/production deployment**

(From the spec's manual verification checklist; needs the sevenui-pro plan deployed.)

- `/blocks` with pro cards visible: change theme/base/radius → free AND pro iframes update live, no reload.
- Dark toggle both orders: customize→toggle and toggle→customize.
- Site chrome check: `/account`, `/docs/*`, landing unaffected while a custom theme is active.
- Corrupt the key by hand (`localStorage.setItem("preset-config", "junk")`) → previews render default, console clean.
- Direct visit to `/blocks/preview/login-01` and `/previews/dashboard-01/` shows the customized theme (expected: preview surfaces).

- [ ] **Step 3: Report**

No commit. Report any failures against the relevant task instead of patching ad hoc.
