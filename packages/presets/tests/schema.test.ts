// @ts-ignore - vitest types available at runtime
import { describe, expect, it } from "vitest";
import { DEFAULT_PRESET_CONFIG, readPresetConfig } from "../schema";

const store = (value: string | null) => ({ getItem: () => value });

describe("readPresetConfig", () => {
  it("returns the default when the key is missing", () => {
    expect(readPresetConfig(store(null))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on malformed JSON", () => {
    expect(readPresetConfig(store("{not json"))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on a non-object value", () => {
    expect(readPresetConfig(store('"blue"'))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on an unknown theme name", () => {
    const stored = JSON.stringify({ version: 1, baseColor: "neutral", theme: "hotpink", radius: "default" });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default on an unrecognized version", () => {
    const stored = JSON.stringify({ ...DEFAULT_PRESET_CONFIG, version: 2 });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns the default when a field is missing", () => {
    const stored = JSON.stringify({ version: 1, baseColor: "zinc", theme: "blue" });
    expect(readPresetConfig(store(stored))).toEqual(DEFAULT_PRESET_CONFIG);
  });

  it("returns a valid stored config verbatim", () => {
    const config = { version: 1, baseColor: "zinc", theme: "blue", radius: "large" };
    expect(readPresetConfig(store(JSON.stringify(config)))).toEqual(config);
  });
});
