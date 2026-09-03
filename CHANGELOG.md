# Changelog

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
