---
title: Introduction
description: Base UI powered primitives, distributed through the shadcn registry.
---

SevenUI is a registry of 65 primitives built on
[Base UI](https://base-ui.com). Primitives are installed as
source code into your project through the shadcn CLI — no runtime
package to depend on.

Composed, copy-and-go usage of these primitives lives in
[Components](https://sevenui.dev/components); full pro sections and pages
live in [Blocks](https://sevenui.dev/blocks).

## Why SevenUI

- **Base UI first** — no Radix, anywhere. Every interactive part is built
  on [Base UI](https://base-ui.com); the only exceptions are four sanctioned,
  Radix-free specialized libraries (calendar, carousel, chart, resizable).
- **Drop-in shadcn compatibility** — works with the `shadcn` CLI and your
  existing `components.json` setup.
- **Source distribution via the registry** — primitives install as
  source files you own, not a package you depend on.

## Coverage

SevenUI ships 65 primitives. The first 53 arrived across five waves:

- **Foundation wave** (15): button, badge, kbd, card, alert, separator,
  skeleton, spinner, aspect-ratio, textarea, table, breadcrumb, pagination,
  avatar, progress.
- **Form wave** (14): input, label, field, form, checkbox,
  radio-group, switch, toggle, toggle-group, slider, number-field,
  input-otp, select, combobox.
- **Overlay wave** (11): dialog, alert-dialog, sheet, drawer, popover,
  hover-card, tooltip, dropdown-menu, context-menu, menubar, toast.
- **Navigation & composite wave** (9): tabs, accordion, collapsible,
  navigation-menu, scroll-area, toolbar, meter, command, sidebar.
- **Third-party wrapper wave** (4): calendar, carousel, chart, resizable.

Navigation and composition are complete — tabs, menus, a shared-popup
navigation menu, a command palette, and a full sidebar system — with
zero Radix dependencies. No Radix, no cmdk, no vaul, no sonner: every
primitive that can be built on Base UI alone uses Base UI and nothing
else. The third-party wrapper wave adds exactly four specialized,
Radix-free libraries — react-day-picker, embla-carousel, recharts, and
react-resizable-panels — for the primitives that genuinely cannot be
built on Base UI alone, the same sanctioned choices shadcn makes.
These four are the only non-Base-UI dependencies in the registry.

Form primitives use Base UI-native form handling. Libraries like
[react-hook-form](https://react-hook-form.com) plug into the `Field`
primitive's external-state props — see [Field](/docs/components/field).

Ready to add your first primitive? Head over to
[Installation](/docs/installation).
