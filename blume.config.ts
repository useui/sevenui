import { defineConfig } from "blume";

export default defineConfig({
  title: "SevenUI",
  description:
    "Base UI powered components, distributed through the shadcn registry.",
  theme: { accent: "blue", radius: "md", mode: "system" },
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
            "/components/kbd",
            "/components/pagination",
            "/components/progress",
            "/components/separator",
            "/components/skeleton",
            "/components/spinner",
            "/components/table",
            "/components/textarea",
          ],
        },
      ],
    },
  },
});
