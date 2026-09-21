"use client";

import * as React from "react";
import { PRESET_SCOPE_ATTR } from "./preset-scope-attr";

const STYLE_ID = "preset-scope-vars";

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
    css =
      `${rule(`[${PRESET_SCOPE_ATTR}]`, light)}\n` +
      `${rule(`[data-theme="dark"] [${PRESET_SCOPE_ATTR}]`, dark)}\n`;
  }
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

let activeInstances = 0;
let detachListener: (() => void) | null = null;

export function usePresetScope(): void {
  React.useEffect(() => {
    let disposed = false;
    let myCleanup: (() => void) | null = null;

    void (async () => {
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
