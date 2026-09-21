export const site = {
  name: "SevenUI",
  description: "Base UI powered primitives, distributed through the shadcn registry.",
  url: "https://sevenui.dev",
  github: { owner: "useui", repo: "sevenui" },
} as const;

export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
