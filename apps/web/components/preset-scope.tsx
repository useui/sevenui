"use client";

import * as React from "react";
import { PRESET_CHANGE_EVENT, PRESET_SCOPE_ATTR } from "./preset-scope-attr";

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

/**
 * Base UI portals popups to <body>, outside the preview that opened them, so a select's popup or a
 * dialog would keep the site's own tokens while its trigger follows the preset. A portal carries
 * nothing that names its origin, but whatever opened it was just pointed at, pressed or focused:
 * if the latest of those landed inside a scope, the node that appears on <body> belongs to that
 * preview and is given the scope attribute. Only Base UI's own portal nodes are ever marked, so
 * nothing else that lands on <body> can pull the site chrome into the preset. A popup opened from inside such a popup (a select in
 * a dialog) is covered by the same rule. The site's own popups open from the chrome, so they stay
 * unthemed.
 */
const PORTAL = "[data-base-ui-portal]";

function followPortals(): () => void {
  let origin: EventTarget | null = null;
  const track = (event: Event) => {
    origin = event.target;
  };
  const events = ["pointerover", "pointerdown", "focusin", "keydown"] as const;
  for (const name of events) document.addEventListener(name, track, { capture: true, passive: true });

  const fromPreview = () =>
    origin instanceof Element && origin.isConnected && origin.closest(`[${PRESET_SCOPE_ATTR}]`) !== null;

  // A portal that mounts before anyone has touched the page (a toast viewport) has no origin yet.
  // It is watched instead, and claimed when something first appears in it from a preview.
  const late = new MutationObserver((records) => {
    if (!fromPreview()) return;
    for (const record of records) {
      const portal = record.target instanceof Element ? record.target.closest(PORTAL) : null;
      portal?.setAttribute(PRESET_SCOPE_ATTR, "");
    }
  });

  const adopt = (node: Node) => {
    if (!(node instanceof HTMLElement) || !node.matches(PORTAL) || node.hasAttribute(PRESET_SCOPE_ATTR)) return;
    if (fromPreview()) node.setAttribute(PRESET_SCOPE_ATTR, "");
    else late.observe(node, { childList: true, subtree: true });
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(adopt);
  });
  observer.observe(document.body, { childList: true });
  // Portals that were on the page before the first preview mounted.
  for (const node of document.body.children) adopt(node);

  return () => {
    for (const name of events) document.removeEventListener(name, track, { capture: true });
    observer.disconnect();
    late.disconnect();
  };
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
        const onChange = () => applyScopedPresetCssWith(mods);
        window.addEventListener("storage", handler);
        window.addEventListener(PRESET_CHANGE_EVENT, onChange);
        const unfollow = followPortals();
        detachListener = () => {
          unfollow();
          window.removeEventListener("storage", handler);
          window.removeEventListener(PRESET_CHANGE_EVENT, onChange);
        };
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
