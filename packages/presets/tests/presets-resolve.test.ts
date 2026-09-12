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
