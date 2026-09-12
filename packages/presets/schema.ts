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
