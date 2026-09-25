import "server-only";

import { BASE_COLORS, THEMES } from "@sevenui/presets/presets";
import {
  BASE_COLOR_NAMES,
  DEFAULT_PRESET_CONFIG,
  PRESET_CONFIG_KEY,
  RADIUS_NAMES,
  THEME_NAMES,
} from "@sevenui/presets/schema";
import type { ReactNode } from "react";
import { CustomizerStateProvider } from "./customizer-state";
import { LazyCustomizerPanel } from "./lazy-customizer-panel";

const themeSwatch = (name: (typeof THEME_NAMES)[number]) => THEMES[name].light.primary ?? BASE_COLORS.neutral.light.primary;

const baseField = (name: (typeof BASE_COLOR_NAMES)[number]) => BASE_COLORS[name].light.muted;
const baseInk = (name: (typeof BASE_COLOR_NAMES)[number]) => BASE_COLORS[name].light.foreground;

const label = (name: string) => name[0].toUpperCase() + name.slice(1);

const RADIUS_LABELS: Record<(typeof RADIUS_NAMES)[number], string> = {
  none: "None",
  small: "SM",
  default: "MD",
  large: "LG",
};

const RADIUS_GLYPH: Record<(typeof RADIUS_NAMES)[number], string> = {
  none: "0px",
  small: "3.6px",
  default: "5px",
  large: "7px",
};

/**
 * Resolves the option swatches on the server so the preset tables stay out of the client bundle,
 * and mounts the page's one customizer panel, loaded only once someone reaches for a trigger.
 */
export function CustomizerProvider({ children }: { children: ReactNode }) {
  return (
    <CustomizerStateProvider
      baseOptions={BASE_COLOR_NAMES.map((name) => ({
        ink: baseInk(name),
        label: label(name),
        swatch: baseField(name),
        value: name,
      }))}
      defaults={DEFAULT_PRESET_CONFIG}
      radiusOptions={RADIUS_NAMES.map((name) => ({
        glyph: RADIUS_GLYPH[name],
        label: RADIUS_LABELS[name],
        value: name,
      }))}
      storageKey={PRESET_CONFIG_KEY}
      themeOptions={THEME_NAMES.map((name) => ({
        label: label(name),
        swatch: themeSwatch(name),
        value: name,
      }))}
    >
      {children}
      <LazyCustomizerPanel />
    </CustomizerStateProvider>
  );
}
