# Wave 4 Navigation & Composite Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Wave 4 navigation & composite components (9 registry:ui items + demos + docs) deployable at sevenui.dev as v0.4.0: tabs, accordion, collapsible, scroll-area, meter, toolbar, navigation-menu, command, sidebar — plus the repo's first Vitest unit-test infrastructure (command is the wave's from-scratch risk item).

**Architecture:** Same proven loop as Waves 1–3: component source in `registry/base/ui/`, demo in `examples/<name>/`, docs page in `web/docs/components/`, entries in `registry.json`; `pnpm build:registry` emits `public/r/*.json`. Eight components wrap Base UI primitives verified against the INSTALLED `@base-ui/react@1.7.0` source (part export lists, rendered elements, prop signatures, data attributes, and CSS variables below are copied from the package's `.d.ts` files and bundled docs at `node_modules/@base-ui/react/docs/react/components/*.md` — do not "correct" them from memory or from base-ui.com, which may document a different version). `command` is written from scratch on Base UI **Autocomplete** in inline mode (the cmdk replacement) and gets Vitest + Testing Library unit tests per the spec. `sidebar` is the wave's only pure composite: it targets shadcn's `SidebarProvider`/`useSidebar`/`Sidebar*` surface, reuses our own sheet/tooltip/button/separator/input/skeleton as registryDependencies, introduces the repo's first hook (`use-mobile`), and adds the `--sidebar-*` token set to the theme item + `examples/theme.css` + root `theme.css`.

**Tech Stack:** `@base-ui/react` 1.7.0 (subpath imports incl. `use-render`), Tailwind v4, class-variance-authority, existing Blume/shadcn-CLI pipeline; NEW: vitest + jsdom + @testing-library/react + @testing-library/user-event (devDependencies only).

**Spec:** `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`

## Global Constraints

- All repo content English; file names kebab-case; Conventional Commits, imperative mood; NO attribution trailers (no Co-Authored-By, no AI/model/tool names). See `AGENTS.md`.
- Component dependency allowlist: `@base-ui/react`, Tailwind v4 classes, `class-variance-authority`, `clsx`, `tailwind-merge`. No icon libraries — icons are inline SVG. No cmdk, no third-party filtering libs (command's filter is Base UI's built-in collator filter).
- Base UI state styling is attribute-PRESENCE (`data-[active]:`, `data-[highlighted]:`, `data-[panel-open]:`), never `data-state=value`. Value-carrying Base UI attributes this wave: `data-orientation`, `data-activation-direction`, `data-side`, `data-align`, `data-index`. EXCEPTION: sidebar's OWN attributes (`data-state`, `data-collapsible`, `data-variant`, `data-side`, `data-size`, `data-sidebar`) are ours, set by our code on plain divs — value-carrying selectors like `group-data-[collapsible=icon]:` are correct there.
- **`aria-disabled` landmine (this wave's MenuGroupLabel-class fact):** `Tabs.Tab`, `Accordion.Trigger`, `Collapsible.Trigger`, and `Toolbar.Button` all render native `<button>` elements BUT pass `focusableWhenDisabled: true` internally, so a disabled one receives `aria-disabled="true"` and NOT the native `disabled` attribute (verified in `utils/useFocusableWhenDisabled.js:38-43`). The Tailwind `disabled:` variant never matches them — style disabled state with `data-[disabled]:` only.
- **Height animation (accordion/collapsible):** panel classes are `h-[var(--accordion-panel-height)]` / `h-[var(--collapsible-panel-height)]` + `overflow-hidden` + `transition-[height]` + `data-[starting-style]:h-0 data-[ending-style]:h-0` — exactly the bundled docs recipe. NOT `scale`/`transform` tricks, NOT grid-template-rows hacks.
- **Popup enter/exit animation** (navigation-menu popup, command dialog): `transition-[scale,opacity]` (NOT `transition-[transform,opacity]`) when animating Tailwind v4 `scale-*` utilities. `translate-*` utilities compile to the standalone `translate:` property — animate them with `transition-[translate]`/`transition-[opacity,translate]` (navigation-menu content slide).
- **Tabs selection attribute is `data-active`** (presence). There is NO `data-selected` and NO `data-highlighted` on Tabs in 1.7. Accordion/Collapsible trigger open attribute is `data-panel-open` (NOT `data-open` — that lives on Item/Panel/Root).
- Composition uses Base UI's `render` prop (`<TabsTrigger render={<a href … />} />`), not `asChild`. Sidebar's composable parts implement `render` via `useRender` from `@base-ui/react/use-render` (verified present in 1.7.0 with signature `useRender({ render, props, defaultTagName, state?, stateAttributesMapping?, ref?, enabled? })`).
- Internal `registryDependencies` are full URLs `https://sevenui.dev/r/<name>.json`. Demo items use type `registry:component`, named `<component>-demo`, one per registry:ui item (check-registry enforces this); extra examples follow the `button-variants` precedent (own item name, own title/description).
- Docs pages live in `web/docs/components/*.mdx` and follow the existing template (frontmatter `title`+`description`, `<Component path="<dir>/<file>" />`, `## Installation`, `## Usage` with consumer alias `@/components/ui/<name>`, `## API reference` linking the Base UI primitive). See `web/docs/components/progress.mdx` (short form) and `dropdown-menu.mdx` (long form).
- `public/r/` is gitignored build output — never committed. Tests live in `tests/`, run with `pnpm test` (added by Task 1).
- Theme parity: `scripts/check-registry.mjs` requires every token in the theme item's `cssVars` to appear as `--key: value;` in `examples/theme.css`. Root `theme.css` is NOT machine-checked — keep it in sync by hand (Task 14 touches all three).

## Per-task verification loop (referenced as "standard verify" below)

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
# From Task 1 onward, also: pnpm test
# Then: pnpm dev in background; curl the new /docs/blume-examples/<name>/<name>-demo route(s)
# (NOTE the /docs base path). Portaled/hidden content does NOT appear in SSR — curl proves
# the route renders and the static markup/classes exist; paste VERBATIM curl output in the
# task report. Stop the dev server cleanly (remove stale .blume/dev.lock if killed).
```

**Browser checks are BATCHED at the four explicit checkpoint tasks (6, 10, 13, 17)** — the wave 3 retrospective showed per-task browser checks are wasteful and checkpoint batches still catch plan-level defects. Blume demo islands are `client:visible`: they do NOT hydrate while the Chrome window is hidden — bring the window to the foreground (AppleScript activation) before interacting.

---

### Task 1: Test infrastructure (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/utils.test.ts`
- Modify: `package.json`, `tsconfig.json`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `pnpm test` (vitest run, jsdom environment, `@` alias resolving to repo root), used by Task 12's command tests. The spec's "Unit/behavior tests (narrow)" pipeline item — until now never wired up.

- [ ] **Step 1: Install devDependencies**

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/user-event
```

- [ ] **Step 2: Write vitest.config.ts**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

(No React plugin needed: vitest's esbuild transform reads `jsx: "react-jsx"` from tsconfig.)

- [ ] **Step 3: Write tests/setup.ts**

jsdom lacks a handful of APIs Base UI's floating/list machinery touches. All stubs are no-ops guarded with `??=` so real implementations win if jsdom adds them later:

```ts
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};
```

- [ ] **Step 4: Write the harness-proving test tests/utils.test.ts**

```ts
import { describe, expect, it } from "vitest";

import { cn } from "@/registry/base/lib/utils";

describe("cn", () => {
  it("merges tailwind classes with later overrides winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
```

- [ ] **Step 5: Wire scripts, tsconfig, CI**

- `package.json` scripts: add `"test": "vitest run"`.
- `tsconfig.json` `include`: add `"tests"` and `"vitest.config.ts"` to the array.
- `.github/workflows/ci.yml`: add a `- run: pnpm test` step between `pnpm check:registry` and `pnpm build`.

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test`
Expected: 2 passing tests in `tests/utils.test.ts`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm typecheck && pnpm check:registry` (both must stay green — tsconfig change must not break the existing surface).

```bash
git add -A
git commit -m "chore: add vitest test infrastructure"
```

---

### Task 2: Tabs

**Files:**
- Create: `registry/base/ui/tabs.tsx`, `examples/tabs/tabs-demo.tsx`, `web/docs/components/tabs.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; `Button`, `Card*`, `Input`, `Label` (demo).
- Produces: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/registry/base/ui/tabs`. Base UI 1.7 facts: parts Root/List/Tab/Panel/Indicator; Root renders `<div>`, List `<div>`, Tab native `<button>`, Panel `<div>`, Indicator `<span>`; Root props `value`/`defaultValue` (default `0`; `null` = no active tab), `orientation` (default `'horizontal'`), `onValueChange(value, eventDetails)`; List props `activateOnFocus` (default **false**) and `loopFocus` (default true); Tab REQUIRES `value`; Panel REQUIRES `value`, has `keepMounted` (default false) and receives the real `hidden` attribute plus `data-hidden`/`data-index`/`data-starting-style`/`data-ending-style`; selection attr is **`data-active`** (presence), disabled attr is `data-disabled` (Tab gets `aria-disabled`, never native `disabled` — see Global Constraints); all parts carry `data-orientation` and `data-activation-direction` (value-carrying). Tabs parts THROW outside `<Tabs.Root>` (error 64) and Tab/Indicator THROW outside `<Tabs.List>` (error 65). `Tabs.Indicator` (animated active-tab bar via `--active-tab-left/width/...` vars) is real but NOT wrapped this wave — documented as a composition escape hatch.

- [ ] **Step 1: Write registry/base/ui/tabs.tsx**

```tsx
"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/registry/base/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

- [ ] **Step 2: Demo**

`examples/tabs/tabs-demo.tsx`: `Tabs defaultValue="account" className="w-full max-w-sm"` > `TabsList className="w-full"` with `TabsTrigger value="account"`>Account and `TabsTrigger value="password"`>Password; `TabsContent value="account"` with a `Card` (`CardHeader`: `CardTitle`>Account, `CardDescription`>"Make changes to your account here. Click save when you're done."; `CardContent className="grid gap-4"`: two `Label`+`Input` rows — Name/"Pedro Duarte", Username/"@peduarte"; `CardFooter`: `Button`>Save changes); `TabsContent value="password"` with the analogous Password card (Current password / New password inputs, `Button`>Save password). Check `registry/base/ui/card.tsx` for the exact exported part names before writing. Demo registryDependencies: tabs + button + card + input + label URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

tabs.mdx links https://base-ui.com/react/components/tabs; API section documents: `defaultValue` defaults to `0` (first tab) and `value={null}` deselects all; selected styling hooks on `data-active` (Base UI 1.7 has no `data-selected`/`data-state`); disabled tabs stay focusable and receive `aria-disabled`, so style with `data-disabled`; `activateOnFocus` on `TabsList` (default false — arrow keys move focus, Enter/Space activates; set true for automatic activation); render a tab as a link via `render` with `nativeButton={false}`; the animated `Tabs.Indicator` part (`--active-tab-*` CSS vars) is available by composing the primitive directly. Registry: tabs `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Standard verify (curl `/docs/blume-examples/tabs/tabs-demo`; the inactive panel is `hidden` in SSR — assert the Account panel markup and both trigger buttons).

```bash
git add -A
git commit -m "feat(registry): add tabs component"
```

---

### Task 3: Accordion

**Files:**
- Create: `registry/base/ui/accordion.tsx`, `examples/accordion/accordion-demo.tsx`, `web/docs/components/accordion.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Base UI 1.7 facts: parts Root/Item/Header/Trigger/Panel; Root `<div>`, Item `<div>`, Header **`<h3>`**, Trigger native `<button>` (aria-disabled when disabled), Panel `<div>`; Root props `value`/`defaultValue` are **ARRAYS** (`Value[]`), `multiple` (default **false** — the prop was RENAMED from `openMultiple` in beta.4; `openMultiple` does not exist in 1.7), `disabled`, `hiddenUntilFound` (default false), `keepMounted` (default false), `onValueChange(valueArray, eventDetails)`; `loopFocus`/`orientation` are deprecated no-ops (roving focus was removed per updated APG — triggers are plain tab stops); Item props `value` (auto-ID when omitted), `disabled`, `onOpenChange`; Panel picks up `hiddenUntilFound`/`keepMounted` from Root context. Data attrs: Item/Header/Panel get `data-open`/`data-closed` + `data-index`; **Trigger gets `data-panel-open`** (not data-open); Panel gets `data-starting-style`/`data-ending-style`. Panel CSS vars: `--accordion-panel-height`, `--accordion-panel-width`. Context requirements: parts throw outside `<Accordion.Root>` (error 10) and Header/Trigger/Panel throw outside `<Accordion.Item>` (error 9) — never render a Trigger as a direct Root child. Height animation recipe verbatim from the bundled Tailwind demo: `h-[var(--accordion-panel-height)] overflow-hidden transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0`.

- [ ] **Step 1: Write registry/base/ui/accordion.tsx**

```tsx
"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@/registry/base/lib/utils";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none transition-all hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
    <AccordionPrimitive.Panel
      className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

(The inner `<div>` carries the padding so `--accordion-panel-height` — measured on the Panel — includes it; padding directly on the animating element would snap.)

- [ ] **Step 2: Demo**

`examples/accordion/accordion-demo.tsx`: `Accordion className="w-full max-w-md" defaultValue={["item-1"]}` (NOTE the array) with three `AccordionItem value="item-N"` entries — "Product Information" / "Shipping Details" / "Return Policy", each `AccordionTrigger`>title + `AccordionContent` with two short paragraphs (`flex flex-col gap-4 text-balance` on content div is not needed — plain `<p className="mb-2 last:mb-0">` pairs). Demo registryDependencies: accordion URL only.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

accordion.mdx links https://base-ui.com/react/components/accordion; API section documents: `value`/`defaultValue` are arrays of open item values; `multiple` (default false) allows several panels open — Base UI 1.7 renamed `openMultiple` to `multiple`; the header renders an `<h3>` (override heading level via `render` on the primitive's Header when composing directly); panel height animates via the `--accordion-panel-height` CSS variable; `hiddenUntilFound` enables browser find-in-page into closed panels; triggers are focusable while disabled (`aria-disabled`). Registry: accordion `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Standard verify (curl the demo route; the open first panel's text must be present in SSR).

```bash
git add -A
git commit -m "feat(registry): add accordion component"
```

---

### Task 4: Collapsible

**Files:**
- Create: `registry/base/ui/collapsible.tsx`, `examples/collapsible/collapsible-demo.tsx`, `web/docs/components/collapsible.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; `Button` (demo).
- Produces: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`. Sidebar (Task 16) documents Collapsible as its collapsible-menu building block. Base UI 1.7 facts: parts Root/Trigger/Panel ONLY; Root `<div>` with props `open`/`defaultOpen` (default false)/`onOpenChange`/`disabled` — `keepMounted` and `hiddenUntilFound` live on **Panel** here (unlike Accordion); Trigger native `<button>` (aria-disabled when disabled; open attr is **`data-panel-open`**); Panel `<div>` with `data-open`/`data-closed`/`data-starting-style`/`data-ending-style`, CSS vars `--collapsible-panel-height`/`--collapsible-panel-width`; Trigger/Panel throw outside `<Collapsible.Root>` (error 15). Bundled demo panel recipe includes the `[&[hidden]:not([hidden='until-found'])]:hidden` guard (relevant when `keepMounted`/`hiddenUntilFound` is used) — keep it.

- [ ] **Step 1: Write registry/base/ui/collapsible.tsx**

```tsx
"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/registry/base/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return (
    <CollapsiblePrimitive.Panel
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 [&[hidden]:not([hidden='until-found'])]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

- [ ] **Step 2: Demo**

`examples/collapsible/collapsible-demo.tsx` ("use client"): controlled `Collapsible` (`const [open, setOpen] = React.useState(false)`; `open={open} onOpenChange={setOpen} className="flex w-full max-w-sm flex-col gap-2"`). Header row `flex items-center justify-between gap-4 px-4`: `h4 text-sm font-semibold`>"@peduarte starred 3 repositories" + `CollapsibleTrigger render={<Button variant="ghost" size="icon" className="size-8" />}` containing a chevrons-up-down SVG (`<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />`) and `span.sr-only`>Toggle. Below the header, one always-visible `rounded-md border px-4 py-2 font-mono text-sm` div>"@radix-ui/primitives"; then `CollapsibleContent className="flex flex-col gap-2"` with two more repo divs ("@base-ui/react", "@stitches/react") each `rounded-md border px-4 py-2 font-mono text-sm`. Demo registryDependencies: collapsible + button URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

collapsible.mdx links https://base-ui.com/react/components/collapsible; API section documents: height animates via `--collapsible-panel-height`; closed content unmounts by default — `keepMounted`/`hiddenUntilFound` are **Panel** props (pass through `CollapsibleContent`); trigger open styling hooks on `data-panel-open`; trigger stays focusable when disabled (`aria-disabled`). Registry: collapsible `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Standard verify (curl: the closed panel is absent from SSR — assert the header row + first repo div).

```bash
git add -A
git commit -m "feat(registry): add collapsible component"
```

---

### Task 5: Scroll Area

**Files:**
- Create: `registry/base/ui/scroll-area.tsx`, `examples/scroll-area/scroll-area-demo.tsx`, `web/docs/components/scroll-area.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; `Separator` (demo).
- Produces: `ScrollArea` (children go inside the viewport; extra `ScrollBar` instances may be passed as children for horizontal), `ScrollBar` (prop `orientation?: "vertical" | "horizontal"` default vertical). Base UI 1.7 facts: parts Root/Viewport/Content/Scrollbar/Thumb/Corner — all render `<div>`; Root prop `overflowEdgeThreshold` (default 0); Scrollbar props `orientation` (default `'vertical'`) and `keepMounted` (default false — Scrollbar returns `null` when nothing overflows); Viewport is auto-focusable (`tabIndex={0}` whenever scrollable — no prop needed) and Base UI injects `overflow: scroll` inline; **`data-hovering` exists ONLY on Scrollbar** (visibility recipe: `opacity-0` base, `data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[scrolling]:duration-0` + pointer-events toggles, verbatim from the bundled demo); Scrollbar/Thumb carry `data-orientation` (value-carrying); Thumb auto-sizes via `--scroll-area-thumb-height/width` (injected inline — do not set height/width manually); Viewport exposes `--scroll-area-overflow-{x,y}-{start,end}` for scroll-fade masks (documented, not wrapped).

- [ ] **Step 1: Write registry/base/ui/scroll-area.tsx**

(Children render inside the Viewport's Content, so scrollbars can NEVER be children — they'd scroll with the content. Bar selection is an `orientation` prop on the wrapper instead.)

```tsx
"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/registry/base/lib/utils";

function ScrollArea({
  className,
  children,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  orientation?: "vertical" | "horizontal" | "both";
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50">
        <ScrollAreaPrimitive.Content className="min-w-full">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
      {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        "pointer-events-none flex touch-none p-px opacity-0 transition-opacity select-none data-[hovering]:pointer-events-auto data-[hovering]:opacity-100 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
```

(`ScrollBar` stays exported for consumers composing the primitive directly; the wrapper's `orientation="both"` renders both bars plus the Corner.)

- [ ] **Step 2: Demo**

`examples/scroll-area/scroll-area-demo.tsx`: `ScrollArea className="h-72 w-48 rounded-md border"`, inside a `p-4` div: `h4 mb-4 text-sm leading-none font-medium`>Tags, then `Array.from({ length: 50 }, (_, i) => \`v1.2.0-beta.${50 - i}\`)` mapped to a `text-sm` div + `Separator className="my-2"` pair (React.Fragment with key). Demo registryDependencies: scroll-area + separator URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

scroll-area.mdx links https://base-ui.com/react/components/scroll-area; API section documents: scrollbars are overlay-style, appear on hover/scroll (`data-hovering`/`data-scrolling` on the Scrollbar part); `orientation` prop on our wrapper renders vertical, horizontal, or both bars; the viewport is keyboard-focusable automatically when scrollable; thumb size is driven by Base UI-injected `--scroll-area-thumb-*` vars; scroll-fade masks are possible via the primitive's `--scroll-area-overflow-*` viewport vars (compose directly). Registry: scroll-area `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo regDeps scroll-area + separator URLs. Standard verify (curl: all 50 tag rows ARE in SSR — scroll areas don't portal).

```bash
git add -A
git commit -m "feat(registry): add scroll-area component"
```

---

### Task 6: CHECKPOINT A — browser verification (tabs, accordion, collapsible, scroll-area)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev` in background; bring Chrome to the foreground (islands are `client:visible`).
- [ ] **Step 2: Tabs** — open `/docs/blume-examples/tabs/tabs-demo`: click Password tab → panel switches, `data-active` moves; arrow keys move focus between triggers, Enter activates (activateOnFocus false).
- [ ] **Step 3: Accordion** — open the accordion demo: click item 2 → item 1 closes (multiple=false), height animates smoothly BOTH directions (no snap — snap means the padding landed on the Panel instead of the inner div), chevron rotates via `data-panel-open`.
- [ ] **Step 4: Collapsible** — toggle open/close, height animation smooth, content unmounts when closed (inspect DOM).
- [ ] **Step 5: Scroll Area** — hover the tags list → vertical scrollbar fades in; scroll → `data-scrolling` present; drag the thumb; scrollbar fades out on leave.
- [ ] **Step 6:** Report findings; fix + amend the relevant component commit(s) if defects found, then re-verify. Stop the dev server.

---

### Task 7: Meter

**Files:**
- Create: `registry/base/ui/meter.tsx`, `examples/meter/meter-demo.tsx`, `web/docs/components/meter.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Meter` (renders children — label/value row — above the track), `MeterLabel`, `MeterValue`. Mirrors the wave 1 `progress.tsx` pattern (flattened Track/Indicator). Base UI 1.7 facts: parts Root/Track/Indicator/Value/Label; Root `<div role="meter">` with REQUIRED `value: number` (non-nullable — unlike Progress), `min` (0), `max` (100), `format?: Intl.NumberFormatOptions`, `locale`, `getAriaValueText(formattedValue, value)`; default formatted display is a **percentage** (`style: 'percent'`) unless `format` is given; Label `<span>` (auto-wires `aria-labelledby`), Value `<span>` (renders the formatted value; `children` may be `(formattedValue, value) => ReactNode`); **NO data attributes and NO CSS variables on any part** — the Indicator is sized by an inline `width: N%`, so animate with `transition-[width]`.

- [ ] **Step 1: Write registry/base/ui/meter.tsx**

```tsx
"use client";

import * as React from "react";
import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { cn } from "@/registry/base/lib/utils";

function Meter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Root>) {
  return (
    <MeterPrimitive.Root
      className={cn("grid w-full gap-2", className)}
      {...props}
    >
      {children}
      <MeterPrimitive.Track className="col-span-full h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <MeterPrimitive.Indicator className="h-full bg-primary transition-[width] duration-500" />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  );
}

function MeterLabel({
  className,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Label>) {
  return (
    <MeterPrimitive.Label
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function MeterValue({
  className,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Value>) {
  return (
    <MeterPrimitive.Value
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Meter, MeterLabel, MeterValue };
```

- [ ] **Step 2: Demo**

`examples/meter/meter-demo.tsx`: `Meter value={65} className="max-w-sm grid-cols-2"` > `MeterLabel`>Storage used + `MeterValue className="text-right"` (renders "65%" automatically). Demo registryDependencies: meter URL only.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

meter.mdx links https://base-ui.com/react/components/meter; API section documents: this is a Base UI bonus primitive absent from shadcn (like number-field/toolbar); `role="meter"` semantics for a value within a known range (use `progress` for task completion); `value` is required and non-nullable (no indeterminate state — that's Progress); default display is a percentage, `format` takes `Intl.NumberFormatOptions` (e.g. `{ style: "unit", unit: "gigabyte" }`); `MeterLabel` wires `aria-labelledby` automatically. Registry: meter `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Standard verify (curl: label, value text and track markup all present in SSR).

```bash
git add -A
git commit -m "feat(registry): add meter component"
```

---

### Task 8: Toolbar

**Files:**
- Create: `registry/base/ui/toolbar.tsx`, `examples/toolbar/toolbar-demo.tsx`, `web/docs/components/toolbar.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`; `Toggle` (demo).
- Produces: `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarInput`, `ToolbarGroup`, `ToolbarSeparator`. Base UI 1.7 facts: parts Root/Button/Link/Input/Group/Separator; Root `<div role="toolbar">` with props `orientation` (default `'horizontal'`), `loopFocus` (default true), `disabled` — arrow keys give roving focus across items; Button native `<button>` with `focusableWhenDisabled` default **true** → disabled buttons get `aria-disabled`, style via `data-[disabled]:` (see Global Constraints); Link `<a>`; Input `<input>`; Separator's `orientation` DEFAULTS TO THE OPPOSITE of the toolbar's (horizontal toolbar → vertical separator) — its `data-orientation` reflects the separator itself; all parts carry `data-orientation` (value-carrying). Composition rules from the bundled docs: popup triggers go INSIDE `Toolbar.Button` (`<Toolbar.Button render={<Menu.Trigger />} />` — applies to AlertDialog/Dialog/Menu/Popover/Select), but Tooltip is INVERTED (`<Tooltip.Trigger render={<Toolbar.Button />} />`); toggles are `<Toolbar.Button render={<Toggle />} value="..." />`; use at most ONE input, placed last (arrow-key conflict).

- [ ] **Step 1: Write registry/base/ui/toolbar.tsx**

```tsx
"use client";

import * as React from "react";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";

import { cn } from "@/registry/base/lib/utils";

function Toolbar({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root>) {
  return (
    <ToolbarPrimitive.Root
      className={cn(
        "flex w-fit items-center gap-1 rounded-md border bg-background p-1 shadow-xs data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium whitespace-nowrap outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return (
    <ToolbarPrimitive.Link
      className={cn(
        "inline-flex h-8 items-center rounded-md px-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarInput({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Input>) {
  return (
    <ToolbarPrimitive.Input
      className={cn(
        "h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Group>) {
  return (
    <ToolbarPrimitive.Group
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        "shrink-0 bg-border data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarInput,
  ToolbarGroup,
  ToolbarSeparator,
};
```

(Separator orientation note: `data-orientation` on the Separator reflects the SEPARATOR's own orientation, which defaults to the opposite of the toolbar's — a horizontal toolbar's separator carries `data-orientation="vertical"` and must render as the thin vertical line (`h-4 w-px`). The mapping above encodes exactly that; Checkpoint B double-checks the shipped attribute in the browser.)

- [ ] **Step 2: Demo**

`examples/toolbar/toolbar-demo.tsx`: `Toolbar` containing: `ToolbarGroup aria-label="Text formatting"` with three `ToolbarButton render={<Toggle aria-label="Toggle bold" />}` entries (bold `<path d="M14 12a4 4 0 0 0 0-8H6v8M15 20a4 4 0 0 0 0-8H6v8Z"/>`, italic `<path d="M19 4h-9M14 20H5M15 4 9 20"/>`, underline `<path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/>` SVGs); `ToolbarSeparator`; `ToolbarGroup aria-label="Alignment"` with two plain `ToolbarButton aria-label="..."` icon buttons (align-left, align-right); `ToolbarSeparator`; `ToolbarLink href="#"`>Edited 2 hours ago. Demo registryDependencies: toolbar + toggle URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

toolbar.mdx links https://base-ui.com/react/components/toolbar; API section documents: Base UI bonus primitive absent from shadcn; roving arrow-key focus with `loopFocus`; disabled items stay focusable (`aria-disabled` → `data-disabled` styling) so tooltips still work on them; composition contracts — popup triggers render INSIDE `ToolbarButton` via `render`, Tooltip is inverted (`TooltipTrigger render={<ToolbarButton />}`), toggles via `render={<Toggle />}`; keep at most one input, last. Registry: toolbar `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo regDeps toolbar + toggle URLs. Standard verify.

```bash
git add -A
git commit -m "feat(registry): add toolbar component"
```

---

### Task 9: Navigation Menu

**Files:**
- Create: `registry/base/ui/navigation-menu.tsx`, `examples/navigation-menu/navigation-menu-demo.tsx`, `web/docs/components/navigation-menu.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `NavigationMenu` (Root + built-in Portal>Positioner>Popup>Viewport), `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `navigationMenuTriggerStyle` (cva). Base UI 1.7 facts: parts Root/List/Item/Trigger/Content/Link/Icon/Portal/Positioner/Popup/Arrow/Backdrop/Viewport; Root renders `<nav>` (`<div>` when nested) with props `value`/`defaultValue`/`onValueChange`, `delay` (default **50**) / `closeDelay` (default 50) / `orientation` — all on ROOT, not Trigger; List `<ul>`, Item `<li>` (prop `value`, auto-ID), Trigger native `<button>` (`data-popup-open`/`data-pressed`), Icon `<span>` (`data-popup-open`), Content `<div>` (prop `keepMounted` for SEO), Link a real `<a>` (props `closeOnClick` default false, `active` default false → `data-active`), Popup renders `<nav>`. **The shared-viewport mechanism:** each `Content` PORTALS itself into the single `Viewport` inside the shared `Popup`; the Trigger imperatively writes `--popup-width`/`--popup-height` (on Popup) and `--positioner-width`/`--positioner-height` (on Positioner) as it measures incoming content — the CSS contract is Popup `w-[var(--popup-width)] h-[var(--popup-height)] transition-[...,width,height]` and Positioner `w-[var(--positioner-width)] h-[var(--positioner-height)] max-w-[var(--available-width)] transition-[top,left,right,bottom]` + `data-[instant]:transition-none`. Content animates between items with `data-activation-direction` (value: left/right/up/down) × `data-starting-style`/`data-ending-style`. Anatomy: ONE `Portal` as a SIBLING AFTER `List`, inside `Root`; order inside Portal: Positioner > Popup > (Arrow) > Viewport. The Positioner needs an invisible `before:` hover bridge covering the sideOffset gap (else the popup closes crossing the gap).

- [ ] **Step 1: Write registry/base/ui/navigation-menu.tsx**

```tsx
"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";

import { cn } from "@/registry/base/lib/utils";

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Portal>
        <NavigationMenuPrimitive.Positioner
          sideOffset={10}
          collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
          collisionAvoidance={{ side: "none" }}
          className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:-top-2.5 data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:-right-2.5 data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:-left-2.5 data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:-bottom-2.5 data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
        >
          <NavigationMenuPrimitive.Popup className="relative h-[var(--popup-height)] w-full origin-[var(--transform-origin)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none transition-[opacity,scale,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:w-[var(--popup-width)]">
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden rounded-[inherit]" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center gap-1 rounded-md bg-background px-4 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[popup-open]:bg-accent/50 data-[popup-open]:text-accent-foreground",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="relative top-[1px] transition-transform duration-200 data-[popup-open]:rotate-180">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      className={cn(
        "h-full w-[calc(100vw-2.5rem)] p-2 transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[ending-style]:data-[activation-direction=left]:translate-x-1/2 data-[ending-style]:data-[activation-direction=right]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=left]:-translate-x-1/2 data-[starting-style]:data-[activation-direction=right]:translate-x-1/2 sm:w-max",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[active]:bg-accent/50 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
};
```

- [ ] **Step 2: Demo**

`examples/navigation-menu/navigation-menu-demo.tsx`: `NavigationMenu` > `NavigationMenuList` with three items:
1. `NavigationMenuItem` > `NavigationMenuTrigger`>Getting started > `NavigationMenuContent` > `ul className="grid w-72 gap-1"` with three `li` > `NavigationMenuLink href="#"` entries, each containing `div className="font-medium"`>title + `div className="text-muted-foreground"`>one-line description (Introduction / Installation / Theming — reuse real SevenUI doc copy).
2. `NavigationMenuItem` > `NavigationMenuTrigger`>Components > `NavigationMenuContent` > `ul className="grid w-96 grid-cols-2 gap-1"` with four component links (Button, Dialog, Tabs, Toast + descriptions).
3. `NavigationMenuItem` > `NavigationMenuLink href="#" className={cn(navigationMenuTriggerStyle(), "flex-row")}`>Docs (a plain top-level link — no trigger, no content).

Demo registryDependencies: navigation-menu URL only.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

navigation-menu.mdx links https://base-ui.com/react/components/navigation-menu; API section documents: `delay`/`closeDelay`/`orientation` live on the ROOT (unlike our overlay components where hover props live on triggers); all panels share ONE popup that resizes (`--popup-width/height`) and slides (`--positioner-width/height` + top/left transition) between triggers; content cross-fades directionally via `data-activation-direction`; `NavigationMenuLink` renders a real `<a>` — compose framework routers via `render`; `closeOnClick` defaults to false; `keepMounted` on the primitive's Content keeps panel HTML in SSR for crawlers (compose directly); for tall panels set `max-h-[var(--available-height)]` and prefer scroll-area over native scrollbars. Registry: navigation-menu `registry:ui` deps `["@base-ui/react", "class-variance-authority"]` regDeps utils URL; demo per convention. Standard verify (curl: triggers + the plain Docs link render in SSR; popup does not).

```bash
git add -A
git commit -m "feat(registry): add navigation-menu component"
```

---

### Task 10: CHECKPOINT B — browser verification (meter, toolbar, navigation-menu)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev` in background; Chrome foregrounded.
- [ ] **Step 2: Meter** — demo renders label "Storage used", value "65%", filled track at 65% width.
- [ ] **Step 3: Toolbar** — click a toggle → `data-pressed` styling; arrow keys rove across ALL items (toggles, buttons, link) and loop; Tab leaves the toolbar in one hop; verify the separator renders as a thin vertical line and note which `data-orientation` value it actually carries — fix Task 8's separator variant mapping if inverted.
- [ ] **Step 4: Navigation Menu** — hover "Getting started" → popup opens with scale/fade; hover "Components" WITHOUT closing → popup RESIZES and SLIDES to the new trigger, content slides in the activation direction; move pointer from trigger into the popup across the 10px gap → stays open (hover bridge works); Escape closes; keyboard: Tab to trigger, Enter opens, arrows navigate links.
- [ ] **Step 5:** Report findings; fix + amend if needed; stop the dev server.

---

### Task 11: Command groundwork — in-place Autocomplete re-verification

The command component is the wave's risk item: the only from-scratch build, on the least-familiar primitive. Before writing code, re-verify the load-bearing facts IN PLACE against the installed package (they were researched during planning; drift or misreading here invalidates Task 12). Record each check's result in the task report.

**Files:** none created — read-only verification.

- [ ] **Step 1: Part surface** — read `node_modules/@base-ui/react/autocomplete/index.parts.d.ts`. Confirm the 21 parts (Root/Value/Trigger/Input/InputGroup/Icon/Clear/List/Status/Portal/Backdrop/Positioner/Popup/Arrow/Group/GroupLabel/Item/Row/Collection/Empty/Separator) + `useFilter`/`useFilteredItems`, and that Item renders `<div role="option">` (NOT a button — `nativeButton` default false).
- [ ] **Step 2: Root props** — read `autocomplete/root/AutocompleteRoot.d.ts`. Confirm: `value` is the INPUT TEXT (string), selection mode is hardcoded `"none"`; `mode: 'list' | 'both' | 'inline' | 'none'` default `'list'`; `inline?: boolean` default false with the JSDoc instruction to pair it with unconditional `open`; `autoHighlight?: boolean | 'always'`; `keepHighlight`; `items` accepts grouped `{ value, items }[]` data; `filter={null}` disables filtering; `itemToStringValue` exists but `itemToStringLabel` does NOT (it's aliased internally); `onItemHighlighted` signature.
- [ ] **Step 3: Inline/dialog behavior** — in `docs/react/components/autocomplete.md`, locate the command-palette demo (~line 3204). Confirm: Dialog OUTSIDE, `<Autocomplete.Root open inline>` INSIDE `Dialog.Popup`, NO Portal/Positioner/Popup parts, `Dialog.Viewport` used for top-aligned centering, `autoHighlight="always" keepHighlight` on the root. Confirm in `combobox/root/AriaCombobox.js` that `useDismiss` is disabled when `inline` (Escape bubbles to the Dialog) and that Enter dispatches a real DOM `click()` on the highlighted item.
- [ ] **Step 4: Empty + filtering** — confirm `Combobox.Empty` (re-exported) is ALWAYS mounted (`role="status"`; children toggle on `filteredItems.length === 0`, requires `items` on Root) and the default filter is the collator-based substring `contains` (items stringified via `itemToString` → `.label` → `.value`).
- [ ] **Step 5:** Report: PASS/FAIL per check with file:line evidence. On any FAIL, STOP and revise Task 12 before executing it.

---

### Task 12: Command (TDD)

**Files:**
- Create: `registry/base/ui/command.tsx`, `tests/command.test.tsx`, `examples/command/command-demo.tsx`, `examples/command/command-dialog.tsx`, `web/docs/components/command.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, test infra from Task 1; `Button`, `Kbd` (dialog example — check `registry/base/ui/kbd.tsx` exports first).
- Produces: `Command` (Autocomplete.Root in `inline open autoHighlight="always" keepHighlight` mode + styled container), `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup` (props `heading?: React.ReactNode`, `items` passthrough, function children), `CommandItem`, `CommandShortcut`, `CommandSeparator`, `CommandDialog` (props `title?`, `description?` — sr-only a11y text). **API note (intentional cmdk divergence, document it):** filtering is data-driven — items/groups are passed as data to `Command items={...}` and rendered via function children, because Base UI filters the `items` array, not DOM text. Item objects use `{ value, label }` shape (the default stringifier reads `.label` for filtering/display). `CommandDialog` unmounts its content on close (Base UI Dialog default), so filter/highlight state resets for free.

- [ ] **Step 1: Write the failing tests (tests/command.test.tsx)**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Item = { value: string; label: string };
type Group = { value: string; items: Item[] };

const groups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar" },
      { value: "search-emoji", label: "Search Emoji" },
      { value: "calculator", label: "Calculator" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile" },
      { value: "billing", label: "Billing" },
    ],
  },
];

function Palette({ onSelect = () => {} }: { onSelect?: (value: string) => void }) {
  return (
    <Command items={groups}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {(group: Group) => (
          <CommandGroup key={group.value} heading={group.value} items={group.items}>
            {(item: Item) => (
              <CommandItem
                key={item.value}
                value={item}
                onClick={() => onSelect(item.value)}
              >
                {item.label}
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
    </Command>
  );
}

describe("Command", () => {
  it("renders all items and group headings initially", () => {
    render(<Palette />);
    expect(screen.getByText("Calendar")).toBeTruthy();
    expect(screen.getByText("Billing")).toBeTruthy();
    expect(screen.getByText("Suggestions")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("filters items as the user types", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    expect(screen.getByText("Calendar")).toBeTruthy();
    expect(screen.getByText("Calculator")).toBeTruthy();
    expect(screen.queryByText("Profile")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("zzzz");
    expect(screen.getByText("No results found.")).toBeTruthy();
    expect(screen.queryByText("Calendar")).toBeNull();
  });

  it("activates the highlighted item with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("calendar");
  });

  it("moves the highlight with arrow keys before activating", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    await user.keyboard("{ArrowDown}");
    const highlighted = document.querySelector("[data-highlighted]");
    expect(highlighted?.textContent).toBe("Calculator");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("calculator");
  });
});

describe("CommandDialog", () => {
  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <CommandDialog open onOpenChange={onOpenChange}>
        <Palette />
      </CommandDialog>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '@/registry/base/ui/command'` (or equivalent resolution error) for every test.

- [ ] **Step 3: Write registry/base/ui/command.tsx**

```tsx
"use client";

import * as React from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/registry/base/lib/utils";

function Command({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Root>) {
  return (
    <AutocompletePrimitive.Root
      inline
      open
      autoHighlight="always"
      keepHighlight
      {...props}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground",
          className,
        )}
      >
        {children}
      </div>
    </AutocompletePrimitive.Root>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b px-3">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 opacity-50"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <AutocompletePrimitive.Input
        className={cn(
          "flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>) {
  return (
    <AutocompletePrimitive.List
      className={cn(
        "max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      className={cn(
        "not-empty:py-6 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AutocompletePrimitive.Group>,
  "children"
> & {
  heading?: React.ReactNode;
  children: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <AutocompletePrimitive.Group
      className={cn("overflow-hidden p-1", className)}
      {...props}
    >
      {heading != null && (
        <AutocompletePrimitive.GroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </AutocompletePrimitive.GroupLabel>
      )}
      <AutocompletePrimitive.Collection>
        {children}
      </AutocompletePrimitive.Collection>
    </AutocompletePrimitive.Group>
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  title?: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 pt-[10vh] sm:pt-[15vh]">
          <DialogPrimitive.Popup className="h-fit w-full max-w-lg overflow-hidden rounded-lg border bg-popover shadow-lg transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <DialogPrimitive.Title className="sr-only">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {description}
            </DialogPrimitive.Description>
            {children}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
};
```

(Design notes for the reviewer: `inline open` before `{...props}` lets a consumer override open/onOpenChange for advanced cases while making standalone usage zero-config; inline mode disables Base UI's own dismissal, so Escape bubbles to `CommandDialog`'s Dialog root — that's the tested close path; `CommandEmpty` uses the `not-empty:` conditional-padding trick from our combobox because Base UI keeps the Empty element mounted as a live region; Base UI Dialog is imported directly (like sheet does) so command has no registry dependency on the dialog item.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all `tests/command.test.tsx` tests PASS (plus the Task 1 utils tests). If Enter/arrow tests fail on jsdom quirks, debug with `screen.debug()` — do NOT weaken assertions to just "input accepts text"; the activation contract is the point of these tests.

- [ ] **Step 5: Demos**

`examples/command/command-demo.tsx` ("use client"): module-level `const commandGroups` with the same Suggestions/Settings shape as the tests but 5+4 items, each with an inline SVG icon component and (for Settings) shortcut strings; render `<Command items={commandGroups} className="max-w-md">` > `CommandInput placeholder="Type a command or search..."` > `CommandList` function children rendering `CommandGroup heading items` > `CommandItem value={item}` with icon + label + optional `CommandShortcut`. Demo registryDependencies: command URL.

`examples/command/command-dialog.tsx` ("use client"): `const [open, setOpen] = React.useState(false)`; a `useEffect` keydown listener for `⌘K`/`Ctrl+K` toggling open (`e.preventDefault()`); a muted hint line "Press ⌘K or click below" with a `Button variant="outline"` opening it; `<CommandDialog open={open} onOpenChange={setOpen}>` wrapping a `<Command items={commandGroups} className="rounded-lg border-none">` composition (same data module-local). Items' `onClick` closes the dialog (`setOpen(false)`). Registry item name `command-dialog`, type `registry:component`, regDeps command + button URLs.

- [ ] **Step 6: Docs, registry items, standard verify, commit**

command.mdx links https://base-ui.com/react/components/autocomplete; embed BOTH previews (`command/command-demo`, then `command/command-dialog` under a "Dialog" heading — `button.mdx` precedent). API section documents: built from scratch on Base UI Autocomplete in inline mode — the Radix-free cmdk replacement; **data-driven filtering** (pass `items`, render with function children) as an intentional divergence from cmdk's DOM-text filtering, with the `{ value, label }` item shape; filtering is a locale-aware substring match — pass `filter` for custom/fuzzy matching or `filter={null}` + `filteredItems` for async search; keyboard model (virtual focus stays on the input via `aria-activedescendant`; arrows move highlight, Enter activates the item's `onClick`, Escape in `CommandDialog` closes it); the component ships with unit tests (`tests/command.test.tsx`). Registry: command `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; two demo items per Step 5. Standard verify (curl BOTH example routes; the standalone palette's input + items render in SSR since nothing portals).

```bash
git add -A
git commit -m "feat(registry): add command component with unit tests"
```

---

### Task 13: CHECKPOINT C — browser verification (command)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev`; Chrome foregrounded; open `/docs/blume-examples/command/command-demo`.
- [ ] **Step 2: Standalone** — first item pre-highlighted (autoHighlight always); type "cal" → list narrows live, group headings of empty groups disappear; clear → all items return; type gibberish → "No results found."; ArrowDown/ArrowUp move `data-highlighted` while DOM focus stays on the input; pointer hover highlights.
- [ ] **Step 3: Dialog** — open `/docs/blume-examples/command/command-dialog`: press ⌘K → dialog opens with backdrop + scale-in, input auto-ready; type to filter; Enter on an item closes; reopen → filter state is RESET (unmount-on-close); Escape closes; outside click closes.
- [ ] **Step 4:** Report findings; fix + amend if needed; stop the dev server.

---

### Task 14: Sidebar tokens (--sidebar-*)

**Files:**
- Modify: `registry.json` (theme item `cssVars`), `examples/theme.css`, `theme.css`

**Interfaces:**
- Produces: 8 sidebar tokens × 2 modes, consumed by Task 16's `bg-sidebar`/`text-sidebar-foreground`/etc. utilities. check-registry's theme-parity check machine-verifies registry.json↔examples/theme.css; root theme.css is synced by hand (site palette — keep the values IDENTICAL for the new tokens; the sidebar tokens are neutral and don't clash with the site's palette).

- [ ] **Step 1: Add tokens to the theme item in registry.json**

In the `"theme"` item's `cssVars.light` (after `"ring"`, before `"radius"`):

```json
"sidebar": "oklch(0.985 0 0)",
"sidebar-foreground": "oklch(0.145 0 0)",
"sidebar-primary": "oklch(0.205 0 0)",
"sidebar-primary-foreground": "oklch(0.985 0 0)",
"sidebar-accent": "oklch(0.97 0 0)",
"sidebar-accent-foreground": "oklch(0.205 0 0)",
"sidebar-border": "oklch(0.922 0 0)",
"sidebar-ring": "oklch(0.708 0 0)"
```

And in `cssVars.dark` (after `"ring"`):

```json
"sidebar": "oklch(0.205 0 0)",
"sidebar-foreground": "oklch(0.985 0 0)",
"sidebar-primary": "oklch(0.488 0.243 264.376)",
"sidebar-primary-foreground": "oklch(0.985 0 0)",
"sidebar-accent": "oklch(0.269 0 0)",
"sidebar-accent-foreground": "oklch(0.985 0 0)",
"sidebar-border": "oklch(1 0 0 / 10%)",
"sidebar-ring": "oklch(0.556 0 0)"
```

(These are shadcn's neutral-palette sidebar defaults — drop-in compatible with existing shadcn projects.)

- [ ] **Step 2: Mirror into examples/theme.css**

Add the same 8 declarations (`--sidebar: oklch(0.985 0 0);` etc.) to the `:root` block and the dark-mode values to the `.dark, [data-theme="dark"]` block — EXACT `--key: value;` formatting (the parity check is a substring match on that exact string). Then add to that file's `@theme inline` block:

```css
--color-sidebar: var(--sidebar);
--color-sidebar-foreground: var(--sidebar-foreground);
--color-sidebar-primary: var(--sidebar-primary);
--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
--color-sidebar-accent: var(--sidebar-accent);
--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
--color-sidebar-border: var(--sidebar-border);
--color-sidebar-ring: var(--sidebar-ring);
```

- [ ] **Step 3: Mirror into root theme.css**

Same 8 light declarations in `:root`, same 8 dark declarations in its `[data-theme="dark"]` block, same 8 `--color-sidebar*` mappings in its `@theme inline` block (this file drives the docs-site preview rendering; it is NOT machine-checked — read its existing structure first and follow it, including any `--blume-*` bridge conventions, which sidebar tokens do NOT need).

- [ ] **Step 4: Verify and commit**

Run: `pnpm check:registry` — theme parity must pass. Run `pnpm build:registry` and confirm `public/r/theme.json` contains the sidebar tokens.

```bash
git add -A
git commit -m "feat(theme): add sidebar token set"
```

---

### Task 15: Sidebar groundwork — sheet showCloseButton + use-mobile hook

**Files:**
- Create: `registry/base/hooks/use-mobile.ts`
- Modify: `registry/base/ui/sheet.tsx`

**Interfaces:**
- Consumes: existing `SheetContent` (side prop, built-in close button as a direct Popup child).
- Produces: `SheetContent` prop `showCloseButton?: boolean` (default true — no behavior change for existing consumers; mirrors dialog's existing prop); `useIsMobile(): boolean` from `@/registry/base/hooks/use-mobile` (SSR-safe: `undefined` state before mount → returns false, then matchMedia below 768px). The hook file ships INSIDE the sidebar registry item (Task 16) as a `registry:hook` file — it is not its own registry item.

- [ ] **Step 1: Add showCloseButton to SheetContent**

In `registry/base/ui/sheet.tsx`, extend `SheetContent`'s props with `showCloseButton?: boolean` (destructure with default `true`, add to the type intersection exactly like `dialog.tsx`'s `DialogContent` does) and wrap the existing `<SheetPrimitive.Close aria-label="Close" ...>` block in `{showCloseButton && (...)}`.

- [ ] **Step 2: Write registry/base/hooks/use-mobile.ts**

```ts
"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

- [ ] **Step 3: Verify and commit**

Standard verify (registry unchanged this task — `check:registry` must stay green; the hook file is registered in Task 16; curl the existing sheet demo route to confirm no regression).

```bash
git add -A
git commit -m "feat(registry): add sheet showCloseButton prop and use-mobile hook"
```

---

### Task 16: Sidebar (composite)

**Files:**
- Create: `registry/base/ui/sidebar.tsx`, `examples/sidebar/sidebar-demo.tsx`, `web/docs/components/sidebar.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `useIsMobile`, `Button`, `Separator`, `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle`/`SheetDescription` (+ `showCloseButton`), `Tooltip`/`TooltipTrigger`/`TooltipContent`/`TooltipProvider`, `Input`, `Skeleton`; `useRender` from `@base-ui/react/use-render`; `--sidebar-*` tokens from Task 14.
- Produces (shadcn-parity surface): `SidebarProvider`, `useSidebar`, `Sidebar` (props `side?: "left"|"right"`, `variant?: "sidebar"|"floating"|"inset"`, `collapsible?: "offcanvas"|"icon"|"none"`), `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` (+ `sidebarMenuButtonVariants`), `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`. **Divergences from shadcn (document them):** `asChild` → `render` prop (via `useRender`); active state is presence attr `data-active` styled `data-[active]:` (not `data-[active=true]`); mobile detection via our `useIsMobile`; tooltip wiring uses our Tooltip's Base UI props (`TooltipProvider delay={0}`, not `delayDuration`).

- [ ] **Step 1: Write registry/base/ui/sidebar.tsx**

```tsx
"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { useIsMobile } from "@/registry/base/hooks/use-mobile";
import { cn } from "@/registry/base/lib/utils";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Separator } from "@/registry/base/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/registry/base/ui/sheet";
import { Skeleton } from "@/registry/base/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (value: boolean | ((open: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        setInternalOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delay={0}>
        <div
          data-sidebar="wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-sidebar="sidebar"
        className={cn(
          "flex h-full w-[var(--sidebar-width)] flex-col bg-sidebar text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          side={side}
          showCloseButton={false}
          className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground [--sidebar-width:18rem]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
    >
      <div
        data-sidebar="gap"
        className={cn(
          "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
        )}
      />
      <div
        data-sidebar="container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      data-sidebar="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    render,
    defaultTagName: "div",
    props: {
      "data-sidebar": "group-label",
      className: cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0",
        className,
      ),
      ...props,
    },
  });
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button">) {
  return useRender({
    render,
    defaultTagName: "button",
    props: {
      type: "button",
      "data-sidebar": "group-action",
      className: cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      ),
      ...props,
    },
  });
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 data-[active]:bg-sidebar-accent data-[active]:font-medium data-[active]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    isActive?: boolean;
    tooltip?: React.ReactNode;
  }) {
  const { isMobile, state } = useSidebar();

  const button = useRender({
    render,
    defaultTagName: "button",
    props: {
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive || undefined,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props,
    },
  });

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> & { showOnHover?: boolean }) {
  return useRender({
    render,
    defaultTagName: "button",
    props: {
      type: "button",
      "data-sidebar": "menu-action",
      className: cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      ),
      ...props,
    },
  });
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  const width = React.useMemo(
    () => `${Math.floor(Math.random() * 40) + 50}%`,
    [],
  );
  return (
    <div
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton
        className="h-4 max-w-[var(--skeleton-width)] flex-1"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  className,
  render,
  size = "md",
  isActive = false,
  ...props
}: useRender.ComponentProps<"a"> & {
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  return useRender({
    render,
    defaultTagName: "a",
    props: {
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive || undefined,
      className: cn(
        "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active]:bg-sidebar-accent data-[active]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      ),
      ...props,
    },
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```

(Reviewer notes: `SIDEBAR_WIDTH_MOBILE` is applied via the `[--sidebar-width:18rem]` class on the mobile SheetContent — keep the constant for API parity even though it's encoded in the class; `data-state`/`data-collapsible`/`data-variant`/`data-side` are OUR attributes on plain divs, so value-carrying `group-data-[...]` selectors are correct here per Global Constraints; `TooltipTrigger render={button}` hands the already-built menu button element to Base UI's tooltip trigger; typecheck will validate the `useRender.ComponentProps<"a">` typing on SidebarMenuSubButton — if the ref types fight, fall back to `useRender.ComponentProps<"button">`-style widening with an explicit note in the task report.)

- [ ] **Step 2: Demo**

`examples/sidebar/sidebar-demo.tsx` ("use client"): the demo IS a full app frame — Blume preview iframes are their own viewport, so the sidebar's `fixed` positioning is correct inside them (same reasoning as wave 3's dialogs). Five inline SVG icon components at module level (`HomeIcon`, `InboxIcon`, `CalendarIcon`, `SearchIcon`, `SettingsIcon` — simple stroke paths, `size-4` via the menu button's `[&>svg]` rule). Then:

```
SidebarProvider
├─ Sidebar (collapsible="icon")
│  ├─ SidebarHeader > SidebarMenu > SidebarMenuItem > SidebarMenuButton size="lg" (app name "Acme Inc" + a small logo square)
│  ├─ SidebarContent > SidebarGroup > SidebarGroupLabel>Application + SidebarGroupContent > SidebarMenu
│  │   └─ 5 × SidebarMenuItem > SidebarMenuButton tooltip={title} render={<a href="#" />} (icon + <span>{title}</span>);
│  │     the Home item gets isActive; the Inbox item also gets SidebarMenuBadge>24
│  └─ SidebarFooter > SidebarMenu > SidebarMenuItem > SidebarMenuButton (Settings icon + <span>Settings</span>)
└─ SidebarInset
   ├─ header (flex h-12 shrink-0 items-center gap-2 border-b px-4): SidebarTrigger + Separator orientation="vertical" className="h-4" + span text-sm font-medium>Home
   └─ div (flex flex-1 flex-col gap-4 p-4): three Skeleton-ish placeholder divs (bg-muted/50 rounded-xl, one aspect-video grid of 3, one flex-1)
```

Check our `separator.tsx` for whether it accepts `orientation` before using it in the header; if not, use a plain `<div className="h-4 w-px bg-border" />`. Demo registryDependencies: sidebar URL only (sidebar's own regDeps pull the rest transitively).

- [ ] **Step 3: Registry items**

sidebar `registry:ui` item: `dependencies: ["@base-ui/react", "class-variance-authority"]`, `registryDependencies`: utils + button + separator + sheet + tooltip + input + skeleton URLs, `files`: `[{ "path": "registry/base/ui/sidebar.tsx", "type": "registry:ui" }, { "path": "registry/base/hooks/use-mobile.ts", "type": "registry:hook" }]` — the repo's first multi-file item (the smoke-test `components.json` already maps the `hooks` alias). `sidebar-demo` item per convention.

- [ ] **Step 4: Docs, standard verify, commit**

sidebar.mdx (no Base UI primitive link — link our own sheet/tooltip/collapsible docs pages instead): document the provider/context model (`SidebarProvider` + `useSidebar`), props tables for `Sidebar` (`side`/`variant`/`collapsible`) and `SidebarMenuButton` (`isActive`/`variant`/`size`/`tooltip`/`render`), the `--sidebar-*` token set (installed with the theme item; listed so users can retheme), keyboard shortcut ⌘/Ctrl+B, cookie persistence (`sidebar_state`, read it server-side to set `defaultOpen`), mobile behavior (below 768px renders in our sheet), and the divergences: `render` instead of `asChild`, `data-active` presence attr. Standard verify (curl the demo route: header, group label, and the five menu item titles render in SSR — the desktop sidebar is static DOM).

```bash
git add -A
git commit -m "feat(registry): add sidebar composite component"
```

---

### Task 17: CHECKPOINT D — browser verification (sidebar)

**Files:** none (fixes only if defects found).

- [ ] **Step 1:** `pnpm dev`; Chrome foregrounded; open `/docs/blume-examples/sidebar/sidebar-demo`.
- [ ] **Step 2: Desktop** — sidebar visible with 5 items + badge; click `SidebarTrigger` → collapses to icon rail (width animates, labels hide, group label fades); hover a collapsed icon → tooltip with the title appears on the right; expand again → tooltips suppressed; ⌘B toggles; active item styled.
- [ ] **Step 3: Mobile** — narrow the window below 768px (resize_window tool): desktop sidebar hides; `SidebarTrigger` now opens our sheet from the left with the same content and NO close X (showCloseButton false); Escape/outside click closes.
- [ ] **Step 4:** Verify no console errors during all interactions (`read_console_messages`).
- [ ] **Step 5:** Report findings; fix + amend if needed; stop the dev server.

---

### Task 18: Docs navigation, changelog, release prep

**Files:**
- Modify: `blume.config.ts`, `CHANGELOG.md`, `web/docs/index.mdx`, `AGENTS.md`

**Interfaces:**
- Consumes: all Wave 4 component pages.

- [ ] **Step 1: Update navigation**

In `blume.config.ts`, insert the 9 new routes into the Components sidebar group, keeping the whole list alphabetical (entries are plain strings like `"/components/tabs"`): accordion (before alert), collapsible (between checkbox and combobox), command (between combobox and context-menu), meter (between menubar and navigation-menu — which is also new: menubar, meter, navigation-menu, number-field), scroll-area (between radio-group and select), sidebar (between sheet and skeleton), tabs (between table and textarea), toolbar (between toggle-group and tooltip). Final list = **50** alphabetical entries.

- [ ] **Step 2: Update CHANGELOG.md**

Prepend above the v0.3.0 entry:

```markdown
## v0.4.0 — Navigation & composite wave

9 new components: tabs, accordion, collapsible, navigation-menu,
scroll-area, toolbar, meter, command, sidebar. Command is a cmdk-style
palette built from scratch on Base UI Autocomplete (no cmdk) and ships
with the repo's first Vitest unit tests. Sidebar is a full
shadcn-compatible composite built from SevenUI's own sheet, tooltip,
button, and separator, adding the --sidebar-* token set to the theme.
Toolbar and meter are Base UI bonus primitives absent from shadcn.
```

- [ ] **Step 3: Update web/docs/index.mdx**

Both count sentences 41 → 50 and "across three waves" → "across four waves"; add the wave bullet:

```markdown
- **Navigation & composite wave** (9): tabs, accordion, collapsible,
  navigation-menu, scroll-area, toolbar, meter, command, sidebar.
```

Rework the closing paragraph to cover the new claim: navigation and composition are complete — tabs, menus, a shared-popup navigation menu, a command palette, and a full sidebar system — still with zero third-party UI libraries (no Radix, no cmdk, no vaul, no sonner).

- [ ] **Step 4: Refresh AGENTS.md**

The "Completed plans" paragraph is stale (still says wave 3 is unplanned). Update it: waves 1–3 merged; wave 4 plan at `docs/superpowers/plans/2026-09-03-wave-4-navigation-composite.md` is the active plan (flip to "merged" wording as part of the release commit if executing after merge). Also mention `pnpm test` (vitest) in the verification commands list if AGENTS.md lists commands.

- [ ] **Step 5: Full verify and commit**

```bash
pnpm typecheck && pnpm check:registry && pnpm test && pnpm build && pnpm test:smoke
# click through the new /docs/components/* pages via pnpm preview; confirm 50 sidebar links
git add -A
git commit -m "docs: add wave 4 navigation and changelog"
```

---

### Task 19: Deploy verification and v0.4.0 (post-merge)

**Files:** none in-repo.

- [ ] **Step 1:** After merge to main, push; Vercel auto-deploys. CI must be green INCLUDING the new `pnpm test` step.
- [ ] **Step 2:** Live check: `curl -s https://sevenui.dev/r/tabs.json | head -c 300`, `.../r/command.json`, `.../r/sidebar.json` (sidebar JSON must list BOTH files — ui + hook — and 7 registryDependencies), `.../r/theme.json` (contains `--sidebar` tokens). Scratch-app: `add @sevenui/sidebar @sevenui/command @sevenui/tabs` from the live URLs — sidebar must transitively install sheet/tooltip/button/separator/input/skeleton/utils AND place `use-mobile` under the hooks alias; project must typecheck.
- [ ] **Step 3:** Human QA on the live site: accordion/collapsible height animations in both themes; navigation-menu popup resize/slide + hover bridge; command palette ⌘K flow on the live docs; sidebar collapse/expand + mobile sheet on a real phone; toolbar keyboard roving. Re-check the long-open wave 1 items (dark-mode toggle in preview iframes; progress hydration animation).
- [ ] **Step 4:** `git tag v0.4.0 -m "wave 4: navigation and composite components" && git push origin v0.4.0`.

---

## Deferred (explicitly NOT in this plan)

- `Tabs.Indicator` animated active-tab bar (`--active-tab-*` vars) — documented as compose-directly; consider a `tabs-indicator` example in wave 5+.
- Accordion `hiddenUntilFound` demo, vertical tabs/toolbar demos, scroll-area gradient fade masks (`--scroll-area-overflow-*`) — documented, not shipped as examples.
- Navigation-menu nested submenus (nested Root / inline `List`+`Viewport` mode) and `Arrow` part — documented as compose-directly.
- Command: fuzzy filtering (Base UI's docs use third-party match-sorter — out of the dependency allowlist), virtualization (`useFilteredItems`), async `filteredItems` search example, `CommandDialog` global-shortcut helper hook.
- Sidebar: `SidebarMenuSub` collapsible-group example (compose with our collapsible), cookie-reading SSR example, right-side/floating/inset variant demos — surface ships, extra demos deferred.
- Smoke-test expansion to dialog/select/sidebar (spec mentions representative components; current script installs theme+button only) — separate hardening task, not blocking v0.4.0.
- Wave 5 (third-party wrappers: calendar, carousel, chart, resizable) — next plan.
