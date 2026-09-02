# Agent Rules

## Project

SevenUI is a React component library built exclusively on Base UI (`@base-ui/react`) primitives — never Radix or react-aria in v1 — distributed as source code through the shadcn registry (`npx shadcn add @sevenui/button`) from sevenui.dev. Components are shadcn drop-in compatible (same CSS variables). End goal: full shadcn parity (~50 items) shipped in 5 waves, then paid blocks/templates on top; docs site (Blume) and registry live in this one repo.

- Design spec (authoritative scope and decisions): `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`
- Completed plans: `docs/superpowers/plans/` (wave 1 foundation, wave 2 form — both merged). No active plan; wave 3 is not planned yet.
- Site layout: published content lives in `web/docs/` (served under the `/docs` base path), custom pages in `web/pages/`; `docs/` holds internal planning material only and is never published.

## Rules

- Write everything in English: docs, code comments, spec files, commit messages, and identifiers.
- Name files in kebab-case (`number-field.tsx`, `getting-started.mdx`).
- Write commit messages as Conventional Commits: `type(scope): summary` in imperative mood, e.g. `feat(registry): add button component`. The body explains why, not what.
- Commit messages contain only the change description. No attribution trailers of any kind: no `Co-Authored-By`, no AI, model, or tool names.
