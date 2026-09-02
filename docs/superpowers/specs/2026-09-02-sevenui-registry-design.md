# SevenUI — Base UI-Powered shadcn Registry Design

**Date:** 2026-09-02
**Status:** Approved (design sections approved one by one in conversation)
**Out of scope:** Blocks/templates and paid sales (later phase), Radix and React Aria variants (v2)

## Summary

SevenUI is a React component library built exclusively on [Base UI](https://base-ui.com) (`@base-ui-components/react`) primitives, distributed via the shadcn registry protocol. It follows ReUI's model: users copy components into their project as source code via `npx shadcn add`, not as an npm package. The docs site and registry are published from a single repo at sevenui.dev.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primitive library | Base UI only (v1) | Single dependency, consistent API; Radix/Aria variants in v2 |
| Visual identity | shadcn-compatible drop-in | Same CSS variables (`--primary`, `--radius`...); adapts automatically to existing shadcn project themes |
| Scope | Full shadcn parity (~50 items) | The "use this instead of shadcn" claim requires a complete set |
| Docs framework | Blume (Astro + Vite based) | `Component` live-preview feature, `examples.css` token hook, built-in search/llms.txt/SEO |
| Repo structure | Flat single package (no monorepo) | YAGNI; migrate when the blocks phase arrives |
| Domain | sevenui.dev | Registry URLs fixed from day one |

## Architecture

### Directory Layout

```
sevenui/
├── registry/base/ui/       # component sources: button.tsx, dialog.tsx...
├── registry/base/lib/      # helpers (cn, etc.)
├── examples/               # demo files (one folder per component)
│   └── button/
│       ├── button-demo.tsx
│       └── button-variants.tsx
├── docs/                   # Blume MDX content
│   ├── index.mdx
│   ├── installation.mdx
│   ├── theming.mdx
│   └── components/*.mdx    # one page per component
├── registry.json           # shadcn registry definition
├── blume.config.ts
└── public/r/               # `shadcn build` output (static JSON)
```

The `registry/base/` folder structure is multi-flavor preparation: in v2, `registry/radix/`, `registry/aria/`, and `/r/radix/{name}.json` paths are added; v1 URLs never break.

### User Flow

```bash
# once, in components.json:
"registries": { "@sevenui": "https://sevenui.dev/r/{name}.json" }

# then:
npx shadcn@latest add @sevenui/button
# or directly:
npx shadcn@latest add https://sevenui.dev/r/button.json
```

### Registry Item Types

- `registry:ui` — the components
- `registry:lib` — helpers such as `cn`
- `registry:example` — demo files under examples/ (same source as the docs previews)
- Theme item — shadcn-compatible CSS variable set; never overrides the user's existing variables

### Dependency Policy

Each component may only use: `@base-ui-components/react`, Tailwind v4, `class-variance-authority` / `clsx` / `tailwind-merge`. Radix and react-aria appear in no dependency in v1. Exceptions (see Third Party section) are listed individually and are all Radix-free.

## Component Scope (~50 items)

### Backed 1:1 by a Base UI primitive (28)

accordion, alert-dialog, avatar, checkbox, collapsible, combobox, context-menu, dialog, dropdown-menu (Base UI `Menu`), field/form, hover-card (Base UI `Preview Card`), input, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, sheet (based on Base UI `Dialog`), slider, switch, tabs, toast, toggle, toggle-group, tooltip

### Pure Tailwind, no primitive (13)

button, badge, card, alert, separator, skeleton, spinner, table, textarea, breadcrumb, pagination, aspect-ratio, kbd

### Where shadcn uses third-party libraries — our solutions

| In shadcn | Problem | SevenUI solution |
|---|---|---|
| drawer (vaul) | vaul depends on Radix Dialog | Own drawer implementation on Base UI Dialog |
| command (cmdk) | cmdk depends on Radix | Own command on Base UI Autocomplete/Combobox |
| sonner | independent but unnecessary | Base UI Toast |
| calendar | react-day-picker (Radix-free) | Same library |
| carousel | embla-carousel (Radix-free) | Same library |
| chart | recharts (Radix-free) | Same library |
| resizable | react-resizable-panels (Radix-free) | Same library |
| input-otp | input-otp (Radix-free) | Same library |
| sidebar | composite | Composite of our own components |

### Bonus (Base UI primitives absent from shadcn)

number-field, meter, toolbar — differentiation points.

## Release Waves

Each wave is a shippable whole: component + demo + docs page + registry item.

1. **Foundation (~15):** `cn` lib, button, badge, card, alert, separator, skeleton, spinner, kbd, aspect-ratio, table, textarea, breadcrumb, pagination, avatar, progress. The registry pipeline is proven end to end here.
2. **Form (~13):** input, label, field/form, checkbox, radio-group, switch, slider, select, combobox, number-field, toggle, toggle-group, input-otp
3. **Overlay (~11):** dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown-menu, context-menu, menubar, toast
4. **Navigation & composite (~9):** tabs, accordion, collapsible, navigation-menu, scroll-area, toolbar, meter, command, sidebar
5. **Third-party wrappers (~4):** calendar, carousel, chart, resizable

**Risk focus:** Wave 3 animations; drawer and command, the two written from scratch.

## Docs Structure

### Component page template (every page follows the same layout)

1. Title + one-sentence description
2. Live preview (default demo)
3. Install command (copyable)
4. Usage (import + minimal code)
5. Variant/example previews
6. API reference

### Preview mechanism

Blume's `Component` feature renders files from `examples/` as live previews with source tabs. Example files serve double duty: docs preview **and** `registry:example` item. Single source, two outputs; demo code and docs never drift apart.

### Theme bridge

Our shadcn variable set (light/dark) is attached to Blume's `examples.css` hook. Preview frames scan Tailwind from the example files; dark mode syncs with Blume's theme switch.

### API reference

Hand-maintained props tables rot across ~50 components. Each page links to the Base UI primitive's docs, plus a small table for props SevenUI adds (e.g. `variant`, `size`).

The homepage/landing stays minimal in v1; component pages take priority.

## Quality and Pipeline

**Philosophy:** Don't re-test what Base UI already tests (focus trap, aria, keyboard). Test what we write.

1. **Static:** `tsc --noEmit` (registry + examples together; demo files are the cheapest integration test) + ESLint
2. **Registry integrity script (CI):** does every file in registry.json exist on disk; does every `registryDependencies` point to a real item; does every `registry:ui` item have at least one example and one docs page
3. **Install smoke test (CI):** scaffold a temp Vite + Tailwind project → `shadcn add` representative components (button, dialog, select) from the built local registry → `tsc` + build
4. **Unit/behavior tests (narrow):** Vitest + Testing Library, only for behavior written from scratch (drawer, command, input-otp integration). No unit tests for pure Tailwind components.

**CI/CD (GitHub Actions):**
- PR: typecheck → lint → registry integrity → `shadcn build` → `blume build` → smoke test
- main: automatic Vercel deploy → sevenui.dev

**Versioning:** No npm publish. Wave releases are marked with `CHANGELOG.md` + git tags; breaking component changes are noted in the docs.

## Assumptions to Verify (first tasks of Wave 1)

1. Blume's static file passthrough: do `public/r/*.json` files land in `dist/` after build? If not, add a copy step to the build script.
2. Blume `Component` preview compatibility with Base UI portal/popup components (dialog, tooltip) — portals may escape the preview frame; verify with the first overlay demo.
3. That `shadcn build` produces `/r/{name}.json` output with flat item names and that the `@sevenui` registries config works through it, tested in a real consumer project.
