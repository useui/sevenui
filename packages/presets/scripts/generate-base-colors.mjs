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
// - CHART_PIN: upstream's neutral/stone/zinc base colors have drifted to
//   grayscale chart-1..5 values (e.g. oklch(0.87 0 0)) since the spec was
//   written, and they hand light and dark the same five values. gray and slate
//   still return the colorful palette. Two reasons we pin the three drifted
//   ones back to it:
//     1. The spec (docs/superpowers/specs/2026-09-12-theme-customizer-design.md,
//        section 2) requires `neutral` to reproduce today's site values exactly
//        — it's the default base color, so byte parity binds it.
//     2. The grayscale values are unreadable as a categorical palette: zinc's
//        light chart-1 is oklch(0.871 0.006 286.286), all but invisible on
//        white, and since light and dark share the values chart-5 disappears
//        on dark. A base color picks the *neutral* scale; it shouldn't
//        silently turn every chart monochrome.
//   So all five bases now carry the same colorful chart-1..5, which is also
//   what gray and slate already fetch.
// - success/warning are NOT added. They are semantic status colors that mean
//   the same thing under every base color, so they live as constants in
//   theme.css rather than in the preset system. See BASE_TOKEN_KEYS.
const NAMES = ["neutral", "stone", "zinc", "gray", "slate"];
const DROP = new Set(["radius"]);
const EXTRA = { "destructive-foreground": { light: "oklch(0.985 0 0)", dark: "oklch(0.985 0 0)" } };
const CHART_PIN = {
  light: {
    "chart-1": "oklch(0.646 0.222 41.116)",
    "chart-2": "oklch(0.6 0.118 184.704)",
    "chart-3": "oklch(0.398 0.07 227.392)",
    "chart-4": "oklch(0.828 0.189 84.429)",
    "chart-5": "oklch(0.769 0.188 70.08)",
  },
  dark: {
    "chart-1": "oklch(0.488 0.243 264.376)",
    "chart-2": "oklch(0.696 0.17 162.48)",
    "chart-3": "oklch(0.769 0.188 70.08)",
    "chart-4": "oklch(0.627 0.265 303.9)",
    "chart-5": "oklch(0.645 0.246 16.439)",
  },
};
const PER_NAME_OVERRIDES = Object.fromEntries(
  ["neutral", "stone", "zinc"].map((name) => [name, CHART_PIN]),
);

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
      const overrides = PER_NAME_OVERRIDES[name]?.[mode];
      if (overrides) Object.assign(out, overrides);
      return out;
    };
    return [name, { light: pick("light"), dark: pick("dark") }];
  }),
);
process.stdout.write(JSON.stringify(Object.fromEntries(entries), null, 2) + "\n");
