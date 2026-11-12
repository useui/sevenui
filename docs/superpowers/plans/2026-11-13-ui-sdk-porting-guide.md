# UI SDK flavour: porting guide

**Date:** 2026-11-13
**For:** the engineers porting the remaining primitives to the UI SDK flavour, in parallel.
**Design:** `docs/superpowers/specs/2026-11-13-ui-sdk-flavour-design.md`. **ADR:** `docs/adr/0002-ui-sdk-second-flavour.md`.
**UI SDK version:** `@ui-sdk/react` and `@ui-sdk/core` `0.1.0-beta.1`, pinned exactly in `packages/registry/package.json`.

Everything below was checked against the installed package and the pilot ports. Where something was not checked, it says so.

## 0. The rules in one screen

1. **Edit one file only:** `packages/registry/registry/ui-sdk/ui/<name>.tsx`. You may also add flavour-aware expectations to `packages/registry/tests/<name>.test.tsx`, and append rows to §8 of this guide.
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
  registry.ui-sdk.json            GENERATED at build time, git-ignored, never edit
scripts/ui-sdk-flavour.mjs        derives the flavour registry; build | sync | status
```

The generator reads each primitive's state from the files themselves:

| State | Meaning |
|---|---|
| **pending** | The flavour file is the untouched *seed*: the base file with `@/registry/base/` rewritten to `@/registry/ui-sdk/`. Seeds exist so that every import resolves and the tree typechecks. `calendar`, `carousel` and `resizable` get **no** seed (their port is a rewrite), so for them "pending" means the file is absent. |
| **ported** | The file imports nothing UI SDK replaces. |
| **mirror** | A ported file whose base file imports nothing UI SDK replaces. It must stay a byte-identical retargeted copy of its base file: `kbd`, `card`, `table`, `label`, `textarea`, `pagination`, `input-group`, and so on. |
| **blocked** | Ported, but a registryDependency is not ported yet. It is left out of `/r/ui-sdk/` until that dependency is ported, so the published flavour is always a closed graph. Today `input-group` is blocked on `input`. |

These states fail `pnpm check:registry`:
- a seed that has been edited but still imports a replaced library (a half-done port);
- a mirror that drifted from its base file;
- a seed for `calendar`, `carousel` or `resizable`;
- a `.tsx` file that belongs to no primitive;
- an `@/registry/base/` import inside the flavour tree.

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
6. **Run the gates:** `pnpm check:registry`, `pnpm typecheck`, `pnpm test`, `pnpm lint`.
   - The export-freeze test compares your file's exports with the base file's exports exactly.
7. **Look at it in a real browser** (§7) if the primitive has a popup, layout, focus movement or animation.
8. **Append any divergence to §8.**
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
| `DirectionProvider` | Should set `dir` on a wrapper and keep `useDirection` working. Not ported yet. |
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
| tooltip | closed content unmounted | closed content mounted with `hidden` | keeps `aria-describedby` valid |
| tooltip | `TooltipProvider` groups tooltips and owns `timeout` | a context of default delays; `timeout` ignored | UI SDK groups without a provider |
| tooltip | `delay`/`closeDelay`/`closeOnClick` on the trigger | reported to the root (`delay`, `closeDelay`, `closeOnPress`) | UI SDK sets them on the root |
| tooltip | `trackCursorAxis`, `disableHoverablePopup` | accepted, ignored | no UI SDK counterpart |
| tooltip | hover close on pointer leave | closes once the pointer moves elsewhere (so it can reach the popup) | UI SDK behaviour |
| tooltip | trigger rendered through a `Button` keeps `data-slot="button"` | gets `data-slot="tooltip-trigger"` | the UI SDK part's slot reaches the render element; not adapted (one example styles `data-[slot=button]`) |
| select | `items` value→label map (array or record) | converted to `itemToLabel`; a `value: null` entry becomes `placeholder` | UI SDK `items` is list data that overrides rendered items |
| select | opening by pointer highlights nothing | highlights the first or selected option and moves focus into the list a tick later | UI SDK behaviour |
| select | `SelectScrollUp/DownButton` | render `null` | no scroll arrows; the list scrolls |
| select | `SelectLabel` = group label | `SelectGroupLabel` with slot `select-label` | UI SDK's `SelectLabel` labels the select |
| select | `SelectValue` children `(value)` | unwrapped from `(state)` | API shape |
| dropdown-menu | item `onClick`, `closeOnClick` | `onSelect`, `closeOnSelect`; the handler receives the selecting event (pointer, keyboard or a synthetic `select` event), not a React `MouseEvent` | UI SDK API |
| dropdown-menu | `openOnHover`, `closeDelay`, `orientation`, `disabled` on the root | accepted, ignored | no UI SDK counterpart |
| dropdown-menu | checkbox item has no `value` | a generated `useId()` value unless one is passed | UI SDK identifies checkbox items in the menu's `onCheckedChange` |
| registry | examples (`/r/demo/*`, `/r/component/*`) depend on `/r/<x>.json` | installing an example into a UI SDK project pulls the **base** primitive | examples are not flavoured yet (spec §9) |
| breadcrumb, button-group, item, marker, bubble, attachment, layer-card | `useRender` state → `data-*` (`data-slot`, `data-variant`, `data-size`, …; a `true` boolean as an empty attribute) | the same attributes set explicitly in the first `mergeProps` source; `layer-card-panel` keeps its slot last | `renderElement` derives no attributes |
| button-group, item | `ButtonGroupSeparator`/`ItemSeparator` pass `data-slot` to `Separator` | the slot is set through `render` on the rendered element | UI SDK ignores a `data-slot` prop on a part (§4.1) |
| direction | `DirectionProvider` is context only and adds no element | context **plus** a `<div dir style="display: contents">` wrapper (no `dir` without a `direction` prop); `useDirection` reads the context as before | UI SDK reads the computed direction from the page, not from React context |
| sidebar | `SidebarMenuButton` tooltip hidden with `hidden` on the popup while expanded or mobile | `disabled` on the `Tooltip` root, plus `hidden` (only ever set, never cleared) so a tooltip already open when the sidebar expands disappears | UI SDK manages `hidden` on closed content; `disabled` does not close an open tooltip |
| sidebar | `SidebarMenuButton` with `tooltip` keeps `data-slot="sidebar-menu-button"` on the trigger | same, put back on the rendered element through the trigger's `render` | the tooltip trigger part would set `tooltip-trigger` |
| sidebar | `SidebarInput`/`SidebarSeparator` pass `data-slot` to `Input`/`Separator` | the slot is set through `render` (Input's type has no `render`, so it is passed untyped) | the flavour `Input` and `Separator` drop a caller's `data-slot` |
| context-menu | `finalFocus` takes a boolean, a ref, or a function returning a boolean | mapped: `true` keeps the default, `false` → `"none"` (or the focused element, from a function), a ref is read when the menu closes | UI SDK's `finalFocus` takes a target, `"none"` or a function returning an element |
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
| command | `autoHighlight="always"`: the first item is highlighted on mount | the first item is highlighted once the input is used | UI SDK behaviour |
| batch 4 (separator, tabs, accordion, collapsible, scroll-area, progress, meter, avatar, toggle, toggle-group, toolbar) | a caller's `data-slot` replaces the wrapper's default | same, set on the rendered element through `render` | UI SDK ignores a `data-slot` prop on its parts |
| tabs | selected tab has `data-active` | `data-active` added beside UI SDK's `data-selected` | the classes and 38 example classNames style `data-active` |
| tabs | `activateOnFocus` (default false) and `loopFocus` on `TabsList` | reported up to the root as `activation` (`"manual"` unless set) and `loop` | UI SDK sets them on the root |
| tabs | `value` typed `any`; `value` beside `defaultValue` lets `value` win | `any` kept; `defaultValue` dropped when `value` is set | examples hand the value to typed setters; UI SDK throws on both |
| tabs | `Tabs.Indicator` from `@base-ui/react/tabs` inside a SevenUI `TabsList` | not usable: it needs Base UI's Tabs context; UI SDK's `TabsIndicator` takes the same `--active-tab-*` variables | `demos/tabs/tabs-indicator.tsx`, `components/tabs/tabs-05.tsx` |
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
| avatar | image unmounted until it loads, and on error | `<img>` rendered at once (and kept after an error), visually hidden with `aria-hidden` until loaded; no `data-starting-style` fade (`components/avatar/avatar-05.tsx` loses its fade-in) | UI SDK renders the image server-side so it can load before hydration |
| avatar | `onLoadingStatusChange` on `AvatarImage` | forwarded to the root's callback | UI SDK reports the status on the root |
| toggle-group | `orientation` only sets `data-orientation` (Base UI keeps left/right arrows) | passed to UI SDK, so a vertical group moves with up/down; `loopFocus` → `loop` | UI SDK reads orientation for keys and `data-orientation` |
| toolbar | `ToolbarButton render={<Toggle />}` | renders the `Toggle` directly with the button's props and classes | a UI SDK toggle joins the toolbar itself; through a toolbar button it registered twice and the toolbar lost its tab stop. The flavour toolbar imports the flavour toggle |
| toolbar | parts have no `data-slot` | UI SDK's `toolbar`, `toolbar-button`, … slots appear | UI SDK sets them; harmless |
| popover, hover-card | trigger `openOnHover`/`delay`/`closeDelay` (popover), `delay`/`closeDelay` (hover card) | reported to the root, as in `tooltip.tsx` | UI SDK sets them on the root |
| popover, hover-card | root children as a function of `{ payload }` | supported: the payload comes from `onPayloadChange` | UI SDK's root takes plain children (`hover-card-07` uses it) |
| popover, alert-dialog, sheet, drawer | `initialFocus`/`finalFocus` as a boolean, ref or function | mapped: `false` → `"none"`, a ref or function → a getter | UI SDK takes an element, selector or getter |
| alert-dialog, sheet, drawer | overlay slots `alert-dialog-overlay`, `sheet-overlay`, `drawer-overlay` | kept through `render`, plus `size-auto` | outside UI SDK's slot-keyed popover reset (§4.1) |
| sheet | Base UI Dialog | UI SDK `Dialog`, not `Drawer` | Drawer would add swipe physics and a full slide; the base sheet is a dialog with a 2.5rem CSS slide |
| sheet | `sheet-content` is a plain fixed panel | the content is `[popover]` outside the reset, so `inset-auto size-auto overflow-visible` are added before the side classes | UA popover `inset: 0` would pin it to the left, `fit-content` would shrink top/bottom sheets |
| sheet | a caller's `data-slot` (`sidebar`) on `SheetContent` | honoured through `render` | UI SDK ignores a data-slot prop |
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

### 9.4 Plain-markup primitives that have a UI SDK component (not changed yet; they stay mirrors)

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

**`pagination`.**
- UI SDK `Pagination` is stateful. It has `page`/`onPageChange`, `pageCount` or `total`+`pageSize`, `getHref`, and a `PaginationLink` that **requires `page`**. Links render as buttons without `getHref`. `data-current` replaces `data-active`. Steps get their own slots (`pagination-previous`/`-next`).
- **The API cannot stay identical** if UI SDK behaviour is used.
- All 9 component examples with Previous/Next hand-roll `href` + `onClick` + `aria-disabled` + `tabIndex`.
- Keeping the base API means keeping plain markup.

**`input-group`.**
- UI SDK has `InputGroup` and `InputClear` in `@ui-sdk/react/input`. It has no Addon, Button, Text or Textarea parts, no align variants and no `input-group-control` slot.
- The base API can be kept as wrapper markup around UI SDK `InputGroup` + `Input`. This is unverified on two points:
  - whether `role="group"` is rendered;
  - whether a caller's `data-slot` overrides `Input`'s own.
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
