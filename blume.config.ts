import { defineConfig } from "blume";

export default defineConfig({
  title: "SevenUI",
  description:
    "Base UI powered components, distributed through the shadcn registry.",
  theme: { accent: "blue", radius: "md", mode: "system" },
  examples: { css: "examples/theme.css" },
});
