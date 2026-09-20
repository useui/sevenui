import "server-only";

import { BASE_COLORS, THEMES } from "@sevenui/presets/presets";
import {
  BASE_COLOR_NAMES,
  DEFAULT_PRESET_CONFIG,
  PRESET_CONFIG_KEY,
  RADIUS_NAMES,
  THEME_NAMES,
} from "@sevenui/presets/schema";
import { ThemeDockControls } from "./theme-dock-controls";

/**
 * The theme customizer for the /blocks gallery — "the dock", ported from
 * `legacy-components/blocks-theme-dock.astro`.
 *
 * Its ONLY side effect is writing `localStorage["preset-config"]` (Reset
 * removes the key); every open preview iframe — free and pro, all same-origin
 * — re-themes via the native storage event. The gallery page itself never
 * loads the preset applier, so the site chrome stays untouched by design.
 * Spec: `docs/superpowers/specs/2026-09-12-theme-customizer-design.md`.
 *
 * WHY THIS FILE IS A SERVER COMPONENT AND `theme-dock-controls.tsx` IS NOT.
 * The Astro source reached for `@sevenui/presets` twice — once in its
 * frontmatter (to resolve swatch colours while building) and once in its
 * client script (for the reader, the storage key and the defaults). In Astro
 * both were free. Here only the first one is: a module-level import of
 * `@sevenui/presets/schema` from a `"use client"` file drags the zod runtime
 * into the browser bundle — measured at +86 KB gzip on the docs pages, see
 * `components/preset-scope.tsx`'s header for the three measurements. So this
 * half keeps the ordinary imports above (they cost nothing on the server) and
 * hands everything the browser needs across as plain, serializable props.
 *
 * Everything below is exactly what the frontmatter computed, and the resolved
 * colours still travel with the option that owns them: the swatch a theme key
 * paints itself with and the colour the rail's cap wears are one and the same
 * value, so the collapsed rail can echo the pressed key without ever asking
 * the DOM what colour it ended up being (the source used to copy the style
 * declaration across for the same reason — a `getComputedStyle` there would
 * flush layout on every click).
 *
 * The wrapper and the spacer are here rather than in the client half because
 * neither one ever changes: they are placement, not state.
 *
 * EXACTLY ONE INSTANCE PER PAGE. The three /blocks pages render it; the
 * sidebar, which is navigation only, must never. Two instances would both
 * write the same storage key while showing two independent pressed states.
 */

// Swatch colours are resolved while building from the preset data; the neutral
// theme has an empty overlay, so it falls back to the default base colour's
// own primary.
const themeSwatch = (name: (typeof THEME_NAMES)[number]) => THEMES[name].light.primary ?? BASE_COLORS.neutral.light.primary;

// A base colour is not a single value — neutral/stone/zinc/gray/slate differ
// by as little as 0.005 chroma, so one dot per base is undiscriminable (the
// defect this design exists to fix). Each key instead renders that base's real
// `muted` field under its real `foreground` label, and the five keys abut with
// no separator so simultaneous contrast at the shared edge exposes the tint
// that an isolated swatch hides. The name carries the identification; the tint
// corroborates it.
const baseField = (name: (typeof BASE_COLOR_NAMES)[number]) => BASE_COLORS[name].light.muted;
const baseInk = (name: (typeof BASE_COLOR_NAMES)[number]) => BASE_COLORS[name].light.foreground;

const label = (name: string) => name[0].toUpperCase() + name.slice(1);

const RADIUS_LABELS: Record<(typeof RADIUS_NAMES)[number], string> = {
  none: "None",
  small: "SM",
  default: "MD",
  large: "LG",
};

// The corner the glyph draws, scaled to its 11px box. Not an icon — a diagram
// of the value the key sets, so Radius reads without resolving an abstraction.
const RADIUS_GLYPH: Record<(typeof RADIUS_NAMES)[number], string> = {
  none: "0px",
  small: "3.6px",
  default: "5px",
  large: "7px",
};

export function ThemeDock() {
  return (
    <>
      {/* `sticky` (not the viewport-pinned alternative) is load-bearing: it is
          a positioning context for the absolutely positioned dock below, its h-0
          reserves no space, and it releases at the end of the content column
          so the dock can never sit over the footer. Three reasons it is not
          pinned to the viewport instead: this aligns with the h1's gutter for
          free (no hardcoded 300px offset that would have to track the
          sidebar's width), it releases at the end of the column, and it
          sidesteps viewport-pinning's sensitivity to a transformed, filtered
          or contained ancestor. The left inset matches the column's own
          px-6/lg:px-10, so the rail lines up with the h1 without hardcoding
          the sidebar's width. */}
      <div className="pointer-events-none sticky bottom-6 z-40 h-0">
        <ThemeDockControls
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
        />
      </div>
      {/* Released from its stuck position, the wrapper's natural place is the
          column's last pixel — which is the footer's top edge, so the rail
          ended up welded to it. This spacer is what the dock comes to rest
          above. */}
      <div aria-hidden="true" className="h-8" />
    </>
  );
}
