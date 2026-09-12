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
