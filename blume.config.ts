import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "blume";

// Blume's MDX pipeline uses its own processor (no rehype hook), so outbound
// links get rel="noopener noreferrer" in a post-build pass over the emitted
// HTML instead. Anchors that already declare a rel are left untouched.
const EXTERNAL_ANCHOR = /<a\s(?![^>]*\brel=)(?=[^>]*\bhref="https?:\/\/)(?![^>]*\bhref="https?:\/\/sevenui\.dev)/gu;

const addExternalLinkRel = async (dir: string): Promise<void> => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await addExternalLinkRel(path);
    } else if (entry.name.endsWith(".html")) {
      const html = await readFile(path, "utf-8");
      const patched = html.replace(
        EXTERNAL_ANCHOR,
        '<a rel="noopener noreferrer" ',
      );
      if (patched !== html) {
        await writeFile(path, patched);
      }
    }
  }
};

export default defineConfig({
  integrations: [
    {
      name: "sevenui-external-links",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          await addExternalLinkRel(fileURLToPath(dir));
        },
      },
    },
  ],
  title: "SevenUI",
  description:
    "Base UI powered components, distributed through the shadcn registry.",
  logo: "web/assets/logomark.svg",
  theme: { accent: "blue", radius: "md", mode: "system" },
  deployment: { site: "https://sevenui.dev" },
  basePath: "/docs",
  content: {
    root: "web/docs",
    pages: "web/pages",
  },
  examples: { css: "examples/theme.css" },
  github: {
    owner: "useui",
    repo: "sevenui",
  },
  search: {
    popular: [
      { href: "/installation", label: "Installation" },
      { href: "/theming", label: "Theming" },
      { href: "/components/button", label: "Button" },
      { href: "/components/dialog", label: "Dialog" },
      { href: "/components/combobox", label: "Combobox" },
      { href: "/components/toast", label: "Toast" },
    ],
  },
  navigation: {
    sidebar: {
      items: [
        "/",
        "/installation",
        "/theming",
        {
          label: "Components",
          items: [
            "/components/alert",
            "/components/alert-dialog",
            "/components/aspect-ratio",
            "/components/avatar",
            "/components/badge",
            "/components/breadcrumb",
            "/components/button",
            "/components/card",
            "/components/checkbox",
            "/components/combobox",
            "/components/context-menu",
            "/components/dialog",
            "/components/drawer",
            "/components/dropdown-menu",
            "/components/field",
            "/components/form",
            "/components/form-rhf",
            "/components/hover-card",
            "/components/input",
            "/components/input-otp",
            "/components/kbd",
            "/components/label",
            "/components/menubar",
            "/components/number-field",
            "/components/pagination",
            "/components/popover",
            "/components/progress",
            "/components/radio-group",
            "/components/select",
            "/components/separator",
            "/components/sheet",
            "/components/skeleton",
            "/components/slider",
            "/components/spinner",
            "/components/switch",
            "/components/table",
            "/components/textarea",
            "/components/toast",
            "/components/toggle",
            "/components/toggle-group",
            "/components/tooltip",
          ],
        },
      ],
    },
  },
});
