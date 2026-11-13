# UI SDK flavour: porting guide

**Date:** 2026-11-13
**For:** the engineers porting the remaining primitives to the UI SDK flavour, in parallel.
**Design:** `docs/superpowers/specs/2026-11-13-ui-sdk-flavour-design.md`. **ADR:** `docs/adr/0002-ui-sdk-second-flavour.md`.
**UI SDK version:** `@ui-sdk/react` and `@ui-sdk/core` `0.1.0-beta.1`, pinned exactly in `packages/registry/package.json`.

Everything below was checked against the installed package and the pilot ports. Where something was not checked, it says so.

## 0. The rules in one screen

1. **Edit one file only:** `packages/registry/registry/ui-sdk/ui/<name>.tsx`. You may also add flavour-aware expectations to `packages/registry/tests/<name>.test.tsx`, append rows to §8 of this guide, and keep `apps/web/lib/ui-sdk-notes.ts` in step with them (§2 step 8).
   - Never edit anything under `registry/base/`, `demos/`, `components/`, or the root `registry.json`.
   - There is no list of ported names to update. See §2.
2. **Keep the same public API as `registry/base/ui/<name>.tsx`:**
   - the same export names (a test enforces this);
   - the same prop names and value shapes;
   - the same `data-slot` values;
   - the same Tailwind classes wherever the attribute or variable exists.

   About 1,060 demo and gallery examples import `@/registry/base/ui/*`. The shadcn CLI rewrites that import to the user's `ui` alias, so the same example source has to work against either flavour.
3. **No replaced library in a ported file:** no `@base-ui/react`, `react-day-picker`, `embla-carousel-react` or `react-resizable-panels`.
   - Where UI SDK ships a component, build on it.
   - `chart` keeps `recharts`, and `message-scroller`/`questionnaire` keep `@shadcn/react`. UI SDK has no equivalent for these.
4. **Never retune a shadcn theme colour variable**, and never change what one paints.
5. **Commits:** Conventional Commits, English, with no trailers of any kind (see `AGENTS.md`).

## 1. Layout and states

```
packages/registry/
  registry/base/ui/<name>.tsx     the Base UI flavour (source of truth for the API)
  registry/ui-sdk/ui/<name>.tsx   the UI SDK flavour (your file)
  registry/ui-sdk/hooks/          flavour hooks (use-mobile.ts, mirrored)
  registry/ui-sdk/examples/{demos,components}/<primitive>/<file>.tsx
                                  example VARIANTS (overlays), §11
  ui-sdk-variants.lock.json       the original each variant was reviewed against (§11)
  registry.ui-sdk.json            GENERATED at build time, git-ignored, never edit
  .generated/ui-sdk/{demos,components}/
                                  GENERATED flavour example tree + its two
                                  registries, git-ignored, never edit (§11)
scripts/ui-sdk-flavour.mjs        derives the flavour registries and the example
                                  tree; build | examples | sync | review | status
```

The generator reads each primitive's state from the files themselves:

| State | Meaning |
|---|---|
| **pending** | The flavour file is the untouched *seed*: the base file with `@/registry/base/` rewritten to `@/registry/ui-sdk/`. Seeds exist so that every import resolves and the tree typechecks. `calendar`, `carousel` and `resizable` get **no** seed (their port is a rewrite), so for them "pending" means the file is absent. |
| **ported** | The file imports nothing UI SDK replaces. |
| **mirror** | A ported file whose base file imports nothing UI SDK replaces. It must stay a byte-identical retargeted copy of its base file: `kbd`, `card`, `table`, `pagination`, and so on. **Except** the names in `UI_SDK_PORTS` (`label`, `textarea`, `input-group`): plain markup in base that the flavour builds on a UI SDK component (§9.4). Their flavour file must import `@ui-sdk/react`; while it is still the seed copy they count as pending. |
| **blocked** | Ported, but a registryDependency is not ported yet. It is left out of `/r/ui-sdk/` until that dependency is ported, so the published flavour is always a closed graph. |

Every primitive is ported now, so the flavour must stay complete. These states fail `pnpm check:registry`:
- any primitive pending or blocked, or a published flavour that is not exactly the base primitive set;
- a seed that has been edited but still imports a replaced library (a half-done port). A replaced library counts in any import form: `from`, `import type`, `export … from`, a side-effect `import`, a dynamic `import()`, `typeof import()`, `require()`, a type reference;
- a mirror that drifted from its base file;
- a `UI_SDK_PORTS` file (`label`, `textarea`, `input-group`) that was edited but imports nothing from `@ui-sdk/react`;
- a seed for `calendar`, `carousel` or `resizable`;
- a `.tsx` file that belongs to no primitive;
- an `@/registry/base/` import inside the flavour tree;
- a `@ui-sdk/*` version that is not exact (no `^`, `~`, `>=`), in any workspace `package.json` or published item.

## 2. Porting one primitive, step by step

1. **See where things stand.** Run `node scripts/ui-sdk-flavour.mjs status`.
2. **Read the base file** `registry/base/ui/<name>.tsx`, and its test `tests/<name>.test.tsx`.
3. **Read UI SDK's docs for the component.** They are in `packages/registry/node_modules/@ui-sdk/react/docs/components/<name>.md`. Grep the headings (`## Composition`, `## Data Attributes`, `## API Reference`, `### Reasons`) rather than reading the whole page.
   - The `.d.ts` files in `node_modules/@ui-sdk/react/dist/<name>.d.ts` and `node_modules/@ui-sdk/core/dist/components/<name>/` are the API.
   - Never read `dist/*.js`.
4. **Rewrite `registry/ui-sdk/ui/<name>.tsx` on UI SDK.**
   - Start from the seed, so classes and comments stay identical.
   - Import from the per-component entries, for example `@ui-sdk/react/dialog`. There is no root import.
   - Use `React.ComponentProps<typeof Part>` for prop types where a part exports no props type.
   - Apply the patterns in §4. Keep the file `"use client"` if the base file is, or if you add a hook.
5. **Run the flavour tests for your primitive** (§6). Fix the port until they pass.
   - Where a test asserts a Base UI detail that legitimately differs, add a flavour-aware expectation (§6.2). Never weaken the base assertion.
   - A test that fails because the port is wrong is fixed in the port.
6. **Run the gates:** `pnpm check:registry`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm check:ui-sdk-compat`, `pnpm check:ui-sdk-notes`.
   - The export-freeze test compares your file's exports with the base file's exports exactly.
7. **Look at it in a real browser** (§7) if the primitive has a popup, layout, focus movement or animation.
8. **Append any divergence to §8, and keep the site's notes in step.** The UI SDK notes on each primitive page and in its `.md` mirror come from `apps/web/lib/ui-sdk-notes.ts`, where every §8 row is either named by a note or listed in `INTERNAL_ROWS` with the reason a reader would not notice it. `pnpm check:ui-sdk-notes` fails on a row covered by neither, on a note citing a row that no longer exists, and on any row edited since its note was last reviewed. After adding or editing a row, update the note (or `INTERNAL_ROWS`), then record the review: `node scripts/check-ui-sdk-notes.mjs review "<primitive column> | <start of the Base UI column>"`. When a fix removes a difference, say so in the row, and move it to `INTERNAL_ROWS`.
9. **Commit**, for example `feat(registry): port popover to the ui-sdk flavour`, with a body that says why.

You never mark anything as ported. The status, the published registry (`/r/ui-sdk/<name>.json`), its npm `dependencies` and its `registryDependencies` are all derived from the file when `pnpm build:registry` runs:
- `@ui-sdk/core` is added whenever `@ui-sdk/react` is imported;
- base registryDependencies are retargeted to `https://sevenui.dev/r/ui-sdk/<x>.json`, plus any `@/registry/ui-sdk/ui/<x>` import;
- the shared `theme`, `sevenui-tokens` and `animations` stay at `https://sevenui.dev/r/<x>.json`;
- "Base UI X primitive" in the description becomes "UI SDK X component".

If base changes under a seed, `node scripts/ui-sdk-flavour.mjs sync` re-seeds pending files and mirrors. It never touches a port.

## 3. Base UI → UI SDK mapping (verified)

### 3.1 Structure

| Base UI | UI SDK | Notes |
|---|---|---|
| `X.Portal` | none | Popups render in place, in the browser top layer (Popover API). Keep a SevenUI `XPortal` export as a pass-through fragment (`dialog.tsx`, `dropdown-menu.tsx`). |
| `X.Positioner` | none | `side`, `align`, `sideOffset`, `alignOffset`, `collisionPadding`, `arrowPadding`, `anchor`, `container`, `keepMounted` go on the Content part. `z-*` classes are inert but harmless; keep them for identical markup. |
| `X.Popup` | `XContent` | |
| `X.Backdrop` | `XBackdrop` | A backdrop is itself a `popover="manual"` element in the top layer. |
| `X.Arrow` | `XArrow` | It gets `data-side` and an inline `left`/`top`, so the base arrow classes work unchanged (verified in the tooltip). |
| `Tabs.Tab` | `TabsTab` | `TabsPanel`, `TabsIndicator` |
| Menu `SubmenuRoot`/`SubmenuTrigger` | `MenuSub`/`MenuSubTrigger`/`MenuSubContent` | A submenu must use `MenuSubContent`, not `MenuContent` (`dropdown-menu.tsx` `contentPart`). |
| Menu `CheckboxItemIndicator`/`RadioItemIndicator` | `MenuItemIndicator` | One indicator part for both. |
| Menu `Group`/`GroupLabel`/`Separator` | `MenuGroup`/`MenuGroupLabel`/`MenuSeparator` | |
| Context menu | `Menu` + `MenuContextTrigger` | |
| `PreviewCard` | `HoverCard` (`HoverCardTrigger`/`Content`/`Arrow`) | |
| `NumberField` | `NumberInput` (`NumberInputControl`, `Group`, `Increment`, `Decrement`, `ScrubArea`) | |
| `OTPField` | `OTPInput` (`OTPInputGroup`, `Slot`, `Separator`) | |
| `Radio`/`RadioGroup` | `@ui-sdk/react/radio`: `Radio`, `RadioGroup`, `RadioIndicator` | |
| `ToggleGroup` | `@ui-sdk/react/toggle`: `ToggleGroup`, `ToggleIcon` | |
| `CheckboxGroup` | `@ui-sdk/react/checkbox` | |
| `Fieldset` | `@ui-sdk/react/field`: `FieldSet`, `FieldLegend`, plus `Field`, `FieldControl`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup` | |
| Select `GroupLabel` | `SelectGroupLabel` | UI SDK's `SelectLabel` labels the whole select. SevenUI's `SelectLabel` is the group label (`select.tsx`). |
| Select `ScrollUpArrow`/`ScrollDownArrow` | none | The list scrolls natively. Keep the exports; they render `null`. |
| Select `Icon` | none | Render the chevron directly inside the trigger. |
| Select `List` | `SelectList` (optional) | Not needed: `SelectContent` is the listbox. |
| `Toast` (manager + `Toast.*`) | `toast()` imperative + `ToastRegion`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `createToaster`; `OverlayHost` from `@ui-sdk/react/overlays` | Hard. See §9. |
| `DirectionProvider` | none | UI SDK reads `dir` from the page. |
| `Form` | none | |
| `Meter`, `Progress` | `MeterTrack`/`MeterIndicator`/`MeterLabel`/`MeterValue`, `ProgressTrack`/`ProgressIndicator`/`ProgressLabel`/`ProgressValue` | |
| `ScrollArea` | `ScrollArea`, `ScrollAreaViewport`, `ScrollAreaContent`, `ScrollAreaScrollbar`, `ScrollAreaThumb`, `ScrollAreaCorner` | |
| `Toolbar` | `Toolbar`, `ToolbarButton`, `ToolbarGroup`, `ToolbarInput`, `ToolbarLink`, `ToolbarSeparator` | |
| `NavigationMenu` | `NavigationMenu`, `List`, `Item`, `Trigger`, `Content`, `Link`, `Indicator`, `Viewport` | |
| `Autocomplete` (command) | `@ui-sdk/react/command`: `Command`, `CommandInput`, `CommandList`, `CommandItem`, `CommandGroup`, `CommandGroupLabel`, `CommandEmpty`, `CommandSeparator`, `CommandShortcut`, … | |
| `Combobox` | `@ui-sdk/react/combobox`, with chips, clear, create and more | |
| `useRender` + `mergeProps` | `renderElement` + `mergeProps` from `@ui-sdk/react/primitive` | See §4.4. |

### 3.2 Props and callbacks

| Base UI | UI SDK | Pattern |
|---|---|---|
| `side: "inline-start" \| "inline-end"` | `"start" \| "end"` | Map them, and widen the prop type to accept the Base UI values (`toSide` in `tooltip.tsx`, `dropdown-menu.tsx`). |
| `(value, eventDetails)` callbacks | `(value, details)` with `details.reason`, `details.source`, `details.cancel()` | The same positional shape. **Reason strings differ** (for example `trigger-press`, `escape-key`, `outside-press`, `item-press`, `trigger-hover`, `close-press`). |
| Menu item `onClick` | `onSelect(event)` | Map `onClick` → `onSelect`. It runs for pointer and keyboard; `event.preventDefault()` keeps the menu open. |
| `closeOnClick` (menu items, tooltip trigger) | `closeOnSelect` on items, `closeOnPress` on the `Tooltip` root | `dropdown-menu.tsx`, `tooltip.tsx` |
| Tooltip `delay`/`closeDelay` on the **trigger**, and on the provider | on the **`Tooltip` root** | `tooltip.tsx` reports trigger values up through context. |
| Checkbox `indeterminate` + `checked: boolean` | `checked: true \| false \| "indeterminate"` | `checkbox.tsx` maps them and keeps `onCheckedChange(boolean)`. |
| Dialog `disablePointerDismissal` | `closeOnOutsidePress={false}` | `dialog.tsx` |
| Select `items` (label map: array or record, optional `value: null` placeholder entry) | `items` is the **list data**: it renders options and **overrides the rendered items' `disabled`**. Use `itemToLabel`. | `select.tsx` `readItems`. **Do not pass Base UI `items` through.** |
| `SelectValue` children `(value) => …` | children `(state) => …`, where `state.value` is the value | `select.tsx` |
| `nativeButton` | not needed | Accept and drop (`button.tsx`, `checkbox.tsx`). |
| Base UI-only root props (`trackCursorAxis`, `disableHoverablePopup`, `openOnHover`, `closeDelay` on a menu, `orientation`, the `timeout` group window) | none | Accept and drop for type parity, and record in §8. |
| `render` typed as Base UI's `ReactElement<unknown> \| ComponentRenderFn` | `RenderProp<State>` (`ReactElement<Record<string, any>> \| (props, state) => ReactElement`) | Widen `render` to also accept `React.ReactElement<unknown>`, so callers (including pending seeds such as `sidebar`) still compile. |
| `onClick(event)` on Button | `onClick(event, details)` typed with an `HTMLElement` event | `button.tsx` types it the Base UI way (a `<button>` event, optional `details`) and casts once. |

### 3.3 Data attributes and CSS variables

| Base UI | UI SDK |
|---|---|
| `data-starting-style`, `data-ending-style`, `data-highlighted`, `data-checked`, `data-unchecked`, `data-disabled`, `data-pressed`, `data-orientation`, `data-side`, `data-align`, `data-instant`, `data-placeholder`, `data-open`/`data-closed` on content | Same. |
| `data-popup-open` on a trigger | `data-open`/`data-closed`. **The flavour also adds `data-popup-open`** (§4.2), because 22 example files style it. |
| Tooltip trigger state | None. UI SDK gives a tooltip trigger no state attribute. The flavour adds `data-popup-open`. |
| `data-indeterminate` | Same, on both checkbox and indicator. |
| Checkbox root | `<button role="checkbox">` plus a hidden `<input type="checkbox">` sibling. |
| `--anchor-width`, `--available-height`, `--transform-origin` | Same names, **set inline on the Content element itself**. `--available-height`/`--available-width` are registered **non-inheriting**, so a nested scroller must copy them, for example `[--list-h:var(--available-height)]` on the content and `max-h-(--list-h)` inside. |
| — | Also `--anchor-height`, `--arrow-offset`, `data-presentation`, `data-modality`, `data-nested` (submenu), `data-arrow-clamped`. |

Positioned popups get inline `position: fixed; inset: auto; margin: 0; left; top`. Inline styles beat classes, so `relative` on a popup is inert.

## 4. Adapter patterns from the pilots

### 4.1 `data-slot` convention (verified)

**SevenUI's `data-slot` values are public API and stay identical in both flavours.**

- **A `data-slot` prop on a UI SDK part is ignored.** The part renders its own slot. Verified for `DialogBackdrop`, `DialogContent` and `Button`.
- **A `data-slot` on the element that `render` returns wins.** So where the SevenUI slot differs from UI SDK's, set it through `render`:

```tsx
function withSlot<State>(slot: string, tag: string, render?: RenderProp<State>): RenderProp<State> {
  return (props, state) => renderElement(tag, { ...props, "data-slot": slot }, render, state);
}
<DialogBackdropPrimitive render={withSlot("dialog-overlay", "div", render)} … />
```

- `renderElement` still honours a caller's own `render`, element or function, so the caller's element and props win as in Base UI.
- `dropdown-menu.tsx` generalises this as `part(slot, tag, render, extra)`.
- Where the slots already match (`dialog-content`, `dialog-title`, `select-trigger`, `select-item`, `checkbox`, `checkbox-indicator`, `button`), passing `data-slot` as a prop is harmless documentation.

**The popover-reset trap.** UI SDK injects a reset for top-layer parts into `@layer ui-sdk`, keyed **by its own slot names**:

```css
:where([data-slot="dialog-backdrop"][popover], [data-slot="dialog-content"][popover],
       [data-slot="tooltip-content"][popover], …) { inset:auto; width:auto; height:auto;
       max-width:none; max-height:none; margin:0; padding:0; border:0; overflow:visible;
       color:inherit; background:none }
```

If you rename a slot that appears in that list, the element falls back to the UA `[popover]` style.
- Tailwind preflight already zeroes margin, padding and border.
- What is left is `width/height: fit-content`, `inset: 0`, `overflow: auto`, `color: CanvasText` and `background: Canvas`.
- Put back whichever of these your classes do not already set. `dialog.tsx` adds `size-auto` to the overlay.

To see the list for your component, mount it in a test and print `document.head` `<style>` elements containing `@layer ui-sdk`. Each component adds its rules on mount.

`tooltip-content` has no SevenUI slot in base, so UI SDK's slot stays.

**Known side effect.** When a trigger renders a SevenUI `Button` through `render`, the trigger part's own slot (`tooltip-trigger`) reaches the Button, where Base UI left the Button's `button` slot. Recorded in §8.

### 4.2 Trigger `data-popup-open`

```tsx
render={(p, state) => renderElement("button", { ...p, "data-popup-open": state.open ? "" : undefined }, render, state)}
```

Trigger state carries `open` for dialog, menu, submenu, select and tooltip. See `dialog.tsx`, `select.tsx`, `tooltip.tsx`, and `dropdown-menu.tsx` (`popupOpen`).

### 4.3 Providers and parts that disappear

| Part | What the flavour does |
|---|---|
| `TooltipProvider` | Becomes a context of default delays (`tooltip.tsx`). |
| `XPortal` | A fragment. |
| `SelectScrollUp/DownButton` | Render `null`. |
| `DirectionProvider` | Sets `dir` on a `display: contents` wrapper and keeps `useDirection` working (`direction.tsx`). |
| Parts that become irrelevant | Keep the export and keep its props in the type, so callers compile. |

### 4.4 Polymorphic markup (`useRender` → `renderElement`)

See `badge.tsx`. Base UI's `useRender` turns `state` into `data-*` attributes; `renderElement` does **not**. So set `data-slot` and any `data-<state>` attributes explicitly, in the first `mergeProps` source, so a caller can still override them:

```tsx
return renderElement("span", mergeProps({ "data-slot": "badge", "data-variant": variant, className: … }, props), render, state);
```

`renderElement` uses no hooks, so a Server Component can call it.

### 4.5 Props the caller may pass as a function

- UI SDK `className`, `style` and `children` can be functions of state.
- SevenUI wrappers that run `cn()` over `className` type it as `string`. Base did the same in practice.
- Where a wrapper appends its own children, as `DialogContent` does with the close button, narrow `children` to `ReactNode`.

## 5. The cascade layer

UI SDK adds its runtime CSS to `@layer ui-sdk`. If that layer is declared after Tailwind's layers, the reset beats every utility on a popup. In a real browser, an open dialog then rendered with `padding: 0`, a transparent background and `top: 0`.

What decides the layer's place:
- UI SDK prepends its `<style>` elements to `<head>`, so in a plain Next.js page the layer happens to come first.
- It does not come first when the styles arrive as constructed sheets (CSP mode without a nonce) or otherwise after the app's CSS.
- **Always declare it.**

| Where | How |
|---|---|
| The docs site | `apps/web/app/globals.css` line 3: `@layer ui-sdk;` above `@import "tailwindcss"`. |
| Consumers | shadcn can only *append* CSS. A `css: {"@layer ui-sdk": {}}` lands at the end of the file, which is too late. So every flavour item that imports UI SDK carries a `docs` string that `shadcn add` prints after install. The smoke test checks that it is printed. |

## 6. Tests

### 6.1 Running them

```bash
cd packages/registry
npx vitest run --project ui-sdk tests/<name>.test.tsx   # one primitive, UI SDK flavour
npx vitest run tests/<name>.test.tsx                    # one primitive, both flavours
npx vitest run --project base                           # base flavour only
pnpm test                                               # everything (root)
```

How the `ui-sdk` project works:
- It aliases `@/registry/base/ui/*` → `registry/ui-sdk/ui/*`.
- Its setup file is `tests/setup-ui-sdk.ts`: the jsdom stubs, plus `__UI_SDK_STRICT__`.
- It picks up a test file **once every primitive the file imports is ported**, so no file mixes the two flavours. A test that imports a pending primitive waits for it.
  - Moving a cross-primitive test to the other primitive's file is fine if the behaviour is the same. The Field + Checkbox labelling test moved to `field.test.tsx`.

The `base` project also runs `api-freeze`, which now requires every ported flavour file to export exactly what its base file exports.

### 6.2 Flavour-aware expectations

Use `tests/helpers/flavour.ts`. Add a helper there only when a difference is by design, and document why at the helper.

| Helper | Why it exists |
|---|---|
| `byFlavour({ base, "ui-sdk" })` | Picks an expectation per flavour. Example in `select.test.tsx`: opening by pointer highlights nothing in Base UI but highlights the first option in UI SDK, so `ArrowDown` lands one option later. |
| `isUiSdk` | Branches an assertion. Example in `select.test.tsx`: there is no Positioner wrapper in UI SDK; the content itself is `[popover]`. |
| `expectClosed(el)` | Base UI unmounts a closed popup. UI SDK keeps some closed content mounted with `hidden`; a tooltip keeps it so `aria-describedby` always resolves. |
| `movePointerAway(user, el)` | UI SDK keeps a hover popup open until the pointer moves somewhere else, so the pointer can travel onto the popup. `user.unhover` alone sends no move. |
| `waitForPopupFocus(popup)` | UI SDK moves focus (and a listbox's highlight) into a popup a tick after it opens. Keys pressed before that race it, and the result varied from run to run. |

### 6.3 jsdom notes

- `__UI_SDK_STRICT__ = true` is set, but the "trigger has no accessible name" warning that a real browser logs did **not** fire in jsdom. Strict mode is not a name check; assert names yourself.
- Closed tooltip content is in the DOM. `getByText` finds it; `getByRole` does not.

## 7. Real-browser check

The lab-route recipe below is how the pilots were checked:
1. Put a throwaway route at `apps/web/app/<anything>/page.tsx` that imports `@/registry/ui-sdk/ui/<name>`.
2. Run `npx next dev -p <port>` in `apps/web`.
3. Open it, and check computed styles in the console.
4. **Delete the route** before you commit.

Check these:
- placement and the arrow;
- full-screen backdrops;
- padding and background on top-layer content;
- keyboard paths;
- `data-popup-open` on triggers.

`@source "../../../packages/registry/registry"` already covers the flavour tree, so its classes are generated.

## 8. Divergence table (append a row per divergence)

Which examples each row affects is recorded in `packages/registry/ui-sdk-compat.json`, generated by `scripts/check-ui-sdk-compat.mjs` (`pnpm check:ui-sdk-compat`). It typechecks every example's flavour source (its variant if it has one, §11) as a project that installed the flavour sees it, and classifies each as `ok`, `differs` (a row here applies; the script's `DIFFERS` rules cite the row) or `variant` (`replaces` lists what the original hits). An example whose flavour source does not typecheck fails the check. When you add a row that changes how an example behaves, add a rule there and run `node scripts/check-ui-sdk-compat.mjs --write`.

| Primitive | Base UI behaviour / API | UI SDK flavour | Why |
|---|---|---|---|
| all popups | `XPortal` portals to `body` | pass-through fragment; content in the top layer in place | UI SDK has no portals |
| all popups | `side` accepts `inline-start`/`inline-end` | mapped to `start`/`end` | UI SDK naming |
| all popups | Positioner wrapper element (`isolate z-50`) | none; the Content is `[popover]` and carries inline position | UI SDK has no Positioner |
| all popups | trigger `data-popup-open` | `data-open`/`data-closed`, **plus** `data-popup-open` added by the flavour | examples style `data-popup-open` |
| all | callback `details.reason` strings | UI SDK reason strings | different libraries |
| button | `nativeButton` | accepted, ignored | UI SDK detects it |
| badge | `useRender` state → `data-*` | explicit `data-slot`/`data-variant` | `renderElement` derives no attributes |
| checkbox | `indeterminate` prop | mapped to `checked="indeterminate"`. Uncontrolled + `indeterminate` stays mixed until the prop clears (Base UI toggled a hidden checked state) | UI SDK has one tri-state `checked` |
| checkbox | `inputRef`, `uncheckedValue`, `parent` (Base UI) | `parent` exists in UI SDK; `inputRef` and `uncheckedValue` are not mapped (0 example uses) | not needed yet |
| dialog | `DialogOverlay` is a plain div | a top-layer popover with slot `dialog-overlay` plus `size-auto` | keeps SevenUI's slot (§4.1) |
| dialog | `DialogFooter` close button has `data-slot="button"` | same, forced on the render element | otherwise UI SDK's `dialog-close` would replace it |
| dialog, alert-dialog, sheet | popup has `data-nested-dialog-open` while a nested dialog is open | `data-nested-dialog-open` added beside UI SDK's `data-nested-open` (from `state.nestedOpen`) | dialog-10 styles it |
| tooltip | closed content unmounted | closed content mounted with `hidden` | keeps `aria-describedby` valid |
| tooltip | `TooltipProvider` groups tooltips and owns `timeout` | a context of default delays; `timeout` ignored (tooltip-07 and -08 set it) | UI SDK groups without a provider, for a fixed moment |
| tooltip | `delay`/`closeDelay`/`closeOnClick` on the trigger | reported to the root (`delay`, `closeDelay`, `closeOnPress`) | UI SDK sets them on the root |
| tooltip | `trackCursorAxis` | the trigger records the pointer and the content anchors to a box at the pointer on the tracked axis (UI SDK re-reads an `anchor` on every check; checked in Chrome on tooltip-08: the bubble centres on the pointer) | UI SDK has no cursor tracking |
| tooltip | `disableHoverablePopup` | `pointer-events-none` on the content, as Base UI sets `pointer-events: none` on its popup: moving onto it leaves the trigger and closes the tooltip (checked in Chrome) | UI SDK keeps a tooltip open while the pointer travels onto it |
| tooltip | hover close on pointer leave | closes once the pointer moves elsewhere (so it can reach the popup) | UI SDK behaviour |
| tooltip | trigger rendered through a `Button` keeps `data-slot="button"` | gets `data-slot="tooltip-trigger"` | the UI SDK part's slot reaches the render element; not adapted (0 examples style `data-[slot=button]`; checked 2026-11-13) |
| select | `items` value→label map (array or record) | converted to `itemToLabel`; a `value: null` entry becomes `placeholder` | UI SDK `items` is list data that overrides rendered items |
| select | opening by pointer highlights nothing | highlights the first or selected option and moves focus into the list a tick later | UI SDK behaviour |
| select | `alignItemWithTrigger` (default on) lays the selected item over the trigger, or the **first** item while nothing is selected | UI SDK aligns only a selected item (else opens below), and any `anchor` turns its alignment off; so the flavour anchors the content to a zero-height box where its top must go for the selected or first enabled item to sit centred on the trigger, with `sideOffset` 0. No room, or a touch open: the trigger box plus `sideOffset` (normal placement). Checked in Chrome on select-demo: identical item positions to base with and without a selection, and the same fallback near the viewport top (base's popup there is 5px lower, its items are not) | UI SDK has no placeholder alignment |
| select | `SelectScrollUp/DownButton` | render `null` | no scroll arrows; the list scrolls |
| select | `finalFocus` on `SelectContent`; grouped `items` (`{ items: [...] }[]`) | `finalFocus` accepted, ignored; group items are read for labels | UI SDK's select always returns focus to its trigger and has no focus option |
| select | `SelectLabel` = group label | `SelectGroupLabel` with slot `select-label` | UI SDK's `SelectLabel` labels the select |
| select | `SelectValue` children `(value)` | unwrapped from `(state)` | API shape |
| dropdown-menu | item `onClick`, `closeOnClick` | `onSelect`, `closeOnSelect`; the handler receives the selecting event (pointer, keyboard or a synthetic `select` event), not a React `MouseEvent` | UI SDK API |
| dropdown-menu | `openOnHover`, `closeDelay`, `orientation`, `disabled` on the root | accepted, ignored | no UI SDK counterpart |
| dropdown-menu | checkbox item has no `value` | a generated `useId()` value unless one is passed | UI SDK identifies checkbox items in the menu's `onCheckedChange` |
| registry | examples (`/r/demo/*`, `/r/component/*`) depend on `/r/<x>.json` | flavoured copies at `/r/ui-sdk/demo/*` and `/r/ui-sdk/component/*` depend on `/r/ui-sdk/<x>.json`; the base ones are unchanged | §11 |
| breadcrumb, button-group, item, marker, bubble, attachment, layer-card | `useRender` state → `data-*` (`data-slot`, `data-variant`, `data-size`, …; a `true` boolean as an empty attribute) | the same attributes set explicitly in the first `mergeProps` source; `layer-card-panel` keeps its slot last | `renderElement` derives no attributes |
| button-group, item | `ButtonGroupSeparator`/`ItemSeparator` pass `data-slot` to `Separator` | same: the flavour `Separator` lets a caller's `data-slot` win | no divergence left (the render workaround was removed once `separator` honoured the slot) |
| direction | `DirectionProvider` is context only and adds no element | context **plus** a `<div dir style="display: contents">` wrapper (no `dir` without a `direction` prop); `useDirection` reads the context as before | UI SDK reads the computed direction from the page, not from React context |
| sidebar | `SidebarMenuButton` tooltip hidden with `hidden` on the popup while expanded or mobile | `disabled` on the `Tooltip` root, plus `hidden` (only ever set, never cleared) so a tooltip already open when the sidebar expands disappears | UI SDK manages `hidden` on closed content; `disabled` does not close an open tooltip |
| sidebar | `SidebarMenuButton` with `tooltip` keeps `data-slot="sidebar-menu-button"` on the trigger | same, put back on the rendered element through the trigger's `render` | the tooltip trigger part would set `tooltip-trigger` |
| sidebar | `SidebarInput`/`SidebarSeparator` pass `data-slot` to `Input`/`Separator` | same: the flavour `Input` and `Separator` let a caller's `data-slot` win | no divergence left (the render workaround was removed once `input` and `separator` honoured the slot) |
| context-menu | `disabled`, `orientation`, `closeDelay` on the root | accepted, ignored | no UI SDK counterpart |
| menubar | `data-slot` passed to the `DropdownMenu*` parts | set by a `render` function over the dropdown-menu part's own | the dropdown-menu flavour sets its slot on the rendered element |
| navigation-menu | `Portal > Positioner > Popup > Viewport` (`--positioner-*`, `--popup-*`) | one `NavigationMenuViewport` top-layer popup sized by `--viewport-width/height`; the surface classes sit on it, so content's parent is the surface | UI SDK has one viewport element |
| navigation-menu | content `h-full w-auto`, sized by Base UI | `absolute top-0 start-0 h-auto w-max`, capped by a copied `--panel-h` | UI SDK measures the content to size the viewport; a viewport-relative height would loop |
| navigation-menu | link `active`, `closeOnClick` (default false) | `current` (plus `data-active`), `closeOnSelect={closeOnClick}` | UI SDK API |
| navigation-menu | `NavigationMenuIndicator` is Base UI's `Icon` | UI SDK `NavigationMenuIndicator` (sits under the open trigger via `--active-item-*`); `data-[state=…]` classes stay inert | no Icon part; 0 example uses |
| navigation-menu | root `actionsRef`; positioner `sticky`, `positionMethod`, `collisionBoundary`, `collisionAvoidance`, `disableAnchorTracking` | accepted, ignored | no UI SDK counterpart |
| combobox | `items` + function children on `ComboboxList`/`ComboboxCollection` | every item rendered from `items` (or `ComboboxGroup items`); UI SDK filters rendered items by `label`, and keeps filtered-out ones mounted with `hidden` | UI SDK `items` is list data that renders its own parts |
| combobox | `filter(item, query)`, `filter={null}`, `itemToStringLabel`/`itemToStringValue`, `inputValue`/`onInputValueChange`, `loopFocus`, `onItemHighlighted` | `filter(entry.value, query)`, `filter={false}`, `itemToLabel`/`itemToValue`, `query`/`onQueryChange`, `loop`, `onHighlight` | UI SDK naming; object items default to their `label`, else `value` |
| combobox | `ComboboxChip` without `value` (Base UI infers it) | `ComboboxValue` fills each chip's `value` by position in the selected values | UI SDK chips need their value |
| combobox | `ComboboxValue` children `(value)` | unwrapped from `(state)`; without children it shows `state.label` | API shape |
| combobox | `ComboboxContent anchor` as a ref | read through `{ getBoundingClientRect }` on every position check | UI SDK anchors take an element, selector or box |
| combobox | root `id`, `inputRef`, `actionsRef`, `openOnInputClick`, `highlightItemOnHover`, `autoComplete`, `limit`, `locale`, `grid`, `virtualized`, `inline`, `filteredItems` | accepted, ignored | no UI SDK counterpart (0 example uses) |
| command | Autocomplete root: `value`/`onValueChange` is the search text | mapped to `query`/`onQueryChange`; UI SDK's own `value` (the highlighted command) is not exposed | the examples drive the search text |
| command | choosing an item may fill the input (`details.reason === "item-press"`) | the query never changes on choosing, so the 8 examples' `item-press` guard simply never fires | UI SDK API |
| command | item `value` is any object; `filter(item, query)`; `mode="none"` | the item is keyed by a string (`itemToStringValue`, else `value`/`id`, else label) and mapped back for `filter`; `mode="none"`/`filter={null}` → `filter={false}`; default filter `"contains"` | UI SDK commands take string values; its default `"fuzzy"` matches differently |
| command | item `onClick` | `onSelect`, run for pointer and Enter | UI SDK API |
| command | filtered-out items and empty groups unmounted | kept mounted with `hidden` (`expectFilteredOut` in tests) | UI SDK behaviour |
| command | an item's own `aria-selected` (command-06 marks multi-selected labels) | replaced by UI SDK, which sets `aria-selected` from the highlight | UI SDK owns the option's ARIA state |
| command | `autoHighlight="always"`: the first item is highlighted on mount and after every query change | the same in a browser (checked in Chrome on command-demo and command-dialog: highlighted in the first frame, and back on the first match after typing); in jsdom UI SDK sets it a tick after mount | no divergence; the earlier row came from jsdom |
| batch 4 (separator, tabs, accordion, collapsible, scroll-area, progress, meter, avatar, toggle, toggle-group, toolbar) | a caller's `data-slot` replaces the wrapper's default | same, set on the rendered element through `render` | UI SDK ignores a `data-slot` prop on its parts |
| tabs | selected tab has `data-active` | `data-active` added beside UI SDK's `data-selected` | the classes and 38 example classNames style `data-active` |
| tabs | `activateOnFocus` (default false) and `loopFocus` on `TabsList` | reported up to the root as `activation` (`"manual"` unless set) and `loop` | UI SDK sets them on the root |
| tabs | `value` typed `any`; `value` beside `defaultValue` lets `value` win | `any` kept; `defaultValue` dropped when `value` is set | examples hand the value to typed setters; UI SDK throws on both |
| tabs | `Tabs.Indicator` from `@base-ui/react/tabs` inside a SevenUI `TabsList` | not usable: it needs Base UI's Tabs context; UI SDK's `TabsIndicator` takes the same `--active-tab-*` variables | `demos/tabs/tabs-indicator` and `components/tabs/tabs-05` have variants importing `TabsIndicator` from `@ui-sdk/react/tabs` (§11; position and transition match base in Chrome) |
| accordion | `orientation`, `loopFocus` on the root | accepted, ignored | no UI SDK counterpart |
| accordion, collapsible | open trigger has `data-panel-open` | `data-panel-open` added beside UI SDK's `data-open` | 27 example classNames style it (sidebar, collapsible, item) |
| accordion, collapsible | `value`/`open` beside `defaultValue`/`defaultOpen` | the default is dropped when the controlled prop is set | UI SDK throws on both |
| accordion | header `<h3>` has no `data-slot` | UI SDK's `accordion-header` slot removed | markup parity |
| scroll-area | scrollbar unmounted while its axis does not overflow (unless `keepMounted`) | mounted with `hidden`; root uses `type="auto"` | UI SDK keeps scrollbars mounted and marks a showing one `data-visible` |
| scroll-area | root `data-has-overflow-x/y`, `data-overflow-{x,y}-{start,end}` | derived from UI SDK state; the `x` edges are not set while both axes overflow | UI SDK state names the edges of one axis only |
| scroll-area | any number of `ScrollBar`s per axis | one per axis: a caller's `ScrollBar` replaces the root's own for that axis | UI SDK rejects two scrollbars with the same orientation |
| scroll-area | `overflowEdgeThreshold` | accepted, ignored | no UI SDK counterpart |
| progress, meter | `getAriaValueText(formatted, value)`; `Value` children `(formatted, value)`; `locale` any `Intl.LocalesArgument` | mapped onto `getValueLabel(value, { formatted })`, state children, and the first locale as a string | UI SDK API |
| progress | indeterminate bar announces `aria-valuetext="indeterminate progress"` | the flavour supplies the same text | UI SDK sets no text while indeterminate |
| avatar | image unmounted until it loads, and on error | `<img>` rendered at once (and kept after an error), visually hidden with `aria-hidden` until loaded | UI SDK renders the image server-side so it can load before hydration |
| avatar | the image mounts with `data-starting-style` for one frame once loaded | the wrapper sets `data-starting-style` on the image from the load until two frames later, so `data-[starting-style]:*` classes run (avatar-05's fade measured frame by frame in Chrome: the same opacity curve as base) | UI SDK has no starting style on the image |
| avatar | `onLoadingStatusChange` on `AvatarImage` | forwarded to the root's callback | UI SDK reports the status on the root |
| toggle-group | `orientation` only sets `data-orientation` (Base UI keeps left/right arrows) | passed to UI SDK, so a vertical group moves with up/down; `loopFocus` → `loop` | UI SDK reads orientation for keys and `data-orientation` |
| toolbar | `ToolbarButton render={<Toggle />}` | renders the `Toggle` directly with the button's props and classes | a UI SDK toggle joins the toolbar itself; through a toolbar button it registered twice and the toolbar lost its tab stop. The flavour toolbar imports the flavour toggle |
| toolbar | parts have no `data-slot` | UI SDK's `toolbar`, `toolbar-button`, … slots appear | UI SDK sets them; harmless |
| popover, hover-card | trigger `openOnHover`/`delay`/`closeDelay` (popover), `delay`/`closeDelay` (hover card) | reported to the root, as in `tooltip.tsx` | UI SDK sets them on the root |
| popover, hover-card | root children as a function of `{ payload }` | supported: the payload comes from `onPayloadChange` | UI SDK's root takes plain children (`hover-card-07` uses it) |
| dialog, alert-dialog, sheet, drawer, popover (`initialFocus`, `finalFocus`); dropdown-menu, menubar, context-menu (`finalFocus`) | a boolean, a ref, or a function of the interaction returning an element, `true`/`null` (the default) or `false`/nothing (leave focus) | one mapping, `toFocusTarget`, copied into each file: `true` → default, `false` → `"none"`, a ref or function → a getter. A function returning `false` or nothing hands back the focused element, because a getter cannot say `"none"`: when focus is still inside the closing popup, UI SDK then falls back to the trigger, where Base UI left focus behind. A field the action mounts still keeps focus (tested on the dropdown menu, the pattern sidebar-04 and context-menu-14 use). The interaction argument is always `"mouse"` | UI SDK takes an element, selector, `"none"` or a getter returning an element |
| alert-dialog, sheet, drawer | overlay slots `alert-dialog-overlay`, `sheet-overlay`, `drawer-overlay` | kept through `render`, plus `size-auto` | outside UI SDK's slot-keyed popover reset (§4.1) |
| sheet | Base UI Dialog | UI SDK `Dialog`, not `Drawer` | Drawer would add swipe physics and a full slide; the base sheet is a dialog with a 2.5rem CSS slide |
| sheet | `sheet-content` is a plain fixed panel | the content is `[popover]` outside the reset, so `inset-auto size-auto overflow-visible` are added before the side classes | UA popover `inset: 0` would pin it to the left, `fit-content` would shrink top/bottom sheets |
| sheet | a caller's `data-slot` (`sidebar`) on `SheetContent` | honoured through `render` | UI SDK ignores a data-slot prop |
| drawer | `initialFocus` default: the popup itself, for every input type | the same: the flavour's default initial focus is the popup element, so a pointer open shows no focus style on the first control and Tab moves to it (checked in Chrome; dialog, alert-dialog, sheet and popover already matched base: first tabbable control, no ring on a pointer open except on inputs, which match `:focus-visible` in both) | UI SDK focuses the first tabbable control |
| drawer | `swipeDirection` | mapped to `side` (`down` → `bottom`, `up` → `top`) | UI SDK naming |
| drawer | the popup is `fixed` and moved by Base UI's transform variables (swipe movement, snap offset, closed transform, stack height) | a flex child of UI SDK's own viewport, moved by UI SDK's `translate`; those classes are dropped. Nesting pushes back with `scale` from `--drawer-stack` | UI SDK slides the sheet itself |
| drawer | `data-nested-drawer-open`, `data-swiping`, `data-modal` on the viewport | the first two mirrored from UI SDK's `nestedOpen`/`dragging` onto the popup; `data-modal` set on the popup (UI SDK's viewport takes no props) | keeps the base classes working |
| drawer | overlay opacity from `--drawer-swipe-progress` | opacity driven inline by UI SDK; the opacity/transition classes are dropped | UI SDK manages backdrop opacity |
| drawer | a non-modal drawer closes on an outside press | `closeOnOutsidePress` is always passed (`!disablePointerDismissal`) | UI SDK closes a non-modal drawer only when asked |
| toast | `createToastManager()` (Base UI store) | a manager of the same shape (`add`/`close`/`update`/`promise`) around a UI SDK `createToaster()`; the toast object rides in the UI SDK toast's `data` | UI SDK's toaster API differs |
| toast | `<ToastViewport>` children map `useToastManager().toasts` | the viewport is a `ToastRegion`, which renders its children once per toast; each `<Toast toast>` renders only for the toast being rendered | UI SDK renders toasts through a per-toast children function |
| toast | `timeout: 0`, `priority: "high"`, `type` any string | `duration: Infinity`, `"assertive"` (else `"polite"`, errors included), `data-type="default"` for unknown types (the object keeps the original `type`) | UI SDK option names |
| toast | Base UI stack variables (`--toast-offset-y`, `--toast-frontmost-height`, `--toast-swipe-movement-x/y`) and content `data-behind` | defined from UI SDK's `--toast-offset`, `--toast-front-height`, `--toast-swipe-x/y`; `data-behind`/`data-expanded` set on the content from the toast's state | the base classes stay unchanged |
| toast | toasts over `limit` stay mounted with `data-limited` | wait in UI SDK's queue unrendered (still listed by `useToastManager()` outside the viewport) | UI SDK `maxVisible` |
| toast | Toast root is a `div`; `swipeDirection` per toast | an `li` in the region's `ol`; `swipeDirection` accepted, ignored (UI SDK swipes toward the region's edge: bottom-end) | UI SDK markup and behaviour |
| toast | `onRemove` after the exit animation; `positionerProps` (anchored toasts) | `onRemove` runs with `onClose` on dismissal; `positionerProps` accepted, ignored | no UI SDK counterpart (0 example uses) |
| toast | `ToastAction` without `actionProps` | a plain button, since UI SDK renders its action part only for a toast with an action; with `actionProps` it is UI SDK's part with `dismiss={false}` | Base UI's action never closes the toast |
| toast | viewport slot `toast-viewport` | kept through `render`, plus `top-auto overflow-visible bg-transparent text-inherit` | outside UI SDK's slot-keyed popover reset |
| popover, hover-card | `onOpenChange` details: `event` always present | typed as present (Base UI's type), but undefined at runtime for controller changes | `hover-card-06` reads `event.event.target` after checking the reason |
| drawer | snap points typed `number \| string` | accepted as such and cast to UI SDK's `SnapPoint` (`px`, `rem`, `%`, `"content"`), the strings Base UI accepts | UI SDK narrows the string type |
| drawer | content height `var(--drawer-height,auto)`, where Base UI measures `--drawer-height` | the same fallback, but UI SDK sets no `--drawer-height`, so only a caller's value applies (drawer-12 caps the sheet with it) | UI SDK sizes the sheet itself |
| input, textarea, label | a caller's `data-slot` replaces the default | same, set through `render` (a `data-slot` prop on the UI SDK part is ignored) | wrappers re-slot them (`sidebar-input`, `input-group-control`) |
| input, textarea | `value` may be a number or an array | turned into text | UI SDK holds a string |
| textarea | native `onSubmit` accepted (never fires on a textarea) | accepted and dropped | UI SDK's `onSubmit` is a submit shortcut with another signature |
| input-group | `InputGroup` is a plain `div role="group"` | UI SDK `InputGroup` (pressing its text focuses the field) plus `role="group"` from the wrapper | UI SDK renders no role |
| field | `validate`, `validationMode`, `validationDebounceTime`, `actionsRef` run by Base UI Field | run by the wrapper: it reads the control's value, keeps the message, and forces UI SDK's `invalid` while a validator fails; a bare `FieldError` shows that message. Native constraints (`required`, `type`, `pattern`) are UI SDK's own and show after a submit attempt | UI SDK validates natively and has no `validate` |
| field | `validate` (onSubmit mode) blocks a native submit through Base UI's form state | blocks only inside SevenUI `Form`; a field with `validate` in a plain `<form>` validates on change once shown, but does not stop the native submit | no `setCustomValidity`, to avoid a second, native copy of the message |
| field | `dirty`, `touched` mark every part | mirrored as `data-dirty`/`data-touched` on the root only | UI SDK has no such state |
| field | `FieldError match="valid"` | never shown | UI SDK has no `valid` flag |
| field | parts carry `data-valid`, `data-touched`, `data-dirty`, `data-filled`, `data-focused` | UI SDK's `data-invalid`, `data-valid`, `data-focused`, `data-required`, `data-disabled`; the control gets `data-filled` | different libraries; one example styles `[data-slot=input-group-control][data-valid]` |
| field | `FieldLabel` renders SevenUI `Label` | UI SDK `FieldLabel` with the label's classes merged in | the field label must be UI SDK's to wire the control |
| form | Base UI `Form` (values from registered fields, `errors` cleared on change, `noValidate`) | a native `<form>` adapter: same `onFormSubmit(values, details)`, `errors`, `validationMode`, `actionsRef`; synchronous validators block the submit and focus the first invalid field; values come from the fields (checkbox/switch → boolean, radio → value, number field → number); native constraint errors are left to the browser + UI SDK, so the form is not `noValidate` | UI SDK has no Form; `details` is `{ reason: "none", event }` |
| radio-group | `value` of any type | stringified | UI SDK radio values are strings |
| radio-group | `inputRef` | accepted, ignored | UI SDK renders its own hidden inputs |
| switch | Enter toggles | Enter submits the form, only Space toggles | UI SDK follows the native checkbox |
| switch | `uncheckedValue` submitted while off | a hidden input with `uncheckedValue`, rendered beside the thumb while the switch is off, named and enabled | UI SDK submits nothing while off |
| switch | `inputRef`, `nativeButton` | accepted, ignored | no UI SDK counterpart (0 example uses) |
| slider | `onValueCommitted`, `minStepsBetweenValues` | mapped to `onValueCommit`, `minStepsBetweenThumbs` | UI SDK naming |
| slider | `thumbAlignment="edge"` (the default) keeps thumbs inside the track by measuring them | UI SDK centres a thumb on `--slider-thumb-position`; the wrapper adds `translate: calc(50% - position)` (RTL mirrored; vertical `translate: -50% position`), a share of the thumb's **own** size, so every thumb size works, examples' `size-4` overrides included. `thumbAlignment="center"` drops it | checked in Chrome at 0/50/100 %, ranges, vertical and RTL: thumb boxes match base to the pixel (in RTL base's own thumb sits a thumb-width off its indicator; the flavour's centres on it) |
| slider | the indicator ends at the thumb's centre; a press on the track maps through the inset travel | the indicator ends at the value's share of the track, under the thumb (at most half a thumb from base's end, always covered by the opaque thumb); a press maps through the whole track, so the value lands up to half a thumb's share away (17 vs 18 at 60px of 332px); pressing a thumb itself does not jump | UI SDK places the indicator and reads presses against the track |
| slider | range input carries `aria-valuenow`; each thumb's input `min`/`max` are the slider's | the native range input exposes its value; inputs of a range are bounded by their neighbours | UI SDK behaviour |
| slider | `thumbCollisionBehavior`, `locale` objects, `inputRef` | accepted; only a string `locale` is passed on | no UI SDK counterpart |
| number-field | root `id` and `inputRef` belong to the input | handed to `NumberFieldInput` through context | UI SDK's root is the wrapping div |
| number-field | `allowWheelScrub`, `onValueCommitted`, `step="any"` | `wheel`, `onValueCommit`, no step | UI SDK naming |
| number-field | `allowOutOfRange`, `snapOnStep` | accepted, ignored: UI SDK always clamps and snaps a committed value | no UI SDK counterpart |
| number-field | parts have no `data-slot` | UI SDK's `number-input-*` slots appear | UI SDK sets them; harmless |
| input-otp | one `<input>` per slot, numbered by order | one native input laid over slot boxes; the wrapper numbers `InputOTPSlot`s by their order on the page (an explicit `index` also works) | UI SDK's model; screen readers meet one input |
| input-otp | slots style `focus:*` | the same classes plus `data-active:*` on the slot typing goes to, and a drawn caret (`animate-pulse`) in the empty active slot | the slot boxes never take focus |
| input-otp | `length`, `validationType`, `onValueComplete` | `maxLength`, `pattern` (`numeric`→`digits`, `alpha`→`letters`, `none`→any), `onValueCommit` | UI SDK naming |
| input-otp | `normalizeValue`, `mask` | applied by the wrapper (the value is held by the wrapper when `normalizeValue` is set; `mask` draws `•`) | no UI SDK counterpart |
| input-otp | `onValueInvalid`, `autoSubmit` | accepted, ignored | no UI SDK counterpart |
| input-otp | root `aria-invalid` styles the group through `has-aria-invalid` | goes to the native input, which sits outside the groups, so the group ring does not show; a slot's own `aria-invalid` still works | UI SDK puts aria on the input |
| input-otp | paste fills the slots | **UI SDK bug (0.1.0-beta.1):** with `__UI_SDK_STRICT__` its dev check throws on its own `paste` reason and the paste is lost; without strict it is a console warning and paste works | test marked `it.fails` for the flavour |
| calendar | `Date` / `DateRange {from,to}` / `Date[]` values, `month`/`defaultMonth`/`onMonthChange` as `Date` | same; converted to and from ISO strings (local calendar date) | UI SDK values are ISO strings |
| calendar | react-day-picker selection rules: a range press extends the range (`addToRange`, `min`/`max` nights, `excludeDisabled`, `resetOnSelect`); multiple `min`/`max`/`required` | the same rules, applied by the wrapper: a range press cancels UI SDK's anchor (`onAnchorChange`) and sets the controlled value | keeps every range example working; so there is no UI SDK hover preview or Escape for an unfinished range (react-day-picker has neither) |
| calendar | a half range `{from, to: undefined}` (`min` > 0) | emitted as in base; shown to UI SDK as `[from, from]` | UI SDK has no half-range value |
| calendar | `required` single date pressed again (pointer, Enter or Space) calls `onSelect` with the same date | the same: the day's own `onClick`/`onKeyDown` call `onSelect` when the selected day is pressed again | UI SDK reports changes only |
| calendar | day is a `<td>` holding a `<button>` named "Friday, June 12th, 2026" | the `<td role="gridcell">` is the focusable day, named "Friday, June 12, 2026", with `aria-selected="false"` on unselected days; the styled day inside is `<span data-slot="calendar-day-button">` (base: `data-slot="button"`) | APG grid; no nested button |
| calendar | disabled day = disabled `<button>` | `aria-disabled` gridcell, still focusable | UI SDK keeps unavailable days discoverable |
| calendar | styles that target the day's inner `button` (`[&>button]:…` in `modifiersClassNames`, the `day` class's `_button` selectors) | do not match; the wrapper's own `day` class targets `[data-slot=calendar-day-button]` instead | calendar-05, -14 and -15 have variants that target `[&>[data-slot=calendar-day-button]]` (§11) |
| calendar | `startMonth`/`endMonth` limit navigation, and the outside days past them are hidden (empty `data-hidden` cells) | mapped to `min`/`max` for navigation and keys, and the outside days past them render as the same empty cells | UI SDK would show them as days that cannot be picked |
| calendar | outside days of a shown month | focusable with `tabIndex=-1` (set by the wrapper) | UI SDK strict mode throws for a rendered day `<td>` without tabindex; UI SDK itself leaves them out |
| calendar | `rdp-*` class names, `data-focused`, `data-month` | none; week numbers are `[data-slot=calendar-week-number]` / `-header` | not faked |
| calendar | `locale` (date-fns object) | only `code` and `options.weekStartsOn` are read | UI SDK takes a locale string |
| calendar | `animate` | accepted, ignored | no month animation |
| calendar | `components` beyond `DayButton`, `formatters`/`labels` beyond the mapped ones, `hidden`, `showWeekNumber` custom `WeekNumber`, `timeZone`, `onDayClick`, `styles` | not in the type | no honest mapping (0 example uses) |
| calendar | `DateRange` type imported from `react-day-picker` by examples | the flavour file exports `type DateRange` (and `Matcher`, `Modifiers`); the 5 examples that import it have variants importing it from the flavour calendar (§11) | react-day-picker is not in a UI SDK project |
| carousel | embla `CarouselApi` | a shim over the UI SDK controller: `scrollTo`, `scrollPrev/Next`, `canScrollPrev/Next`, `selectedScrollSnap`, `previousScrollSnap`, `scrollSnapList` (length exact, values evenly spaced), `scrollProgress`, `on`/`off` for `select`, `reInit` (page count changed) and `settle` | UI SDK has a controller, not embla |
| carousel | `opts` | `align` (string), `loop`, `dragFree`, `skipSnaps`, `slidesToScroll`→`slidesPerPage`, `startIndex`→`defaultPage`, `watchDrag` (boolean)→`drag`; `axis`, `containScroll`, `duration` accepted and ignored; `breakpoints`, function `align`/`watchDrag`, `plugins` not in the type | no UI SDK equivalent |
| carousel | Previous/Next natively `disabled` at the ends | `aria-disabled` + `data-disabled`, still focusable, dimmed with `aria-disabled:opacity-50` | UI SDK keeps focus from dropping |
| carousel | `-ml-4` on the row and `pl-4` on slides | the row's negative margin is moved onto the scroller in a layout effect and the scroller is clipped back with `clip-path`; slides then line up exactly as embla's (checked in Chrome: 0px offset on every page, 6 pages for 8 thirds like embla's 6 snaps) | a native scroller cannot scroll into the part of the row a negative margin pushes out |
| carousel | no name required | an unnamed carousel gets `aria-label="Carousel"` | UI SDK strict mode requires the region to be named |
| carousel | arrow keys anywhere in the region | arrow keys in the viewport (also Up/Down when vertical) are UI SDK's; elsewhere in the region the wrapper pages with Left/Right as base did. An `onKeyDownCapture` override (carousel-07) no longer stops paging from the viewport | UI SDK owns viewport keys |
| carousel | `useCarousel()` returns embla's `carouselRef` | not returned | embla-only |
| carousel | slides out of view | `inert` and `aria-hidden` | UI SDK behaviour |
| resizable | layout map keyed by panel id, bare number = pixels, `"50"` = percent | converted to UI SDK's array and units; panel ids are read from the DOM; `em`/`vh`/`vw` sizes are dropped | UI SDK reads a bare number as percent |
| resizable | `onLayoutChange`/`onLayoutChanged(map, {isUserInteraction})`, both on mount | emulated: both fire once the first layout is known, keys/collapse/calls report `onLayoutChanged` at once, a drag on release | UI SDK reports only changes, and commits keys on key-up |
| resizable | arrow key step | 5%, as react-resizable-panels | UI SDK defaults to 1% |
| resizable | `groupRef`/`panelRef` handles, panel `onResize` | shims over the UI SDK controller; `onResize` from a ResizeObserver on the panel, percent from the controller | UI SDK has a controller |
| resizable | `data-group="true"`, `data-panel="true"`, separator `data-separator` (`disabled`, `active` while dragged, `focus`, `hover`, `inactive`) | the same attributes, `data-separator` derived from UI SDK's handle state (`disabled`, `dragging`, `hovering`) and the handle's focus (hover and focus checked in Chrome on resizable-02) | examples style them (resizable-02, -06, -07) |
| resizable | `flex-grow` sizing, inner content wrapper | `--resizable-panel-size` flex basis, one element per panel (`overflow: auto` inline); `setLayout` writes the sizes at once | resizable-05 animates `flex-grow`: its variant animates `flex-basis` and turns the transition on with `flushSync` before `setLayout` (§11) |
| resizable | group `data-slot="resizable-panel-group"` | kept (UI SDK's is `resizable`) | SevenUI slot |
| resizable | `disableCursor`, `resizeTargetMinimumSize`, panel `disabled`/`groupResizeBehavior`, separator `disableDoubleClick` | not in the type | no UI SDK counterpart (0 example uses) |
| resizable | `usePanelRef`, `useGroupRef`, `Layout`, `PanelImperativeHandle`, `GroupImperativeHandle` imported from `react-resizable-panels` by 6 examples | the flavour exports matching types (`Layout`, `ResizablePanelHandle`, `ResizablePanelGroupHandle`, …) but no hooks; the 6 examples have variants using the types and `React.useRef` (§11) | react-resizable-panels is not in a UI SDK project |

## 9. Third-party wrappers and plain-markup primitives: evidence for the open decisions

**Decision (user, 2026-11-13).** In the flavour, `calendar`, `carousel` and `resizable` must use `@ui-sdk/react/calendar`, `carousel` and `resizable` instead of react-day-picker, embla and react-resizable-panels.

**Still open.** The public API of those three is not settled. The facts below are for that discussion.

**Method.** Counts are **files**, given as `demos / components`. The corpus is 148 demos and 915 gallery examples. Counts were taken with a JSX attribute scan plus grep (2026-11-13).

### 9.1 Calendar (react-day-picker 10 → `@ui-sdk/react/calendar`)

**Base surface.**
- Exports: `Calendar` (all `DayPicker` props plus `buttonVariant`) and `CalendarDayButton`.
- Wrapper defaults: `showOutsideDays`, `captionLayout="label"`.
- The `classNames` and `components` maps are merged, caller keys last.
- Values are `Date`, `DateRange {from,to?}` or `Date[]`.

**UI SDK offer.**
- Parts: `Calendar`, `CalendarPrevious`, `CalendarNext`, `CalendarHeading`, `CalendarMonthSelect`/`YearSelect`, `CalendarGrid`, `CalendarWeekdays`, `CalendarWeekday`, `CalendarWeeks`, `CalendarDay` (a `td` gridcell, **no inner button**).
- Values are **ISO strings**: `ISODate | ISODate[] | [start,end]`, and months are `"YYYY-MM"`.
- A controller is available.

| DayPicker API | UI SDK | Status |
|---|---|---|
| `mode` | `mode` | direct |
| `selected`/`onSelect` | `value`/`onValueChange` | adapter (Date↔ISO, `{from,to}`↔`[a,b]`). **A partial range is not emitted** (`onAnchorChange` only) |
| `month`/`defaultMonth`/`onMonthChange` | same names, `"YYYY-MM"` | adapter |
| `startMonth`/`endMonth` | `min`/`max` | adapter. These also limit selection |
| `disabled` matchers | `unavailable` (+ `disabled` for the whole calendar) | adapter (`dayOfWeek`→`weekday`). Unavailable days stay focusable |
| `required` | `deselectable` (inverted) | adapter |
| `numberOfMonths` | `months` | direct |
| `showOutsideDays`, `fixedWeeks`, `weekStartsOn` | same | direct |
| `locale` (date-fns object), `formatters` | `locale: string`, `weekdayFormat`, `monthFormat` | partial |
| `captionLayout="dropdown"` | Month/Year select parts | adapter |
| `classNames` map | per-part `className` | partial |
| `modifiers` + `modifiersClassNames` | none | adapter via `CalendarDay` `className(state)` |
| `components.DayButton` | `CalendarDay` children | partial. The DOM differs |
| `showWeekNumber`, `ISOWeek`, `footer`, `labels`, `animate` | none | no built-in |
| range `min`/`max`, `excludeDisabled` | `minDays`/`maxDays`, `allowUnavailable` | adapter, with an off-by-one and semantics to check |

**Usage.**
- Imports: 2 / 20.
- `react-day-picker` type imports: 1 / 4 (`DateRange`).
- Per-prop counts:

| Prop | demos / components |
|---|---|
| `mode`, `selected`, `onSelect` | 2 / 20 |
| `defaultMonth` | 2 / 15 |
| `disabled` | 0 / 14 |
| `startMonth` / `endMonth` | 0 / 10, 0 / 9 |
| `modifiers` + `modifiersClassNames` | 0 / 7 |
| `classNames` | 0 / 6 |
| `month` / `onMonthChange` | 0 / 5, 0 / 4 |
| `required` | 0 / 5 |
| `showOutsideDays` | 1 / 4 |
| `components` (DayButton) | 0 / 2 |
| `numberOfMonths` | 1 / 1 |
| `captionLayout`, `weekStartsOn`, `fixedWeeks`, `showWeekNumber`, `footer`, `labels`, `animate`, `hideNavigation`, range `min`, `excludeDisabled` | 0 / 1 each |

- 4 of 5 range examples read a partial range.
- 3 files style RDP's inner `<button>`.

**Assessment.**
- About 11 of 22 files need only the mapped props.
- 11 use modifiers, a custom DayButton, week numbers, a footer and so on. These need a heavy adapter or flavour-specific examples.

### 9.2 Carousel (embla 8 → `@ui-sdk/react/carousel`)

**Base surface.**
- Exports: `CarouselApi` (embla), `Carousel` (`opts`, `plugins`, `orientation`, `setApi`), `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `useCarousel`.

**UI SDK offer.**
- Parts: `Carousel` → `CarouselViewport` → `CarouselContent` → `CarouselItem`, plus `CarouselPrevious`/`Next`, `CarouselIndicatorGroup`/`Indicator` and `CarouselPlayToggle`.
- It uses native scroll-snap. Pages are 1-based.
- `createCarouselController()` provides `getPage`, `setPage`, `next`, `previous`, `canNext`, `canPrevious`, `play` and `pause`.

| embla API | UI SDK | Status |
|---|---|---|
| `orientation` | `orientation` | direct |
| `opts.align` (string) | `align` | direct |
| `opts.loop` | `loop` | direct |
| `opts.dragFree` | `dragFree` | direct |
| `opts.skipSnaps` | `skipSnaps` | direct |
| `opts.slidesToScroll` | `slidesPerPage` | direct |
| `opts.startIndex` | `defaultPage` (+1) | adapter |
| `opts.watchDrag:false` | `drag={false}` | direct |
| `containScroll`, `duration`, `breakpoints` | none | no equivalent |
| `plugins` | none; autoplay is built in | no equivalent |
| `setApi`/`CarouselApi` | controller | adapter shim for `scrollTo`, `selectedScrollSnap`, `scrollNext`, `on("select")`; `on("reInit")` has none |
| `useCarousel` | none | no equivalent |
| Prev/Next native `disabled` | `aria-disabled`, stays focusable | behaviour change |

**Usage.**
- Imports: 1 / 14. Direct embla imports: 0 / 0.
- Per-API counts:

| API | demos / components |
|---|---|
| `opts` | 0 / 13 |
| `align` | 0 / 8 |
| `startIndex` | 0 / 3 |
| `loop` | 0 / 2 |
| `slidesToScroll`, `dragFree`/`containScroll`, `duration`/`watchDrag` | 0 / 1 each |
| `setApi`/`CarouselApi` | 0 / 8 (`scrollTo` 7, `selectedScrollSnap` 6, `on`/`off` 5, `scrollNext` 2) |
| `useCarousel` | 0 / 0 |
| `plugins` | 0 / 0 |

**Assessment.**
- 6 files map directly; 1 maps with an index conversion.
- 8 need an embla-API shim or rewrites. 2 of those use options with no equivalent.
- The `-ml-4`/`pl-4` gap convention under scroll-snap is unverified.

### 9.3 Resizable (react-resizable-panels 4 → `@ui-sdk/react/resizable`)

**Base surface.**
- Exports: `ResizablePanelGroup` (`orientation`, `defaultLayout` map, `onLayoutChange(map)`, `onLayoutChanged(map, {isUserInteraction})`, `groupRef`), `ResizablePanel` (`defaultSize`/`minSize`/`maxSize`/`collapsedSize`, `collapsible`, `id`, `onResize`, `panelRef`) and `ResizableHandle` (`withHandle`).
- **A bare number means pixels in rrp.**

**UI SDK offer.**
- Parts: `Resizable`, `ResizablePanel`, `ResizableHandle`.
- Sizes: a number means **percent**, or `"N%"`, `"Npx"`, `"Nrem"`.
- `defaultLayout` is `number[]`; `onLayoutChange(number[])` and `onLayoutCommit` are available.
- A controller provides `getLayout`, `setLayout`, `collapse`, `expand`, `isCollapsed` and `resize(id)`.
- Plus `autoSaveId`/`storage`, `data-collapsed` and `--resizable-panel-size`.

| rrp API | UI SDK | Status |
|---|---|---|
| names | `Resizable`/… | adapter keeps the base names. The group slot differs (`resizable` vs `resizable-panel-group`) |
| `orientation`, `collapsible` | same | direct |
| group/handle `disabled` | same | direct |
| `"N%"`/`"Npx"` sizes | same | direct. Bare numbers flip meaning |
| `defaultLayout` map | array | adapter (id→index) |
| `onLayoutChange`/`onLayoutChanged` | `onLayoutChange`/`onLayoutCommit` (arrays) | adapter |
| `groupRef`/`panelRef` | controller | adapter |
| panel `onResize` | none per panel | adapter from the group change. Pixels need measuring |
| panel `disabled`, `disableDoubleClick`, `resizeTargetMinimumSize` | none | no equivalent (0 uses) |

**Usage.**
- Imports: 1 / 14, all three exports in each.
- Direct rrp imports: 0 / 6 (`usePanelRef`, `useGroupRef`, handle types).
- Per-API counts:

| API | demos / components |
|---|---|
| `defaultSize` | 1 / 14 (every value is a `%` string, **0 bare numbers**) |
| `minSize` | 0 / 14 |
| `maxSize` | 0 / 5 |
| `collapsible` | 0 / 3 |
| `id` | 0 / 11 |
| panel `onResize` | 0 / 5 (`inPixels` in 2) |
| `panelRef` | 0 / 3 |
| `groupRef` | 0 / 3 |
| `onLayoutChange` | 0 / 3 |
| `onLayoutChanged` | 0 / 2 |
| `withHandle` | 1 / 11 |

**Assessment.**
- 5 files port directly.
- 10 need callback, ref or map adapters. 2 need pixel measurement.
- 1 depends on rrp's `[data-panel]` DOM.

### 9.4 Plain-markup primitives that have a UI SDK component

**Decision (2026-11-13).** `label` → UI SDK `Label`, `textarea` → UI SDK `Textarea`, and `input-group` → wrapper markup around UI SDK `InputGroup` + the flavour `Input`/`Textarea`, all with the base API kept. They are listed in `UI_SDK_PORTS` in `scripts/ui-sdk-flavour.mjs`, so they are real ports, not mirrors. `pagination` stays a mirror. The evidence below is as it was gathered, followed by what the ports found.


**`label`.**
- UI SDK `Label` is the same native `<label data-slot="label">`. It adds `aria-labelledby` wiring for non-labelable controls (radio group, slider) and no text selection on double-click.
- **The API can stay identical.**
- It needs `"use client"`, which base already has.
- Its value depends on the targets being UI SDK controls.
- Usage: 28 / 192 files; `htmlFor` 22 / 165.

**`textarea`.**
- UI SDK `Textarea` is the same native element and slot. It adds `onValueChange`, `autoResize`, `submitShortcut`, a controller, and `data-filled`/`-disabled`/`-readonly`/`-required`.
- **Mostly identical. Blockers:**
  - It needs `"use client"` (base has none).
  - `value`/`defaultValue` narrow to `string`.
  - `onSelect` is not in the type.
  - `onSubmit` changes signature.
- Usage of the narrowed props: `onSelect`/`onSubmit` 0 / 0, `value` 0 / 35, `onChange` 0 / 34.
- **As ported:** the wrapper keeps `React.ComponentProps<"textarea">`. A number or array `value` is turned into text; `onSelect` is passed on and fires (tested); the native `onSubmit` is dropped, because a submit event never reaches a `<textarea>` in either flavour, while passing it would make it UI SDK's submit shortcut. All 35 examples typecheck unchanged.

**`pagination`.**
- UI SDK `Pagination` is stateful. It has `page`/`onPageChange`, `pageCount` or `total`+`pageSize`, `getHref`, and a `PaginationLink` that **requires `page`**. Links render as buttons without `getHref`. `data-current` replaces `data-active`. Steps get their own slots (`pagination-previous`/`-next`).
- **The API cannot stay identical** if UI SDK behaviour is used.
- All 9 component examples with Previous/Next hand-roll `href` + `onClick` + `aria-disabled` + `tabIndex`.
- Keeping the base API means keeping plain markup.

**`input-group`.**
- UI SDK has `InputGroup` and `InputClear` in `@ui-sdk/react/input`. It has no Addon, Button, Text or Textarea parts, no align variants and no `input-group-control` slot.
- The base API can be kept as wrapper markup around UI SDK `InputGroup` + `Input`. The two open points, **verified in jsdom:**
  - UI SDK `InputGroup` renders **no** `role`; a `role="group"` passed to it is kept, so the wrapper passes it.
  - A `data-slot` prop on UI SDK `Input`/`Textarea` is ignored, so the flavour `Input`, `Textarea` and `Label` set the slot through `render` with the caller's value winning; `input-group-control` survives. The `combobox` and `input-group` flavour tests pass on it.
- `combobox` and `command` style its slots, and 3 examples do too.
- Usage: 5 / 53.

## 10. Proposed batches

Each primitive is in exactly one batch. Hard ones are marked ⚠.

| Batch | Primitives | Notes |
|---|---|---|
| 1. Overlays | popover, hover-card, alert-dialog, sheet, drawer, toast ⚠ | Copy the dialog patterns. `sheet` = dialog plus side classes. `toast` is a module-level `toast()` API on Base UI's manager; UI SDK is `toast()` + `ToastRegion`/`OverlayHost`. Map the SevenUI toast API, which is sonner-style. |
| 2. Menus and lists | context-menu, menubar, navigation-menu ⚠, combobox ⚠, command ⚠ | `menubar` depends on dropdown-menu (ported). `command` depends on dialog and input-group. `combobox` depends on input-group, so it waits for `input`. `navigation-menu` has a shared viewport and indicator. |
| 3. Form controls | input (first: it unblocks input-group), field ⚠, form, radio-group, switch, slider, number-field, input-otp | `field`: Base UI Field validation and `FieldError match` vs UI SDK Field. There is no UI SDK Form. `number-field` → NumberInput. `input-otp` → OTPInput. |
| 4. Disclosure, layout, display | separator (first: field, button-group, item and sidebar depend on it), tabs, accordion, collapsible, scroll-area, progress, meter, avatar, toolbar, toggle, toggle-group | Mostly small. `accordion`/`collapsible` carry `cssVars`/`css` (panel height): check UI SDK's panel height variable. |
| 5. Polymorphic markup and composites | breadcrumb, button-group, item, marker, bubble, attachment, layer-card, direction, sidebar ⚠ | `useRender` → `renderElement` (§4.4). `sidebar` depends on button, input, separator, sheet, skeleton and tooltip, so it goes last. `direction` keeps `useDirection` and sets `dir`. |
| 6. Third-party rewrites (API decision pending) ⚠ | calendar ⚠, carousel ⚠, resizable ⚠ | Start only after §9's API discussion closes. Their examples may need flavour-specific variants. |

## 11. Examples in the flavour: variants and the generated tree

Every demo and gallery example is published in the flavour too, as `/r/ui-sdk/demo/<name>.json` and `/r/ui-sdk/component/<name>.json` (`npx shadcn add @sevenui/ui-sdk/demo/<name>`, `@sevenui/ui-sdk/component/<name>`). Nothing under `demos/` or `components/` changes for it.

**The rule.** An example's flavour source is the overlay file at the mirrored path, `registry/ui-sdk/examples/<demos|components>/<primitive>/<file>.tsx`, if one exists; otherwise the original file. `@/registry/base/ui/` (and `/hooks/`) imports are then retargeted to `@/registry/ui-sdk/`. The docs site renders its flavour previews from the same rule, so do not move the overlay tree.

**When to write a variant.** Only when the example cannot work unchanged: it imports a library UI SDK replaces (`pnpm check:ui-sdk-compat` fails and names the path), or a §8 difference can only be removed in the example. Fix the flavour primitive instead whenever the difference is a port shortfall. A variant is the same example — the same content, look and behaviour — with only what the flavour needs changed. It imports primitives as `@/registry/ui-sdk/ui/<x>`.

| Variant | What changes |
|---|---|
| `demos/calendar/calendar-range`, `components/calendar/calendar-04`, `-10`, `-12` | `DateRange` from the flavour calendar instead of `react-day-picker` |
| `components/calendar/calendar-15` | the same, plus `[&>button]` → `[&>[data-slot=calendar-day-button]]` |
| `components/calendar/calendar-05`, `-14` | `[&>button]` → `[&>[data-slot=calendar-day-button]]` in `modifiersClassNames` |
| `components/resizable/resizable-04` | `PanelImperativeHandle` → `ResizablePanelHandle` from the flavour resizable |
| `components/resizable/resizable-08` | `GroupImperativeHandle` → `ResizablePanelGroupHandle` |
| `components/resizable/resizable-05` | the same, plus `transition-[flex-grow]` → `transition-[flex-basis]` and `flushSync(() => setAnimating(true))` before `setLayout`, so the preset change animates (frame-sampled in Chrome: the same curve as base) |
| `components/resizable/resizable-10`, `-14` | `usePanelRef()` → `React.useRef<ResizablePanelHandle \| null>(null)` |
| `components/resizable/resizable-13` | `Layout` and `ResizablePanelGroupHandle` from the flavour resizable; `useGroupRef()` → `React.useRef<ResizablePanelGroupHandle \| null>(null)` |
| `demos/tabs/tabs-indicator`, `components/tabs/tabs-05` | `TabsIndicator` from `@ui-sdk/react/tabs` instead of Base UI's `Tabs.Indicator`; their published items depend on `@ui-sdk/react` |

**Keeping a variant current.** A variant is a copy, so an edit to its original does not reach it by itself. `packages/registry/ui-sdk-variants.lock.json` records the SHA-256 of the original each variant was last reviewed against. When an original changes, `build`, `pnpm check:registry`, `pnpm check:ui-sdk-compat` and `status --strict` fail and name the variant (the `examples` refresh behind `pnpm dev` and `pnpm typecheck` only warns, so a running dev server keeps working). Carry the change into the variant, then record the review with `node scripts/ui-sdk-flavour.mjs review <demos|components>/<primitive>/<file>.tsx`. A new variant needs the same command; a lock entry without a variant fails too. Paths are named one by one on purpose: there is no "accept all".

**What is derived** (`node scripts/ui-sdk-flavour.mjs examples`, also run by `build`, `build:registry`, root `pnpm dev` and `pnpm typecheck`; root alias `pnpm ui-sdk:examples`):
- `packages/registry/.generated/ui-sdk/{demos,components}/<primitive>/<file>.tsx`: every example's flavour source, imports retargeted. The docs site's live previews import from here.
- `packages/registry/.generated/ui-sdk/{demos,components}/registry.json`: the same item names and files as the original registries; `registryDependencies` retargeted to `https://sevenui.dev/r/ui-sdk/<x>.json` (shared `theme`/`sevenui-tokens`/`animations` unchanged); npm `dependencies` recomputed from the flavour source's imports. `build:registry` builds them to `apps/web/public/r/ui-sdk/demo/` and `apps/web/public/r/ui-sdk/component/`.
- An example that truly cannot exist in the flavour goes in `EXCLUDED_EXAMPLES` in `scripts/ui-sdk-flavour.mjs` with its reason; the checks print it. There are none.

**Guards.** `check-registry` validates the two registries in memory (complete, closed, retargeted dependencies, content = overlay or original), rejects an overlay that mirrors no registered example, imports `@/registry/base/`, or only retargets imports. `check-ui-sdk-compat` typechecks the flavour sources with the replaced libraries unresolvable and the original of every variant beside it; it fails on any example that does not typecheck, and on a variant whose original needed nothing. The smoke test installs `ui-sdk/demo/command-demo`, `ui-sdk/component/accordion-01` and the variants `ui-sdk/demo/calendar-range` and `ui-sdk/component/tabs-05` into the UI SDK consumer, typechecks it, and asserts no base primitive or replaced library arrives.
