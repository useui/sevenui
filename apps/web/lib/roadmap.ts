/**
 * The public roadmap rendered at /roadmap: what is coming next, then what has
 * shipped. Both lists are ordered newest first.
 *
 * Upcoming work lives in `UPCOMING`. Keep items at the level of a feature or a
 * category, never a single block, and only list work that is actually planned.
 * `status` drives the badge: "In progress" once work has started, "Planned"
 * when it is committed to, "Exploring" when it is being considered but not
 * committed to. When an item ships, remove it here and describe it in the new
 * release entry below.
 *
 * To ship a release, prepend an entry to `RELEASES`. Items are plain strings;
 * wrap a command or a name in backticks to render it as code. Counts are taken
 * from source at release time: primitives and theme items from
 * packages/registry/registry.json, components from
 * packages/registry/components/registry.json, demos from
 * packages/registry/demos/registry.json, and Pro blocks from the pro repo's
 * registry.json grouped by its taxonomy.json.
 *
 * This is the user-facing record; it starts at 1.0.0.
 */
export type RoadmapStatus = "In progress" | "Planned" | "Exploring";

export type UpcomingItem = {
  title: string;
  /** One or two sentences; backticks render as code. */
  description: string;
  status: RoadmapStatus;
};

export type UpcomingRelease = {
  /** A version such as "1.1.0", or "Next" while the version is undecided. */
  label: string;
  summary: string;
  items: UpcomingItem[];
};

export type ReleaseSection = { heading: string; items: string[] };

export type Release = {
  version: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  title: string;
  summary: string;
  sections: ReleaseSection[];
};

export const UPCOMING: UpcomingRelease = {
  label: "Next",
  summary: "What we are working on after 1.0. Plans can change; items move to a release once they ship.",
  items: [
    {
      title: "New Pro blocks",
      description: "More blocks in the existing categories and new categories across every group. Every new block is included in existing licenses.",
      status: "Planned",
    },
    {
      title: "New components",
      description: "More free, copy-and-go components composed from the primitives.",
      status: "Planned",
    },
    {
      title: "New primitives",
      description: "More installable primitives, built on Base UI and served through the shadcn registry like the existing 65.",
      status: "Planned",
    },
    {
      title: "Fonts and icon packs in the theme customizer",
      description: "Pick a font pairing and an icon pack alongside themes, base colors, and radius, and carry the choice into your install.",
      status: "Planned",
    },
    {
      title: "SevenUI Icons on npm",
      description: "A standalone SevenUI icon package, published to npm.",
      status: "Planned",
    },
    {
      title: "Templates",
      description: "Complete, ready-to-ship page sets built from SevenUI primitives, components, and Pro blocks.",
      status: "Planned",
    },
    {
      title: "Team licenses",
      description: "Pro is sold per developer today. Team licenses will cover a whole team under one purchase.",
      status: "Planned",
    },
  ],
};

export const RELEASES: Release[] = [
  {
    version: "1.0.0",
    date: "2026-09-25",
    title: "SevenUI 1.0",
    summary:
      "The first stable release: 65 primitives on Base UI, 40 free components, and SevenUI Pro with 113 blocks — all installed through the shadcn registry.",
    sections: [
      {
        heading: "Primitives",
        items: [
          "65 primitives built on Base UI, each installed as source with `npx shadcn add @sevenui/<name>`.",
          "Drop-in compatible with shadcn: the same CSS variables, so existing shadcn themes keep working.",
          "Full shadcn parity, plus Base UI extras that shadcn does not ship, such as `toolbar` and `meter`.",
          "No Radix. `command` is built on Base UI Autocomplete (no cmdk), `toast` ships a global `toast()` API on Base UI Toast (no sonner), and `drawer` uses the Base UI Drawer (no vaul).",
          "Four primitives wrap the same Radix-free libraries shadcn uses: `calendar` (react-day-picker), `carousel` (embla-carousel-react), `chart` (recharts), and `resizable` (react-resizable-panels).",
          "A `theme` registry item with shadcn-compatible design tokens, an `animations` style item for enter and exit transitions, and the `use-mobile` hook.",
          "137 live examples across the primitive docs pages, each with its source one click away.",
        ],
      },
      {
        heading: "Components",
        items: [
          "40 free components composed from the primitives, browsable at /components and installed with one command each.",
          "Ten collections: Accordion, Badge, Button, Card, Dialog, Dropdown Menu, Input, Select, Switch, and Tabs.",
        ],
      },
      {
        heading: "Blocks",
        items: [
          "113 Pro blocks in 4 groups and 19 categories, browsable at /blocks with live previews.",
          "Application — 39 blocks: Dashboard (5), Auth (3), Profile (4), Account (2), App Shell (3), Empty State (6), Stats (16).",
          "Marketing — 44 blocks: Logo Cloud (4), CTA (6), Pricing (5), FAQ (5), Hero (9), Footer (5), Feature (5), Contact (5).",
          "AI & Agents — 3 blocks: AI Chat (3).",
          "eCommerce — 27 blocks: Product Category (10), Product Detail (7), Coupon (10).",
          "A theme customizer on every block preview: 8 themes, 5 base colors, and 4 radius options.",
          "New blocks appear in the directory within five minutes of release, with no site rebuild.",
        ],
      },
      {
        heading: "SevenUI Pro",
        items: [
          "A lifetime, per-developer license to every Pro block, including blocks released after you buy.",
          "Checkout through Polar as the merchant of record, with a full refund within 14 days.",
          "License-key installs through the shadcn CLI: set `SEVENUI_PRO_KEY`, add the registry header to `components.json` once, then run `npx shadcn@latest add @sevenui/pro/<block>`.",
          "An account page to sign in with Google, GitHub, or an email code, and to view and copy your license keys.",
          "Block requests: Pro license holders can ask for a custom Block by emailing mail@sevenui.dev from the address they bought the license with.",
        ],
      },
      {
        heading: "Site",
        items: [
          "Docs, primitives, components, and blocks on one site, rebuilt on the Next.js App Router.",
          "Search across every page with ⌘K.",
          "Install commands for npm, pnpm, yarn, and bun, with your choice remembered across pages.",
          "Every docs page is available as Markdown — copy it from the page, or read `llms.txt` and `llms-full.txt` from your AI tools.",
          "Light and dark themes, and an Open Graph image for every page.",
        ],
      },
    ],
  },
];
