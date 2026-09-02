# Wave 3 Overlay Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Wave 3 overlay components (11 registry:ui items + demos + docs) deployable at sevenui.dev as v0.3.0: dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown-menu, context-menu, menubar, toast.

**Architecture:** Same proven loop as Waves 1–2: component source in `registry/base/ui/`, demo in `examples/<name>/`, docs page in `web/docs/components/`, entries in `registry.json`; `pnpm build:registry` emits `public/r/*.json`. All 11 components wrap Base UI primitives verified against the INSTALLED `@base-ui/react@1.7.0` source (part export lists, rendered elements, and prop signatures below are copied from the package's `.d.ts` files and bundled docs — do not "correct" them from memory or from base-ui.com, which may document a different version). Positioned popups (tooltip, popover, hover-card, menus) use the Portal > Positioner > Popup chain; the dialog family (dialog, alert-dialog, sheet, drawer) has NO Positioner — positioning is our CSS on Viewport/Popup. Toast exposes a sonner-style global `toast()` via `Toast.createToastManager()` plus a `<Toaster />` renderer.

**Tech Stack:** `@base-ui/react` 1.7.0 (subpath imports), Tailwind v4, class-variance-authority, existing Blume/shadcn-CLI pipeline.

**Spec:** `docs/superpowers/specs/2026-09-02-sevenui-registry-design.md`

## Global Constraints

- All repo content English; file names kebab-case; Conventional Commits, imperative mood; NO attribution trailers (no Co-Authored-By, no AI/model/tool names). See `AGENTS.md`.
- Component dependency allowlist: `@base-ui/react`, Tailwind v4 classes, `class-variance-authority`, `clsx`, `tailwind-merge`. No icon libraries — icons are inline SVG.
- Base UI state styling is attribute-PRESENCE (`data-[checked]:`, `data-[highlighted]:`), never `data-state=value`. Value-carrying attributes this wave: `data-side`, `data-align` (positioners/popups/arrows), `data-swipe-direction` (drawer/toast), `data-type` (toast), `data-instant`, `data-activation-direction`.
- **Native `disabled:` styling only on parts that render a real `<button>`/`<input>`** (all Trigger and Close parts in this wave except ContextMenu.Trigger, plus Toast Action/Close). Menu `Item`/`CheckboxItem`/`RadioItem`/`SubmenuTrigger` render `<div>`, `LinkItem` and PreviewCard.Trigger render `<a>`, ContextMenu.Trigger renders `<div>` — those take `data-[disabled]:` only.
- **Popup enter/exit animation:** plain transitions + `data-[starting-style]`/`data-[ending-style]` classes with `origin-[var(--transform-origin)]` on positioned popups. Use `transition-[scale,opacity]` (NOT `transition-[transform,opacity]`) when animating Tailwind v4 `scale-*` utilities — v4 compiles them to the standalone `scale:` property, which `transition-[transform,...]` does not animate. No tw-animate-css or animation plugins.
- **`side`/`align`/`sideOffset`/`alignOffset` are forwarded to the Positioner, never to the Popup.** The dialog family has no Positioner at all.
- **Hover/delay props live on Trigger parts, not Root** in 1.7.0: `openOnHover`/`delay`/`closeDelay` are props of `Popover.Trigger`, `Tooltip.Trigger`, `PreviewCard.Trigger`, `Menu.Trigger`, `Menu.SubmenuTrigger`. Tooltip group delays live on `Tooltip.Provider`. There is NO `dismissible` prop anywhere — the dialog-family equivalent is `disablePointerDismissal` (inverted, on Root).
- `keepMounted` lives on Portal parts (default `false`), not on Positioners.
- Composition uses Base UI's `render` prop (`<DialogTrigger render={<Button />} />`), not `asChild`.
- Internal `registryDependencies` are full URLs `https://sevenui.dev/r/<name>.json`. Demo items use type `registry:component`, named `<component>-demo`, one per registry:ui item (check-registry enforces this).
- Docs pages live in `web/docs/components/*.mdx` and follow the existing template (see `web/docs/components/select.mdx`); each page links its Base UI primitive's base-ui.com page in the API section.
- `public/r/` is gitignored build output — never committed.

## Per-task verification loop (referenced as "standard verify" below)

```bash
pnpm typecheck && pnpm check:registry && pnpm build:registry
# then: pnpm dev in background; curl the new /docs/blume-examples/<name>/<name>-demo route(s)
# (NOTE the /docs base path). Overlay popups do NOT appear in SSR — portals render only on
# open — so curl proves the route renders and the TRIGGER markup/classes exist; paste
# VERBATIM curl output in the report.
# BROWSER CHECK (required for every task that adds an overlay): open the demo route in
# Chrome via the claude-in-chrome tools, interact (click/hover/right-click the trigger),
# and confirm: popup appears, has the expected classes and data attributes, and closes
# cleanly (Escape / outside click). If browser tools are unavailable to the executing
# subagent, the task report MUST state "browser check pending" and the main session
# performs it before marking the task complete.
# Stop the dev server cleanly (remove stale .blume/dev.lock if killed).
```

---

### Task 1: Popup animation groundwork (Wave 2 transition fix)

**Files:**
- Modify: `registry/base/ui/select.tsx`, `registry/base/ui/combobox.tsx`

**Interfaces:**
- Produces: corrected popup transitions in the two existing popup components, and the canonical popup class recipe reused all wave: `transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0`.

Tailwind v4 compiles `scale-95` to the standalone `scale: 95%` property. Wave 2's popups declare `transition-[transform,opacity]`, which does not animate `scale`, so only the opacity half of the enter/exit animation actually runs. Base UI's own bundled Tailwind demos use `transition-[scale,opacity]`.

- [ ] **Step 1: Fix select.tsx**

In the `SelectPrimitive.Popup` className, replace `transition-[transform,opacity]` with `transition-[scale,opacity]`.

- [ ] **Step 2: Fix combobox.tsx**

In the `ComboboxPrimitive.Popup` className, replace `transition-[transform,opacity]` with `transition-[scale,opacity]`.

- [ ] **Step 3: Verify and commit**

Run the standard verify (no new routes; curl the existing select and combobox demo routes to confirm they still SSR). Browser check: open `/docs/components/select`, open the popup, confirm the scale animation is now visible on open/close.

```bash
git add -A
git commit -m "fix(registry): transition scale property in select and combobox popups"
```

---

### Task 2: Tooltip

**Files:**
- Create: `registry/base/ui/tooltip.tsx`, `examples/tooltip/tooltip-demo.tsx`, `web/docs/components/tooltip.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button` (demo).
- Produces: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` from `@/registry/base/ui/tooltip`. Base UI 1.7 facts: parts Root/Trigger/Portal/Positioner/Popup/Arrow/Provider/Viewport; Trigger renders a native `<button>` (but has NO `nativeButton` prop); `delay` (default 600) / `closeDelay` (default 0) / `closeOnClick` live on **Trigger**; `Provider` props are `delay`/`closeDelay`/`timeout` (default 400); Positioner default side is `'top'` (only primitive that overrides the shared `'bottom'`); Popup has NO initialFocus/finalFocus; tooltips are disabled on touch devices by design; Popup attrs include `data-instant` — always pair with `data-[instant]:transition-none`.

- [ ] **Step 1: Write registry/base/ui/tooltip.tsx**

```tsx
"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/registry/base/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  side,
  align,
  sideOffset = 8,
  alignOffset,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof TooltipPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          className={cn(
            "w-fit max-w-xs origin-[var(--transform-origin)] rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 rotate-45 rounded-[2px] bg-primary data-[side=bottom]:-top-[5px] data-[side=left]:-right-[5px] data-[side=right]:-left-[5px] data-[side=top]:-bottom-[5px]" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

(The Arrow IS the rotated square: Base UI positions it along the popup edge via inline styles on the anchor axis; the per-side negative offset classes place it across the edge, and the half inside the popup disappears against the matching `bg-primary`.)

- [ ] **Step 2: Demo**

`examples/tooltip/tooltip-demo.tsx`: wrap in `TooltipProvider`; inside, a `Tooltip` with `TooltipTrigger render={<Button variant="outline">Hover me</Button>} />` and `TooltipContent` containing the text "Add to library". Demo registryDependencies: tooltip + button URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

tooltip.mdx links https://base-ui.com/react/components/tooltip; API section documents: `delay`/`closeDelay` live on `TooltipTrigger` (Base UI 1.7 moved them off Root), `TooltipProvider` shares delays across tooltips (`timeout` default 400ms lets adjacent tooltips open instantly), tooltips are intentionally disabled on touch devices (Base UI behavior — recommend Popover with `openOnHover` for info icons), side defaults to `top`. Registry: tooltip `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: hover the trigger, confirm popup + arrow render on the correct side and the popup flips when near the viewport edge.

```bash
git add -A
git commit -m "feat(registry): add tooltip component"
```

---

### Task 3: Popover

**Files:**
- Create: `registry/base/ui/popover.tsx`, `examples/popover/popover-demo.tsx`, `web/docs/components/popover.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button`, `Input`, `Label` (demo).
- Produces: `Popover`, `PopoverTrigger`, `PopoverContent`. Base UI 1.7 facts: parts Root/Trigger/Portal/Positioner/Popup/Arrow/Backdrop/Title/Description/Close/Viewport; Trigger and Close render native `<button>` (`nativeButton` default true); Root props include `modal?: boolean | 'trap-focus'` (default false) — NO openOnHover/delay on Root (those are Trigger props: openOnHover default false, delay 300, closeDelay 0); Popup takes `initialFocus`/`finalFocus`; Positioner default side `'bottom'`; Popup attrs: data-open/closed/starting-style/ending-style/side/align/instant.

- [ ] **Step 1: Write registry/base/ui/popover.tsx**

```tsx
"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/registry/base/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({
  className,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof PopoverPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          className={cn(
            "w-72 origin-[var(--transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
```

- [ ] **Step 2: Demo**

`examples/popover/popover-demo.tsx`: `Popover` > `PopoverTrigger render={<Button variant="outline">Open popover</Button>} />` > `PopoverContent className="grid gap-4"`: a heading div (`font-medium text-sm`) "Dimensions", muted description, then two `Label`+`Input` rows (Width `defaultValue="100%"`, Height `defaultValue="25px"`). Demo registryDependencies: popover + button + input + label URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

popover.mdx links https://base-ui.com/react/components/popover; API section documents: `modal` accepts `true | false | 'trap-focus'` (default false; `true` traps focus only when a Close part is inside the Popup), `openOnHover`/`delay` live on `PopoverTrigger`, `initialFocus`/`finalFocus` pass through `PopoverContent` to the Popup, custom anchoring via the Positioner's `anchor` prop is available by composing the primitive directly. Registry: popover `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: open via click, confirm scale/opacity animation, Escape closes, focus returns to trigger.

```bash
git add -A
git commit -m "feat(registry): add popover component"
```

---

### Task 4: Hover Card

**Files:**
- Create: `registry/base/ui/hover-card.tsx`, `examples/hover-card/hover-card-demo.tsx`, `web/docs/components/hover-card.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Avatar`/`AvatarFallback` (demo).
- Produces: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`. Base UI 1.7 facts: primitive is `PreviewCard` from `@base-ui/react/preview-card`; parts Root/Portal/Trigger/Positioner/Popup/Arrow/Backdrop/Viewport (NO Title/Description/Close); **Trigger renders an `<a>` element** (typed `React.ComponentPropsWithRef<'a'>` — pass `href`); hover-open is built in (no `openOnHover` prop) with `delay` default 600 / `closeDelay` default 300 on the Trigger; Root has no `modal`; Positioner default side `'bottom'`.

- [ ] **Step 1: Write registry/base/ui/hover-card.tsx**

```tsx
"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";

import { cn } from "@/registry/base/lib/utils";

const HoverCard = PreviewCardPrimitive.Root;

const HoverCardTrigger = PreviewCardPrimitive.Trigger;

function HoverCardContent({
  className,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof PreviewCardPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          className={cn(
            "w-64 origin-[var(--transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
```

- [ ] **Step 2: Demo**

`examples/hover-card/hover-card-demo.tsx`: `HoverCard` > `HoverCardTrigger href="https://base-ui.com" target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4">@base_ui</HoverCardTrigger>` > `HoverCardContent className="flex gap-3"`: `Avatar`>`AvatarFallback`>BU + a column with title "Base UI", muted line "Unstyled UI components for React, by the MUI team.", and a small muted "Joined 2024" row. Demo registryDependencies: hover-card + avatar URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

hover-card.mdx links https://base-ui.com/react/components/preview-card; API section states: built on Base UI **Preview Card**; the trigger renders a real link (`<a>`) and needs `href` — preview cards exist to preview link destinations; `delay`(600)/`closeDelay`(300) live on `HoverCardTrigger`; not accessible to touch/screen-reader users by design (progressive enhancement). Registry: hover-card `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo regDeps hover-card + avatar URLs. Browser check: hover the link, confirm card opens after delay and stays open while hovering the card itself.

```bash
git add -A
git commit -m "feat(registry): add hover-card component"
```

---

### Task 5: Dialog

**Files:**
- Create: `registry/base/ui/dialog.tsx`, `examples/dialog/dialog-demo.tsx`, `web/docs/components/dialog.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button`, `Input`, `Label` (demo).
- Produces: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent` (prop `showCloseButton?: boolean` default true), `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`. Sheet (Task 7) reuses this primitive directly, and alert-dialog (Task 6) mirrors this file's structure. Base UI 1.7 facts: parts Root/Trigger/Portal/Backdrop/**Viewport**/Popup/Title/Description/Close — **NO Positioner, NO "Overlay"** (the backdrop part is `Backdrop`; `Viewport` is an optional positioning/scroll container we use for centering); Trigger and Close render native `<button>`; Root props: `modal?: boolean | 'trap-focus'` (default true), `disablePointerDismissal` (default false; there is NO `dismissible` prop), `onOpenChange(open, eventDetails)`; Popup props `initialFocus`/`finalFocus`; Popup/Viewport attrs: data-open/closed/starting-style/ending-style/nested/nested-dialog-open; Popup CSS var `--nested-dialogs`; Title renders `<h2>`, Description renders `<p>`.

- [ ] **Step 1: Write registry/base/ui/dialog.tsx**

```tsx
"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/registry/base/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <DialogPrimitive.Popup
          className={cn(
            "relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute top-4 right-4 rounded-xs text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
```

- [ ] **Step 2: Demo**

`examples/dialog/dialog-demo.tsx`: `Dialog` > `DialogTrigger render={<Button variant="outline">Edit profile</Button>} />` > `DialogContent className="sm:max-w-106"`: `DialogHeader` with `DialogTitle`>Edit profile + `DialogDescription`>"Make changes to your profile here. Click save when you're done."; then two `Label`+`Input` rows (Name/"Pedro Duarte", Username/"@peduarte") in a `grid gap-4`; `DialogFooter` with `DialogClose render={<Button variant="outline">Cancel</Button>} />` and a `Button`>Save changes. Demo registryDependencies: dialog + button + input + label URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

dialog.mdx links https://base-ui.com/react/components/dialog; API section documents: `modal` (`true | false | 'trap-focus'`, default true), `disablePointerDismissal` to keep the dialog open on outside press (Base UI has no `dismissible` prop), `initialFocus`/`finalFocus` pass through `DialogContent`, `showCloseButton` (SevenUI addition), nested-dialog styling hooks (`data-nested-dialog-open`, `--nested-dialogs`), and that content is centered by a `Dialog.Viewport` — long content scrolls the viewport, not the page. Registry: dialog `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: open, confirm backdrop fade + popup scale, Escape and outside click close, close X works, focus is trapped.

```bash
git add -A
git commit -m "feat(registry): add dialog component"
```

---

### Task 6: Alert Dialog

**Files:**
- Create: `registry/base/ui/alert-dialog.tsx`, `examples/alert-dialog/alert-dialog-demo.tsx`, `web/docs/components/alert-dialog.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `buttonVariants` from `@/registry/base/ui/button`, `Button` (demo).
- Produces: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`. Base UI 1.7 facts: import from `@base-ui/react/alert-dialog`; parts Root/Trigger/Portal/Backdrop/Viewport/Popup/Title/Description/Close (Backdrop/Viewport/Popup/Title/Description/Close are literal re-exports of the Dialog parts); Root type OMITS `modal` and `disablePointerDismissal` — the primitive forces `modal: true`, blocks outside-press dismissal, and sets `role="alertdialog"`; Escape still closes. Action and Cancel are both the Close part styled with `buttonVariants` (both close the dialog; the consumer's `onClick` on Action does the destructive work).

- [ ] **Step 1: Write registry/base/ui/alert-dialog.tsx**

```tsx
"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@/registry/base/lib/utils";
import { buttonVariants } from "@/registry/base/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <AlertDialogPrimitive.Popup
          className={cn(
            "relative grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
```

- [ ] **Step 2: Demo**

`examples/alert-dialog/alert-dialog-demo.tsx`: `AlertDialog` > `AlertDialogTrigger render={<Button variant="outline">Delete account</Button>} />` > `AlertDialogContent` > `AlertDialogHeader` (`AlertDialogTitle`>"Are you absolutely sure?", `AlertDialogDescription`>"This action cannot be undone. This will permanently delete your account and remove your data from our servers.") + `AlertDialogFooter` (`AlertDialogCancel`>Cancel, `AlertDialogAction`>Continue). Demo registryDependencies: alert-dialog + button URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

alert-dialog.mdx links https://base-ui.com/react/components/alert-dialog; API section states: always modal, never closes on outside press (both enforced by the primitive — the Root accepts no `modal`/`disablePointerDismissal` props), `role="alertdialog"`, Escape still closes; `AlertDialogAction`/`AlertDialogCancel` are Close buttons styled with `buttonVariants` — attach the destructive handler via `onClick` on Action. Registry: alert-dialog `registry:ui` deps `["@base-ui/react"]` regDeps utils + button URLs (it imports `buttonVariants`); demo per convention. Browser check: open, verify outside click does NOT close, Escape does, both footer buttons close.

```bash
git add -A
git commit -m "feat(registry): add alert-dialog component"
```

---

### Task 7: Sheet

**Files:**
- Create: `registry/base/ui/sheet.tsx`, `examples/sheet/sheet-demo.tsx`, `web/docs/components/sheet.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button`, `Input`, `Label` (demo).
- Produces: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent` (prop `side?: "top" | "right" | "bottom" | "left"` default "right"), `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`. Built on the same Base UI **Dialog** primitive as Task 5 (per spec) — no Viewport needed here: the Popup is `position: fixed` against a screen edge and slides via translate. Tailwind v4 `translate-x-full` etc. compile to the standalone `translate:` property — `transition-transform` in v4 covers `transform, translate, scale, rotate`, so it animates them correctly.

- [ ] **Step 1: Write registry/base/ui/sheet.tsx**

```tsx
"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/registry/base/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const sheetSides = {
  top: "inset-x-0 top-0 h-auto border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
  bottom:
    "inset-x-0 bottom-0 h-auto border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
} as const;

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: keyof typeof sheetSides;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <SheetPrimitive.Popup
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition-transform duration-300 ease-in-out",
          sheetSides[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Close"
          className="absolute top-4 right-4 rounded-xs text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
```

- [ ] **Step 2: Demo**

`examples/sheet/sheet-demo.tsx`: `Sheet` > `SheetTrigger render={<Button variant="outline">Open sheet</Button>} />` > `SheetContent` > `SheetHeader` (`SheetTitle`>"Edit profile", `SheetDescription`>"Make changes to your profile here. Click save when you're done.") + a `grid flex-1 auto-rows-min gap-6 px-4` with two `Label`+`Input` rows + `SheetFooter` (`Button`>Save changes, `SheetClose render={<Button variant="outline">Close</Button>} />`). Demo registryDependencies: sheet + button + input + label URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

sheet.mdx links https://base-ui.com/react/components/dialog and states it is a positioned Base UI Dialog (per Base UI's own guidance: an edge panel without gestures is a positioned Dialog; use `drawer` when you need swipe gestures); documents the `side` prop and that all Dialog root props (`modal`, `disablePointerDismissal`, `onOpenChange`) apply. Registry: sheet `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: open, confirm slide-in from the right + backdrop fade, Escape/outside/X close; spot-check `side="left"` by temporarily editing the demo in the browser session is NOT required — the four side classes are static.

```bash
git add -A
git commit -m "feat(registry): add sheet component"
```

---

### Task 8: Drawer

**Files:**
- Create: `registry/base/ui/drawer.tsx`, `examples/drawer/drawer-demo.tsx`, `web/docs/components/drawer.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button` (demo).
- Produces: `Drawer`, `DrawerTrigger`, `DrawerPortal`, `DrawerClose`, `DrawerOverlay`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`. Base UI 1.7 facts: `Drawer` from `@base-ui/react/drawer`; parts Provider/IndentBackground/Indent/Root/Trigger/SwipeArea/Portal/Backdrop/**Viewport**/Popup/**Content**/Title/Description/Close/VirtualKeyboardProvider; **`Drawer.Viewport` is mandatory — it owns the swipe-gesture engine** (without it swipe-to-dismiss silently does nothing); `Drawer.Content` re-enables text selection inside the popup and carries the scroll area; Root props = Dialog root props + `swipeDirection` (default `'down'`) + snap-point props (`snapPoints`, `snapPoint`, `defaultSnapPoint`, `onSnapPointChange`, `snapToSequentialPoints`); Popup CSS vars `--drawer-swipe-movement-x/y`, `--drawer-swipe-strength` (0.1–1 scalar for release duration), `--drawer-snap-point-offset`, `--drawer-height`, `--nested-drawers`; Backdrop CSS var `--drawer-swipe-progress` (0–1 during drag); Popup attrs include `data-swiping`, `data-swipe-direction`, `data-expanded`. Elements inside the popup opt out of swipe with `data-base-ui-swipe-ignore` (interactive elements are auto-ignored). Snap points, SwipeArea (swipe-to-open), and the Indent effect are OUT OF SCOPE this wave — document as available on the primitive.

- [ ] **Step 1: Write registry/base/ui/drawer.tsx**

```tsx
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/registry/base/lib/utils";

const Drawer = DrawerPrimitive.Root;

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black opacity-[calc(0.5*(1-var(--drawer-swipe-progress,0)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:opacity-0 data-[ending-style]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex touch-none items-end justify-center">
        <DrawerPrimitive.Popup
          className={cn(
            "flex h-auto max-h-[85vh] w-full flex-col rounded-t-lg border bg-background outline-none transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[ending-style]:[transform:translateY(calc(100%+2px))] data-[starting-style]:[transform:translateY(calc(100%+2px))] data-[swiping]:duration-0",
            className,
          )}
          {...props}
        >
          <div
            aria-hidden
            className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
          />
          <DrawerPrimitive.Content className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain touch-auto">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-4 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
```

(Class notes for the reviewer: the `+2px` in the closed transform hides sub-pixel seams — copied from Base UI's reference demo; `data-[swiping]:duration-0` freezes the transition while the finger drags so the popup tracks `--drawer-swipe-movement-y` live; the release animation duration scales with `--drawer-swipe-strength` exactly as the bundled Drawer docs prescribe.)

- [ ] **Step 2: Demo**

`examples/drawer/drawer-demo.tsx`: `Drawer` > `DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />` > `DrawerContent` > a `mx-auto w-full max-w-sm` wrapper containing `DrawerHeader` (`DrawerTitle`>"Move goal", `DrawerDescription`>"Set your daily activity goal.") + a centered `text-6xl font-bold tracking-tighter` value "350" with a muted "calories/day" line + `DrawerFooter` (`Button`>Submit, `DrawerClose render={<Button variant="outline">Cancel</Button>} />`). Demo registryDependencies: drawer + button URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

drawer.mdx links https://base-ui.com/react/components/drawer; API section documents: native Base UI Drawer primitive (NO vaul — this is the Radix-free replacement), swipe-to-dismiss down by default (`swipeDirection` on the root), all Dialog root props apply, `data-base-ui-swipe-ignore` opts an element out of swipe handling, and snap points / swipe-to-open / indent effects exist on the primitive but are not wrapped in v1 (compose `DrawerPrimitive` directly for those). Registry: drawer `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check REQUIRED and extended: open the drawer, confirm slide-up + backdrop fade; simulate a swipe (pointer drag down on the handle area) and confirm the popup follows the pointer and dismisses past the threshold; confirm a drag on the Cancel button does NOT start a swipe.

```bash
git add -A
git commit -m "feat(registry): add drawer component"
```

---

### Task 9: Dropdown Menu

**Files:**
- Create: `registry/base/ui/dropdown-menu.tsx`, `examples/dropdown-menu/dropdown-menu-demo.tsx`, `web/docs/components/dropdown-menu.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button` (demo).
- Produces: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem` (props `inset?: boolean`, `variant?: "default" | "destructive"`), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger` (prop `inset?: boolean`), `DropdownMenuSubContent`. Context-menu (Task 10) and menubar (Task 11) repeat these part wrappers from their own subpath/primitives. Base UI 1.7 facts: `Menu` from `@base-ui/react/menu`; parts Root/Trigger/Portal/Positioner/Popup/Arrow/Backdrop/Item/LinkItem/Separator/Group/GroupLabel/RadioGroup/RadioItem/RadioItemIndicator/CheckboxItem/CheckboxItemIndicator/SubmenuRoot/SubmenuTrigger/Viewport; **only Trigger renders a native `<button>`** — Item/CheckboxItem/RadioItem/SubmenuTrigger render `<div>` (style disabled via `data-[disabled]:`), indicators render `<span>`; Root props: `modal` (default true), `loopFocus` (NOT `loop`, default true), `closeParentOnEsc` (NOT `closeParent`), `orientation`, `highlightItemOnHover`; `openOnHover`/`delay`(100)/`closeDelay` live on Trigger/SubmenuTrigger; Item `closeOnClick` default true but CheckboxItem/RadioItem default false; RadioItem REQUIRES `value`; submenus = `SubmenuRoot` (NOT nested Root) and their Positioner auto-defaults to `side="inline-end" align="start"` — do NOT hardcode `side="right"` (inline-end is RTL-aware); highlight state attr is `data-highlighted`; trigger open attr is `data-popup-open` (there is no data-open on Trigger); Popup attrs include `data-instant`.

- [ ] **Step 1: Write registry/base/ui/dropdown-menu.tsx**

```tsx
"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/registry/base/lib/utils";

const DropdownMenu = MenuPrimitive.Root;

const DropdownMenuPortal = MenuPrimitive.Portal;

const DropdownMenuTrigger = MenuPrimitive.Trigger;

const DropdownMenuGroup = MenuPrimitive.Group;

const DropdownMenuSub = MenuPrimitive.SubmenuRoot;

const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

const menuPopupClasses =
  "max-h-[var(--available-height)] min-w-32 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

const menuItemClasses =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function DropdownMenuContent({
  className,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof MenuPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItemClasses,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-inset={inset || undefined}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
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

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-inset={inset || undefined}
      className={cn(
        menuItemClasses,
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
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
        className="ml-auto size-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Portal>
      {/* No side/align: Base UI auto-positions submenus at inline-end/start (RTL-aware). */}
      <MenuPrimitive.Positioner className="z-50">
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, "min-w-32", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
```

- [ ] **Step 2: Demo**

`examples/dropdown-menu/dropdown-menu-demo.tsx`: `DropdownMenu` > `DropdownMenuTrigger render={<Button variant="outline">Open menu</Button>} />` > `DropdownMenuContent align="start" className="w-56"` containing: `DropdownMenuLabel`>My Account; `DropdownMenuGroup` with items Profile (`DropdownMenuShortcut`>⇧⌘P), Billing (⌘B), Settings (⌘S); `DropdownMenuSeparator`; `DropdownMenuSub` > `DropdownMenuSubTrigger`>Invite users > `DropdownMenuSubContent` with items Email, Message; `DropdownMenuSeparator`; `DropdownMenuCheckboxItem defaultChecked`>Status bar and `DropdownMenuCheckboxItem`>Activity bar; `DropdownMenuSeparator`; `DropdownMenuRadioGroup defaultValue="bottom"` with `DropdownMenuLabel`>Panel position and `DropdownMenuRadioItem value="top"|"bottom"|"right"`; `DropdownMenuSeparator`; `DropdownMenuItem variant="destructive"`>Log out. Demo registryDependencies: dropdown-menu + button URLs.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

dropdown-menu.mdx links https://base-ui.com/react/components/menu; API section documents: built on Base UI **Menu**; `loopFocus`/`modal`/`closeParentOnEsc` on the root; `openOnHover`/`delay` on the trigger; `closeOnClick` defaults (Item true, Checkbox/Radio items false); items render divs — disable state styles via `data-disabled`; submenu positioning is automatic and RTL-aware. Registry: dropdown-menu `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: open menu, keyboard-navigate (arrows + typeahead), open the submenu via hover and keyboard, toggle a checkbox item (menu stays open), pick a radio item, confirm destructive item styling.

```bash
git add -A
git commit -m "feat(registry): add dropdown-menu component"
```

---

### Task 10: Context Menu

**Files:**
- Create: `registry/base/ui/context-menu.tsx`, `examples/context-menu/context-menu-demo.tsx`, `web/docs/components/context-menu.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuPortal`, `ContextMenuContent`, `ContextMenuGroup`, `ContextMenuLabel`, `ContextMenuItem` (props `inset?`, `variant?` as in Task 9), `ContextMenuCheckboxItem`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent`. Base UI 1.7 facts: **everything imports from `@base-ui/react/context-menu`** — the subpath re-exports the identical Menu part objects plus its own Root and Trigger; `ContextMenu.Trigger` renders a `<div>` (the right-click/long-press area, NOT a button; it has no props beyond the shared trio); Root omits `modal` (always modal internally); **the Positioner gets NO side/align/offset props** — Base UI anchors to the pointer with automatic corner offsets (`align 'start'`, `alignOffset 2`, `sideOffset -5`, `position: fixed`), and passing `side` explicitly would disable them; there is no Viewport part on this subpath.

- [ ] **Step 1: Write registry/base/ui/context-menu.tsx**

```tsx
"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";

import { cn } from "@/registry/base/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuSub = ContextMenuPrimitive.SubmenuRoot;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const menuPopupClasses =
  "max-h-[var(--available-height)] min-w-32 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

const menuItemClasses =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPrimitive.Portal>
      {/* No side/align/offsets: Base UI anchors context menus to the pointer with
          automatic corner offsets; passing side would disable them. */}
      <ContextMenuPrimitive.Positioner className="z-50">
        <ContextMenuPrimitive.Popup
          className={cn(menuPopupClasses, className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItemClasses,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-inset={inset || undefined}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
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

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-inset={inset || undefined}
      className={cn(
        menuItemClasses,
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
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
        className="ml-auto size-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner className="z-50">
        <ContextMenuPrimitive.Popup
          className={cn(menuPopupClasses, "min-w-32", className)}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
```

- [ ] **Step 2: Demo**

`examples/context-menu/context-menu-demo.tsx`: `ContextMenu` > `ContextMenuTrigger className="flex h-36 w-full max-w-sm items-center justify-center rounded-md border border-dashed text-sm select-none">Right click here</ContextMenuTrigger>` > `ContextMenuContent className="w-52"` with: items Back (⌘[), Forward (⌘] , `disabled`), Reload (⌘R); `ContextMenuSub` > `ContextMenuSubTrigger inset`>More tools > `ContextMenuSubContent` (Save page, Create shortcut, Developer tools); `ContextMenuSeparator`; `ContextMenuCheckboxItem defaultChecked`>Show bookmarks; `ContextMenuSeparator`; `ContextMenuRadioGroup defaultValue="pedro"` with `ContextMenuLabel inset`>People and two `ContextMenuRadioItem`s. Demo registryDependencies: context-menu URL only.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

context-menu.mdx links https://base-ui.com/react/components/context-menu; API section notes: opens on right click or touch long-press; trigger is a plain `<div>` area; positioning is pointer-anchored and automatic (`ContextMenuContent` deliberately exposes no side/align); shares all Menu item semantics with dropdown-menu; usage guidance — keep visible controls for every action available in the context menu. Registry: context-menu `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: right-click the area, confirm the menu opens at the pointer corner, submenu opens, Escape closes; right-click in a far corner to confirm collision handling.

```bash
git add -A
git commit -m "feat(registry): add context-menu component"
```

---

### Task 11: Menubar

**Files:**
- Create: `registry/base/ui/menubar.tsx`, `examples/menubar/menubar-demo.tsx`, `web/docs/components/menubar.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`.
- Produces: `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarPortal`, `MenubarContent`, `MenubarGroup`, `MenubarLabel`, `MenubarItem` (props `inset?`, `variant?`), `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSeparator`, `MenubarShortcut`, `MenubarSub`, `MenubarSubTrigger` (prop `inset?`), `MenubarSubContent`. Base UI 1.7 facts: `Menubar` from `@base-ui/react/menubar` is a FLAT component (no `.Root`, no parts file) rendering a `<div role="menubar">`; props `modal` (default true), `disabled`, `orientation` (default 'horizontal'), `loopFocus` (default true); each menu inside is an ordinary `Menu.Root`+`Menu.Trigger` from `@base-ui/react/menu` — Menubar coordinates them via context (hovering a sibling trigger switches menus once one is open; NO `openOnHover` needed on triggers); menubar-parented Positioners auto-default to `side="bottom" align="start"` (horizontal) so Content only needs `sideOffset`; menubar triggers style open state with `data-popup-open` and pressed state with `data-pressed`.

- [ ] **Step 1: Write registry/base/ui/menubar.tsx**

```tsx
"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";

import { cn } from "@/registry/base/lib/utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive>) {
  return (
    <MenubarPrimitive
      className={cn(
        "flex h-9 w-fit items-center gap-1 rounded-md border bg-background p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

const MenubarMenu = MenuPrimitive.Root;

const MenubarPortal = MenuPrimitive.Portal;

const MenubarGroup = MenuPrimitive.Group;

const MenubarSub = MenuPrimitive.SubmenuRoot;

const MenubarRadioGroup = MenuPrimitive.RadioGroup;

const menuPopupClasses =
  "max-h-[var(--available-height)] min-w-32 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

const menuItemClasses =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Trigger>) {
  return (
    <MenuPrimitive.Trigger
      className={cn(
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground data-[pressed]:bg-accent data-[pressed]:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  sideOffset = 8,
  alignOffset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof MenuPrimitive.Positioner>,
    "sideOffset" | "alignOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      {/* No side/align: menubar-parented positioners default to bottom/start. */}
      <MenuPrimitive.Positioner
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, "min-w-48", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItemClasses,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:[&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem
      className={cn(menuItemClasses, "pr-2 pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-inset={inset || undefined}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
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

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-inset={inset || undefined}
      className={cn(
        menuItemClasses,
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
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
        className="ml-auto size-4"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </MenuPrimitive.SubmenuTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-50">
        <MenuPrimitive.Popup
          className={cn(menuPopupClasses, "min-w-32", className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
```

- [ ] **Step 2: Demo**

`examples/menubar/menubar-demo.tsx`: `Menubar` with three `MenubarMenu`s — File (`MenubarTrigger`>File; content: New tab ⌘T, New window ⌘N, `MenubarSeparator`, `MenubarSub`>`MenubarSubTrigger`>Share>`MenubarSubContent` (Email link, Messages), `MenubarSeparator`, Print ⌘P), Edit (Undo ⌘Z, Redo ⇧⌘Z), View (`MenubarCheckboxItem defaultChecked`>Always show bookmarks, `MenubarCheckboxItem`>Always show full URLs, `MenubarSeparator`, Reload ⌘R). Demo registryDependencies: menubar URL only.

- [ ] **Step 3: Docs, registry items, standard verify, commit**

menubar.mdx links https://base-ui.com/react/components/menubar and /react/components/menu; API section notes: `Menubar` is a flat container (`role="menubar"`) taking `modal`/`orientation`/`loopFocus`; each `MenubarMenu` is a full Base UI `Menu.Root`; once a menu opens, hovering sibling triggers switches menus automatically (no `openOnHover` prop needed); menubar-parented content auto-positions bottom/start. Registry: menubar `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo per convention. Browser check: click File, hover Edit/View to confirm hover-switching, arrow keys move across triggers, submenu opens, Escape closes.

```bash
git add -A
git commit -m "feat(registry): add menubar component"
```

---

### Task 12: Toast

The riskiest item this wave: imperative API + viewport stacking. All facts below are verified against the installed 1.7.0 source; Step 1 re-checks them in place before writing code.

**Files:**
- Create: `registry/base/ui/toast.tsx`, `examples/toast/toast-demo.tsx`, `web/docs/components/toast.mdx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: `cn`, `Button` (demo).
- Produces: `Toaster` (render once at app root; renders Provider > Portal > Viewport > toast list) and `toast` — a sonner-style module-level API: `toast(title, options?)`, `toast.success(...)`, `toast.error(...)`, `toast.promise(promise, { loading, success, error })`, `toast.dismiss(id?)`. Base UI 1.7 facts: parts Provider/Viewport/Root/Content/Title/Description/Close/Action/Portal/Positioner/Arrow plus `useToastManager`/`createToastManager` on the `Toast` namespace; Provider props are ONLY `timeout` (default 5000), `limit` (default 3), `toastManager`; **the Viewport is positioned by OUR CSS** (`position: fixed` + edge offsets — no position prop exists); Root requires the `toast` object prop, `swipeDirection` default `['down','right']`; Close and Action render native `<button>` (Action renders null without actionProps; Title/Description render `<h2>`/`<p>` and auto-fill from `toast.title`/`toast.description`); stacking is driven by CSS vars `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-x/y` (Root) and `--toast-frontmost-height` (Viewport), with `data-expanded` set on hover/focus, `data-behind` on Content behind the front toast, `data-limited` on over-limit toasts (kept mounted + inert), `data-type` mirroring `toast.type`; the runtime freezes transitions inline while swiping (no CSS needed for that); F6 focuses the viewport; `createToastManager()` + Provider `toastManager` prop is the documented seam for a global `toast()` outside React; high-priority announcements read only the `title`/`description` STRINGS, so the API takes strings/ReactNode fields, not arbitrary JSX children.

- [ ] **Step 1: Re-verify the stacking recipe against the bundled docs**

Read `node_modules/@base-ui/react/docs/react/components/toast.md` — locate the main CSS-Modules demo's `.Toast` rule and the Tailwind variant of the same demo. Confirm the following against what you find (record any drift in the report): the `--gap`/`--peek`/`--scale`/`--shrink`/`--height`/`--offset-y` local-variable scheme; `data-[starting-style]` enter transform `translateY(150%)`; the ending transform guarded with `:not([data-limited]):not([data-swipe-direction])`; the `::after` hover bridge of height `calc(var(--gap) + 1px)`. Step 2's class strings encode exactly this recipe.

- [ ] **Step 2: Write registry/base/ui/toast.tsx**

```tsx
"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";

import { cn } from "@/registry/base/lib/utils";

const toastManager = ToastPrimitive.createToastManager();

type AddOptions = Parameters<typeof toastManager.add>[0];
type ToastOptions = Omit<AddOptions, "title" | "type">;

const toast = Object.assign(
  (title: React.ReactNode, options?: ToastOptions) =>
    toastManager.add({ title, ...options }),
  {
    success: (title: React.ReactNode, options?: ToastOptions) =>
      toastManager.add({ title, type: "success", ...options }),
    error: (title: React.ReactNode, options?: ToastOptions) =>
      toastManager.add({ title, type: "error", ...options }),
    promise: toastManager.promise,
    dismiss: (toastId?: string) => toastManager.close(toastId),
  },
);

function Toaster({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className={cn(
            "fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] sm:right-6 sm:bottom-6 sm:w-90",
            className,
          )}
          {...props}
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((toastItem) => (
    <ToastPrimitive.Root
      key={toastItem.id}
      toast={toastItem}
      className={cn(
        "absolute right-0 bottom-0 left-auto w-full rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg outline-none select-none",
        "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
        "z-[calc(1000-var(--toast-index))] h-[var(--height)] origin-[bottom_center]",
        "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
        "data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-[starting-style]:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-[ending-style]:opacity-0 data-[limited]:opacity-0",
        "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
      )}
    >
      <ToastPrimitive.Content className="flex w-full items-start gap-3 overflow-hidden transition-opacity duration-300 data-[behind]:opacity-0 data-[expanded]:opacity-100">
        {toastItem.type === "success" && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 size-4 shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        )}
        {toastItem.type === "error" && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 size-4 shrink-0 text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastPrimitive.Title className="text-sm leading-none font-medium" />
          <ToastPrimitive.Description className="text-sm text-muted-foreground" />
        </div>
        <ToastPrimitive.Action className="inline-flex h-7 shrink-0 items-center rounded-md border bg-transparent px-2 text-xs font-medium shadow-xs outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50" />
        <ToastPrimitive.Close
          aria-label="Close"
          className="shrink-0 rounded-xs text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

export { Toaster, toast };
```

(Swipe note: the Base UI runtime freezes the transition inline with `transition: none` while a swipe is in progress and drives `--toast-swipe-movement-x/y` live — no `data-[swiping]` CSS is needed on Root, unlike Drawer.)

- [ ] **Step 3: Demo**

`examples/toast/toast-demo.tsx` ("use client"): renders `<Toaster />` plus a `flex flex-wrap gap-2` row of four `Button variant="outline"` triggers: "Show toast" → `toast("Event created", { description: "Sunday, September 7 at 9:00" })`; "Success" → `toast.success("Changes saved")`; "Error" → `toast.error("Something went wrong")`; "Promise" → `toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), { loading: "Saving…", success: "Saved", error: "Failed to save" })`. Demo registryDependencies: toast + button URLs.

- [ ] **Step 4: Docs, registry items, standard verify, commit**

toast.mdx links https://base-ui.com/react/components/toast; API section documents: render `<Toaster />` once (e.g. next to your app root), call `toast`/`toast.success`/`toast.error`/`toast.promise`/`toast.dismiss` from anywhere (module-level `createToastManager` — works outside React, replaces sonner with zero third-party deps); options passthrough (`description`, `timeout`, `priority`, `actionProps`, `id` for upsert, `onClose`); stack shows 3 toasts (`limit` default), expands on hover/F6-focus, swipe down/right to dismiss; note high-priority screen-reader announcements read the `title`/`description` values. Registry: toast `registry:ui` deps `["@base-ui/react"]` regDeps utils URL; demo regDeps toast + button URLs. Browser check REQUIRED and extended: fire 4+ toasts, confirm stacked collapse (peek + scale) then hover-expand with offsets, auto-dismiss after 5s, close button, promise toast transitions loading→success, and the 4th toast marks the oldest `data-limited`.

```bash
git add -A
git commit -m "feat(registry): add toast component"
```

---

### Task 13: Docs navigation, changelog, release prep

**Files:**
- Modify: `blume.config.ts`, `CHANGELOG.md`, `web/docs/index.mdx`

**Interfaces:**
- Consumes: all Wave 3 component pages.

- [ ] **Step 1: Update navigation**

In `blume.config.ts`, insert the 11 new routes into the Components sidebar group, keeping the whole list alphabetical: alert-dialog, context-menu, dialog, drawer, dropdown-menu, hover-card, menubar, popover, sheet, toast, tooltip (final list = 41 alphabetical entries).

- [ ] **Step 2: Update CHANGELOG.md**

Prepend above the v0.2.0 entry:

```markdown
## v0.3.0 — Overlay wave

11 new components: dialog, alert-dialog, sheet, drawer, popover,
hover-card, tooltip, dropdown-menu, context-menu, menubar, toast.
Drawer uses the native Base UI Drawer primitive (no vaul) and toast
ships a sonner-style global `toast()` API on Base UI Toast (no
sonner). Also fixes the select/combobox popup scale transition.
```

- [ ] **Step 3: Update web/docs/index.mdx**

Update the component count/wording to reflect 41 components; mention the overlay set is complete (dialogs, sheets, gesture-driven drawer, menus, toast) with zero third-party overlay libraries.

- [ ] **Step 4: Full verify and commit**

```bash
pnpm typecheck && pnpm check:registry && pnpm build && pnpm test:smoke
# click through the new /docs/components/* pages via pnpm preview; confirm 41 sidebar links
git add -A
git commit -m "docs: add wave 3 navigation and changelog"
```

---

### Task 14: Deploy verification and v0.3.0 (post-merge)

**Files:** none in-repo.

- [ ] **Step 1:** After merge to main, push; Vercel auto-deploys (settings already in place).
- [ ] **Step 2:** Live check: `curl -s https://sevenui.dev/r/dialog.json | head -c 300` and `.../r/toast.json` return JSON; scratch-app `add @sevenui/dialog @sevenui/dropdown-menu @sevenui/toast` installs and typechecks (alert-dialog must pull button via its registryDependencies when added).
- [ ] **Step 3:** Human QA on the live site (portals + animations cannot be SSR-verified): dialog/sheet open-close animations, drawer swipe on a TOUCH device, dropdown/context/menubar keyboard navigation, tooltip hover + arrow placement in both themes, toast stacking/expand/swipe. Also re-check the two long-open wave 1 items (dark-mode toggle in preview iframes; progress hydration animation).
- [ ] **Step 4:** `git tag v0.3.0 -m "wave 3: overlay components" && git push origin v0.3.0`.

---

## Deferred (explicitly NOT in this plan)

- Drawer snap points, `SwipeArea` (swipe-to-open), Indent/IndentBackground scaling effect, `VirtualKeyboardProvider` — primitive supports them; wrap later if demand appears.
- Anchored toasts (`Toast.Positioner`/`Toast.Arrow`), custom toast positions prop, per-toast custom JSX rendering — v1 ships the bottom-right stack only.
- Menu `LinkItem` wrappers, detached-trigger `Handle`/`createHandle` APIs (dialog/popover/menu/tooltip), popover `Viewport` multi-trigger content animations, tooltip `trackCursorAxis` — available by composing the primitives directly; documented, not wrapped.
- Behavior unit tests: the spec earmarks tests for from-scratch behavior; every Wave 3 component is a style-only wrapper over Base UI-tested behavior (Base UI ships Drawer itself now), so this wave adds none. `command` in Wave 4 is where from-scratch tests land.
- Wave 4 (navigation & composite: tabs, accordion, collapsible, navigation-menu, scroll-area, toolbar, meter, command, sidebar) — next plan.
