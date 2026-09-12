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
