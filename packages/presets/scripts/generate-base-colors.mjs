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
