export const site = {
  name: "SevenUI",
  description: "Copy it. Own it. Ship it. Base UI powered primitives, distributed through the shadcn registry.",
  url: "https://sevenui.dev",
  github: { owner: "useui", repo: "sevenui" },
} as const;

export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
