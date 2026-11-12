import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const flavourUi = path.join(root, "registry/ui-sdk/ui");
const testsDir = path.join(root, "tests");

// Same rule as REPLACED_IMPORT in scripts/ui-sdk-flavour.mjs: a flavour file
// is ported once it imports nothing UI SDK replaces.
const REPLACED_IMPORT =
  /from\s+["'](@base-ui\/react|react-day-picker|embla-carousel-react|react-resizable-panels)(?:\/[^"']*)?["']/;
const importsReplaced = (file: string) => REPLACED_IMPORT.test(fs.readFileSync(file, "utf8"));
const ported = new Set(
  fs
    .readdirSync(flavourUi)
    .filter((f) => f.endsWith(".tsx") && !importsReplaced(path.join(flavourUi, f)))
    .map((f) => f.replace(/\.tsx$/, "")),
);

// The flavour run reuses the base suite: a test file joins it once every
// primitive it imports is ported, so no file mixes Base UI and UI SDK parts.
const flavourTests = fs
  .readdirSync(testsDir)
  .filter((f) => /\.test\.tsx?$/.test(f))
  .filter((f) => {
    const source = fs.readFileSync(path.join(testsDir, f), "utf8");
    const used = [...source.matchAll(/@\/registry\/base\/ui\/([a-z0-9-]+)/g)].map((m) => m[1]);
    return used.length > 0 && used.every((name) => ported.has(name));
  })
  .map((f) => `tests/${f}`);

export default defineConfig({
  resolve: {
    alias: { "@": root },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "base",
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        resolve: {
          alias: [
            { find: /^@\/registry\/base\/ui\//, replacement: `${flavourUi}/` },
            { find: /^@\/registry\/base\/hooks\//, replacement: `${path.join(root, "registry/ui-sdk/hooks")}/` },
            { find: "@", replacement: root },
          ],
        },
        test: {
          name: "ui-sdk",
          environment: "jsdom",
          env: { SEVENUI_FLAVOUR: "ui-sdk" },
          setupFiles: ["./tests/setup-ui-sdk.ts"],
          // An empty include would fall back to every test file.
          include: flavourTests.length > 0 ? flavourTests : ["tests/__no-ported-primitives__"],
        },
      },
    ],
  },
});
