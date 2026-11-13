import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { importsReplaced as sourceImportsReplaced } from "../../scripts/ui-sdk-flavour.mjs";

const root = import.meta.dirname;
const flavourUi = path.join(root, "registry/ui-sdk/ui");
const testsDir = path.join(root, "tests");

// "Ported" is the one rule in scripts/ui-sdk-flavour.mjs: a flavour file
// imports nothing UI SDK replaces, in any import form.
const importsReplaced = (file: string) => sourceImportsReplaced(fs.readFileSync(file, "utf8"));
const ported = new Set(
  fs
    .readdirSync(flavourUi)
    .filter((f) => f.endsWith(".tsx") && !importsReplaced(path.join(flavourUi, f)))
    .map((f) => f.replace(/\.tsx$/, "")),
);

// The flavour run reuses the base suite: every test file that imports a
// primitive runs again against the flavour. A file joins only when every
// primitive it imports is ported, so no file mixes Base UI and UI SDK parts;
// since every primitive is ported, a file left out means a primitive stopped
// counting as ported, and the config fails rather than drop it silently.
const primitiveTests = fs
  .readdirSync(testsDir)
  .filter((f) => /\.test\.tsx?$/.test(f))
  .map((f) => ({
    file: `tests/${f}`,
    used: [...fs.readFileSync(path.join(testsDir, f), "utf8").matchAll(/@\/registry\/base\/ui\/([a-z0-9-]+)/g)].map((m) => m[1]),
  }))
  .filter((t) => t.used.length > 0);
const dropped = primitiveTests.filter((t) => !t.used.every((name) => ported.has(name)));
if (primitiveTests.length === 0 || dropped.length > 0) {
  throw new Error(
    primitiveTests.length === 0
      ? "vitest.config.ts: no test file imports a primitive; the ui-sdk project would run nothing"
      : `vitest.config.ts: the ui-sdk project would drop ${dropped.length} test file(s) whose primitives do not count as ported:\n${dropped
          .map((t) => `  ${t.file}: ${t.used.filter((name) => !ported.has(name)).join(", ")}`)
          .join("\n")}`,
  );
}
const flavourTests = primitiveTests.map((t) => t.file);

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
          include: flavourTests,
        },
      },
    ],
  },
});
