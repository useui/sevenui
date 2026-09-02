import { defineConfig } from "blume";

export default defineConfig({
  title: "SevenUI",
  description:
    "Base UI powered components, distributed through the shadcn registry.",
  theme: { accent: "blue", radius: "md", mode: "system" },
  deployment: { site: "https://sevenui.dev" },
  basePath: "/docs",
  content: {
    root: "web/docs",
    pages: "web/pages",
  },
  examples: { css: "examples/theme.css" },
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
            "/components/aspect-ratio",
            "/components/avatar",
            "/components/badge",
            "/components/breadcrumb",
            "/components/button",
            "/components/card",
            "/components/checkbox",
            "/components/combobox",
            "/components/field",
            "/components/form",
            "/components/form-rhf",
            "/components/input",
            "/components/input-otp",
            "/components/kbd",
            "/components/label",
            "/components/number-field",
            "/components/pagination",
            "/components/progress",
            "/components/radio-group",
            "/components/select",
            "/components/separator",
            "/components/skeleton",
            "/components/slider",
            "/components/spinner",
            "/components/switch",
            "/components/table",
            "/components/textarea",
            "/components/toggle",
            "/components/toggle-group",
          ],
        },
      ],
    },
  },
});
