import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "blume";

// Blume's MDX pipeline uses its own processor (no rehype hook), so outbound
// links get rel="noopener noreferrer" in a post-build pass over the emitted
// HTML instead. Anchors that already declare a rel are left untouched.
const EXTERNAL_ANCHOR =
  /<a\s(?![^>]*\brel=)(?=[^>]*\bhref="https?:\/\/)(?![^>]*\bhref="https?:\/\/sevenui\.dev)/gu;

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
            "/components/accordion",
            "/components/alert",
            "/components/alert-dialog",
            "/components/aspect-ratio",
            "/components/avatar",
            "/components/badge",
            "/components/breadcrumb",
            "/components/button",
            "/components/calendar",
            "/components/card",
            "/components/carousel",
            "/components/chart",
            "/components/checkbox",
            "/components/collapsible",
            "/components/combobox",
            "/components/command",
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
            "/components/meter",
            "/components/navigation-menu",
            "/components/number-field",
            "/components/pagination",
            "/components/popover",
            "/components/progress",
            "/components/radio-group",
            "/components/resizable",
            "/components/scroll-area",
            "/components/select",
            "/components/separator",
            "/components/sheet",
            "/components/sidebar",
            "/components/skeleton",
            "/components/slider",
            "/components/spinner",
            "/components/switch",
            "/components/table",
            "/components/tabs",
            "/components/textarea",
            "/components/toast",
            "/components/toggle",
            "/components/toggle-group",
            "/components/toolbar",
            "/components/tooltip",
          ],
        },
      ],
    },
  },
  analytics: {
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-8702Z28SMN",
        strategy: "async",
      },
      {
        content: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8702Z28SMN');
        `,
      },
    ],
  },
  versions: {
    current: { label: "v0.5.0", badge: "Latest" },
    archived: [
      { id: "v0.4.0", label: "v0.4.0" },
      { id: "v0.3.0", label: "v0.3.0" },
      { id: "v0.2.0", label: "v0.2.0" },
      { id: "v0.1.0", label: "v0.1.0" },
    ],
  },
});
