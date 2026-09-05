# Changelog

## v0.6.0 — Free blocks wave

First blocks release: 9 ready-made sections in two categories —
authentication (login-01/02/03, signup-01/02) and marketing (hero-01/02,
pricing-01/02) — served under the new tiered path /r/blocks/<name>.json
from the new packages/blocks workspace package. The site gains a /blocks
gallery with full-screen previews. Component registry output is untouched
and byte-identical; the smoke test now installs a block end to end.

## Monorepo restructure (no release)

Internal restructure into a pnpm workspace: the Blume docs site moved to
apps/web and the component sources, examples, registry.json, and tests to
packages/registry, as the prerequisite for the blocks phase. No
user-facing change: every /r/<name>.json is byte-identical to v0.5.0
output and all /docs URLs are unchanged, so no version tag is cut.

## v0.5.0 — Third-party wrapper wave

4 new components: calendar, carousel, chart, resizable — the components
that cannot be built on Base UI alone. Each wraps the same Radix-free
library shadcn uses, pinned to the installed major: react-day-picker 10
(calendar), embla-carousel-react 8 (carousel), recharts 3 (chart, with
Vitest tests and dual dark-mode CSS-var scoping), react-resizable-panels
4 (resizable, the renamed Group/Panel/Separator API). Adds the --chart-*
token set to the theme, a tabs indicator example, and extends the
install smoke test to sidebar, calendar, and chart.

## v0.4.0 — Navigation & composite wave

9 new components: tabs, accordion, collapsible, navigation-menu,
scroll-area, toolbar, meter, command, sidebar. Command is a cmdk-style
palette built from scratch on Base UI Autocomplete (no cmdk) and ships
with the repo's first Vitest unit tests. Sidebar is a full
shadcn-compatible composite built from SevenUI's own sheet, tooltip,
button, separator, input, and skeleton, adding the --sidebar-* token
set to the theme. Toolbar and meter are Base UI bonus primitives
absent from shadcn.

## v0.3.0 — Overlay wave

11 new components: dialog, alert-dialog, sheet, drawer, popover,
hover-card, tooltip, dropdown-menu, context-menu, menubar, toast.
Drawer uses the native Base UI Drawer primitive (no vaul) and toast
ships a sonner-style global `toast()` API on Base UI Toast (no
sonner). Also fixes the select/combobox popup scale transition.

## v0.2.0 — Form wave

15 new components: input, label, field, form, form-rhf, checkbox,
radio-group, switch, toggle, toggle-group, slider, number-field,
input-otp, select, combobox. Adds the `--destructive-foreground`
token and hardened registry tooling.

## v0.1.0 — Foundation

Registry pipeline, docs site, CI, and the first 15 components:
button, badge, kbd, card, alert, separator, skeleton, spinner,
aspect-ratio, textarea, table, breadcrumb, pagination, avatar,
progress.
