# Agent Rules

## Project

SevenUI is a React component library built exclusively on Base UI (`@base-ui/react`) primitives — never Radix or react-aria in v1 — distributed as source code through the shadcn registry (`npx shadcn add @sevenui/button`) from sevenui.dev. Components are shadcn drop-in compatible (same CSS variables). Four sanctioned Radix-free wrapper dependencies exist for components that cannot be built on Base UI alone — react-day-picker, embla-carousel-react, recharts, react-resizable-panels — each scoped to exactly one component per the spec. End goal: full shadcn parity (~50 items) shipped in 5 waves — done. Free blocks were retired: the site now has `/components` (free gallery examples built from `packages/registry/components`, served at `/r/component/*`) and `/blocks` (a pro-only directory rendered at build time from the pro deployment's manifest). Docs site (Blume, `apps/web`) and registry (`packages/registry`) live in this one pnpm workspace.

- Design spec (authoritative scope and decisions): `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`
- Completed plans: `docs/superpowers/plans/` (waves 1–5 — foundation, form, overlay, navigation & composite, third-party wrapper — all merged).
- Monorepo migration spec: `docs/superpowers/specs/2026-09-05-monorepo-migration-design.md`
- Free blocks spec (historical — free blocks are retired, see the restructure spec below): `docs/superpowers/specs/2026-09-05-free-blocks-design.md`
- Components/blocks restructure spec: `docs/superpowers/specs/2026-09-12-components-blocks-restructure-design.md`
- Repo layout: pnpm workspace. `apps/web` (`@sevenui/web`) is the Blume docs site — published content in `apps/web/docs/` (served under the `/docs` base path), custom pages in `apps/web/pages/`. `packages/registry` (`@sevenui/registry`) holds `registry/base/` (ui component sources, built to `/r/*.json`), `demos/` (docs demo examples with their own `registry.json`, built to `/r/demo/*.json`), `components/` (gallery examples with their own `registry.json`, built to `/r/component/*.json`), the root `registry.json` (ui items), and the vitest suite; its internal layout is the byte-parity contract for `/r/*.json`, `/r/demo/*.json`, and `/r/component/*.json` — never restructure it. Cross-package checks live in `scripts/`. `docs/` at the root holds internal planning material only and is never published.

## Rules

- Write everything in English: docs, code comments, spec files, commit messages, and identifiers.
- Name files in kebab-case (`number-field.tsx`, `getting-started.mdx`).
- Write commit messages as Conventional Commits: `type(scope): summary` in imperative mood, e.g. `feat(registry): add button component`. The body explains why, not what.
- Commit messages contain only the change description. No attribution trailers of any kind: no `Co-Authored-By`, no AI, model, or tool names.
