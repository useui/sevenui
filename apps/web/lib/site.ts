export const site = {
  name: "SevenUI",
  description: "Base UI components for shadcn/ui, built for teams and their agents. Copy the source, or let your agent assemble it.",
  url: "https://sevenui.dev",
  github: { owner: "useui", repo: "sevenui" },
} as const;

export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
