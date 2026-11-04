# v2 landing — design

The home page (`/`, `apps/web/app/page.tsx`) rebuilt in the v2 "D" design language, from the
primitives that already carry the new look. Reference: `2026-11-03-v2-design-language/reference-direction-d.html`
(hero, product frame, "One registry, three sizes") and `reference-synthesis.html` (both themes).

## The user's decisions (2026-11-03, final)

1. The "Pull Back" scroll story (switch → profile card → account page) is removed entirely. The landing is
   built fresh from the D reference.
2. The display heading is the D mockup's: "Interfaces your agents can build." followed by "Quality your users can feel."
   with the second clause in muted grey.
3. The product frame under the hero is animated: the agent panel types a message, steps complete one by one,
   the form really changes, and the Comfortable/Compact toggle works live. Under `prefers-reduced-motion` the
   frame is calm and static (it shows the finished state).

## Positioning

Built for teams and their agents, with or without MCP. No MCP is promised anywhere: it does not exist yet.
The agent story is shown (the frame, the three agent levels), not claimed.

## Page outline

- H1 `Base UI components for shadcn/ui` (plain text, set small inside the hero pill; revised 2026-11-05 by
  the user so the semantic h1 carries the SEO phrase)
- H2 `Interfaces your agents can build. Quality your users can feel.` (the display line, 64px two-tone, the
  second clause in a muted span)
- H2 `One registry, three sizes.` (two-tone statement paragraph follows)
- H3 ×3 inside the figure cards: `Primitive`, `Component`, `Block`
- H2 `Built for teams and their agents.` (H3 ×3: the three agent levels)
- H2 `Start with one command.` (closing)

No heading inside the product frame. The frame carries `data-nosnippet`; its sidebar and the scripted agent
transcript are decorative to a crawler, while the form controls are real and labelled.

## Sections

1. **Hero.** Pill: a `v2` badge and the h1. The display h2 as above. Sub: "66 accessible primitives on Base UI, composed
   into 900+ components and Pro blocks. Copy the source, or let your agent assemble it." Counts are read from
   `packages/registry` at build time (the component figure is rounded down to the hundred, with `+`). CTA row:
   copyable `npx shadcn add @sevenui/button` box (package-manager aware), `Browse components` (`/components`,
   neutral primary), `Connect your agent` (`/docs/installation`, which documents non-interactive installs).
   Below: "Works with Claude Code · Cursor · VS Code · Codex" as plain text, plus a real link to `/llms.txt`.
2. **Product frame.** A tray-and-panel window holding an "Acme Inc" app built from real primitives:
   sidebar (Inbox, Projects, Members; Settings: Workspace, Billing, API keys, Agents), a Workspace settings
   form (Name, URL, "Allow agents to open PRs" switch, Comfortable/Compact toggle that sets `data-density` on
   the frame, Cancel/Save), and an Agent panel (⌘J) with an "Ask the agent…" composer.
3. **One registry, three sizes.** Two-tone statement: "One registry, three sizes. A primitive is the switch.
   A component is the card it sits in. A block is the settings page around it. The code is the same at every
   size, and so is the command." Three FIG cards with real renders: Fig 0.1 Primitive (66, `/docs/components`),
   Fig 0.2 Component (900+, `/components`), Fig 0.3 Block (Pro, `/blocks`). Each shows its install command.
4. **For agents.** Three calm columns: set up (init + `--overwrite`), choose the right part (`/llms.txt`, the
   registry index), compose a page (components and blocks). A mono stack line: React 19.2 · Next.js 16 ·
   Tailwind CSS 4.3 · Base UI 1.7 (versions verified from the lockfile).
5. **Closing.** One command again, links to `/docs`, `/blocks` and `/pro` with the Pro price from
   `PRO_LAUNCH`. The site footer is unchanged.

## Motion

- The frame's script starts once, when the frame is at least 35% in view and the tab is visible: the composer
  types "Add a danger zone with a delete-workspace dialog.", the message is sent, then three steps run one by
  one (spinner → check): "Searched registry for alert-dialog", "Installed @sevenui/alert-dialog", "Composing
  settings/danger-zone.tsx", then "Added Danger zone to Workspace". The Danger zone card fades and rises into
  the form. It plays once, then a Replay button appears. No loop.
- Only `opacity` and `transform` animate. Every element the script reveals is in the DOM from the first render,
  with its space reserved, so nothing shifts. Hidden parts are `inert`.
- `prefers-reduced-motion: reduce`: the frame renders the finished state, with no typing and no transitions.
  Without JS, a `<noscript>` style shows the finished state too.
- No scroll-jacking, no scroll-driven animation.

## Constraints carried

- Title, canonical, OG card and JSON-LD for `/` are unchanged (the description is revised, below). `robots.txt` keeps its
  Content-Signal line (Pull Back spec §15.6).
- Exactly one `<h1>`, plain text: "Base UI components for shadcn/ui", as the SEO commit ed2baba required
  (the h1 states what the site is). The big two-tone line is an `<h2>` styled as display type.
- Meta description and the site description (`/llms.txt`, 404 OG) lead with the new positioning: Base UI
  components for shadcn/ui, built for teams and their agents (revised 2026-11-05).
- Pro price comes from `PRO_LAUNCH`, never restated.
- No gradients, glows, glassmorphism or emoji. Accent (`brand`) only on the switch, focus and one link.
- No horizontal scroll at 375px. At phone width the frame drops the sidebar and stacks the agent panel under
  the form.
- Client JS only where it is needed: the install command and the product frame. Everything else is a server
  component.

## Gate

`scripts/check-home.mjs` asserts this contract on the server HTML (outline, single plain h1, the two-tone display h2, hero copy,
frame present with `data-nosnippet`, three size cards with their links, no "MCP server is live" claim, the
reduced-motion rule present in the frame's CSS, links in `<main>`). With `--browser` it also loads the page
in headless Chromium: no horizontal scroll at 375px, no console errors, and with reduced motion the finished
state is visible at once. `--controls` breaks each assertion once and requires it to fail.
