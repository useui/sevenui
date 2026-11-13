// What a reader of a primitive page would notice when the UI SDK flavour is selected: the differences
// from Base UI that change behaviour, markup they might style, or props that are accepted but ignored.
// The primitive pages (components/flavour/ui-sdk-primitive-note.tsx) and their .md mirrors
// (lib/docs/serialize-md.ts) both read this file.
//
// The full record is the divergence table, §8 of docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md.
// Every note names the §8 rows it condenses, and every other row is in INTERNAL_ROWS with the reason a
// reader would not notice it. scripts/check-ui-sdk-notes.mjs (`pnpm check:ui-sdk-notes`) fails when a row
// is covered by neither, when a reference matches no row, and when a row changed after its note was last
// reviewed (apps/web/lib/ui-sdk-notes.lock.json), so a fixed difference cannot linger here.
//
// A row reference is "<primitive column> | <start of the Base UI column>", matching exactly one row.
// Plain Node module (no "server-only", no path aliases): the check and the mirror build import it directly.
// Inline code is written with backticks and rendered as <code>.

export interface UiSdkNote {
  /** One or two sentences for a reader of the primitive page. */
  text: string;
  /** The §8 rows this note condenses. */
  rows: string[];
}

export const UI_SDK_NOTES: Partial<Record<string, UiSdkNote[]>> = {
  accordion: [
    {
      text: "`orientation` and `loopFocus` on the root are accepted and ignored.",
      rows: ["accordion | `orientation`, `loopFocus` on the root"],
    },
  ],
  avatar: [
    {
      text: "The `<img>` is in the page from the start, visually hidden with `aria-hidden` until it loads, and stays after an error; Base UI mounts it only once it has loaded.",
      rows: ["avatar | image unmounted until it loads"],
    },
  ],
  calendar: [
    {
      text: "Built on UI SDK's calendar instead of react-day-picker. Values stay `Date` objects. Each day is a focusable grid cell holding a `<span data-slot=\"calendar-day-button\">`, not a `<button>`, so styles that target the day's inner `button` do not match; target `[data-slot=calendar-day-button]`. A disabled day stays focusable, with `aria-disabled`.",
      rows: [
        "calendar | day is a `<td>` holding a `<button>`",
        "calendar | disabled day = disabled `<button>`",
        "calendar | styles that target the day's inner `button`",
      ],
    },
    {
      text: "There are no `rdp-*` class names, `data-focused` or `data-month` attributes. Of a date-fns `locale`, only its code and `weekStartsOn` are read; `animate` is ignored; `components` other than `DayButton`, `formatters`/`labels` beyond the common ones, `hidden`, `timeZone`, `onDayClick` and `styles` are not supported.",
      rows: [
        "calendar | `rdp-*` class names",
        "calendar | `locale` (date-fns object)",
        "calendar | `animate`",
        "calendar | `components` beyond `DayButton`",
      ],
    },
    {
      text: "The `DateRange`, `Matcher` and `Modifiers` types are exported from the calendar module; import them from there instead of `react-day-picker`.",
      rows: ["calendar | `DateRange` type imported from `react-day-picker`"],
    },
  ],
  carousel: [
    {
      text: "Built on UI SDK's carousel instead of embla. `CarouselApi` is a shim with the common methods (`scrollTo`, `scrollPrev`/`scrollNext`, `canScrollPrev`/`canScrollNext`, `selectedScrollSnap`, `scrollSnapList`, `on`/`off` for `select`, `reInit` and `settle`), and `useCarousel()` returns no `carouselRef`.",
      rows: ["carousel | embla `CarouselApi`", "carousel | `useCarousel()` returns"],
    },
    {
      text: "Of `opts`, `align`, `loop`, `dragFree`, `skipSnaps`, `slidesToScroll`, `startIndex` and `watchDrag` are mapped; `axis`, `containScroll` and `duration` are ignored, and `breakpoints`, `plugins` and function values are not supported.",
      rows: ["carousel | `opts`"],
    },
    {
      text: "Previous and Next stay focusable at the ends (`aria-disabled`) instead of becoming `disabled`. Arrow keys in the viewport are UI SDK's, so an `onKeyDownCapture` override no longer stops paging from there. Slides out of view are `inert`.",
      rows: [
        "carousel | Previous/Next natively `disabled`",
        "carousel | arrow keys anywhere in the region",
        "carousel | slides out of view",
      ],
    },
  ],
  checkbox: [
    {
      text: "An uncontrolled checkbox with `indeterminate` stays mixed until the prop is cleared. `inputRef` and `uncheckedValue` are not supported.",
      rows: ["checkbox | `indeterminate` prop", "checkbox | `inputRef`, `uncheckedValue`, `parent`"],
    },
  ],
  combobox: [
    {
      text: "Filtered-out items stay mounted with `hidden`. Base UI's `filter(item, query)`, `filter={null}`, `itemToStringLabel`/`itemToStringValue`, `inputValue`, `loopFocus` and `onItemHighlighted` map to UI SDK's own filter, labels, query, `loop` and highlight.",
      rows: ["combobox | `items` + function children", "combobox | `filter(item, query)`"],
    },
    {
      text: "`id`, `inputRef`, `actionsRef`, `openOnInputClick`, `highlightItemOnHover`, `autoComplete`, `limit`, `locale`, `grid`, `virtualized`, `inline` and `filteredItems` on the root are accepted and ignored.",
      rows: ["combobox | root `id`, `inputRef`"],
    },
  ],
  command: [
    {
      text: "Filtered-out items and empty groups stay mounted with `hidden`. Choosing an item never changes the search text, and UI SDK sets each item's `aria-selected` from the highlight, replacing your own.",
      rows: [
        "command | filtered-out items and empty groups unmounted",
        "command | choosing an item may fill the input",
        "command | an item's own `aria-selected`",
      ],
    },
    {
      text: "Item `onClick` runs when the item is chosen by pointer or Enter.",
      rows: ["command | item `onClick`"],
    },
  ],
  "context-menu": [
    {
      text: "`orientation` and `closeDelay` on the root are accepted and ignored.",
      rows: ["context-menu | `disabled`, `orientation`, `closeDelay` on the root"],
    },
  ],
  direction: [
    {
      text: "`DirectionProvider` adds a `display: contents` wrapper with `dir`, because UI SDK reads direction from the page.",
      rows: ["direction | `DirectionProvider` is context only"],
    },
  ],
  drawer: [
    {
      text: "UI SDK's own swipe and snap physics replace Base UI's: the sheet is moved by UI SDK, so Base UI's transform variables (swipe movement, snap offset, stack height, `--drawer-swipe-progress`) are not set. `--drawer-height` is not measured; only a value you set applies.",
      rows: [
        "drawer | the popup is `fixed` and moved",
        "drawer | overlay opacity from `--drawer-swipe-progress`",
        "drawer | content height `var(--drawer-height,auto)`",
      ],
    },
  ],
  "dropdown-menu": [
    {
      text: "Item `onClick` runs on selection by pointer or keyboard (UI SDK's `onSelect`) and receives the selecting event, not a React `MouseEvent`. `openOnHover`, `closeDelay` and `orientation` on the root are accepted and ignored.",
      rows: ["dropdown-menu | item `onClick`, `closeOnClick`", "dropdown-menu | `openOnHover`, `closeDelay`"],
    },
  ],
  field: [
    {
      text: "Validation runs through the wrapper. `validate` blocks a submit only inside SevenUI `Form`; native constraints (`required`, `type`, `pattern`) show after a submit attempt. `FieldError match=\"valid\"` never shows.",
      rows: [
        "field | `validate`, `validationMode`",
        "field | `validate` (onSubmit mode)",
        "field | `FieldError match=\"valid\"`",
      ],
    },
    {
      text: "Parts carry UI SDK's state attributes (`data-invalid`, `data-valid`, `data-focused`, `data-required`, `data-disabled`, `data-filled` on the control); `data-dirty` and `data-touched` are set on the root only.",
      rows: ["field | parts carry `data-valid`", "field | `dirty`, `touched` mark every part"],
    },
  ],
  form: [
    {
      text: "A native `<form>` adapter with the same `onFormSubmit`, `errors`, `validationMode` and `actionsRef`; native constraint errors are shown by the browser and UI SDK.",
      rows: ["form | Base UI `Form`"],
    },
  ],
  "hover-card": [
    {
      text: "In `onOpenChange`, `details.event` is undefined for changes made through a controller.",
      rows: ["popover, hover-card | `onOpenChange` details"],
    },
  ],
  "input-otp": [
    {
      text: "One native input lies over the slot boxes, so the slots never take focus: the slot typing goes to has `data-active`. A root `aria-invalid` reaches the input, not the group, so the group's invalid ring does not show.",
      rows: [
        "input-otp | one `<input>` per slot",
        "input-otp | slots style `focus:*`",
        "input-otp | root `aria-invalid`",
      ],
    },
    {
      text: "`onValueInvalid` and `autoSubmit` are accepted and ignored. Pasting a code is affected by a UI SDK 0.1.0-beta.1 bug in strict mode.",
      rows: ["input-otp | `onValueInvalid`, `autoSubmit`", "input-otp | paste fills the slots"],
    },
  ],
  menubar: [
    {
      text: "Menus follow the dropdown-menu differences.",
      rows: ["menubar | `data-slot` passed to the `DropdownMenu*` parts"],
    },
  ],
  "navigation-menu": [
    {
      text: "One viewport popup holds the open content, sized by `--viewport-width`/`--viewport-height`; Base UI's `--positioner-*` and `--popup-*` variables are not set. `NavigationMenuIndicator` is UI SDK's indicator under the open trigger.",
      rows: [
        "navigation-menu | `Portal > Positioner > Popup > Viewport`",
        "navigation-menu | `NavigationMenuIndicator` is Base UI's `Icon`",
      ],
    },
    {
      text: "`actionsRef` and the positioner options `sticky`, `positionMethod`, `collisionBoundary`, `collisionAvoidance` and `disableAnchorTracking` are accepted and ignored.",
      rows: ["navigation-menu | root `actionsRef`"],
    },
  ],
  "number-field": [
    {
      text: "A committed value is always clamped and snapped (`allowOutOfRange`, `snapOnStep` are ignored).",
      rows: ["number-field | `allowOutOfRange`, `snapOnStep`"],
    },
  ],
  popover: [
    {
      text: "In `onOpenChange`, `details.event` is undefined for changes made through a controller.",
      rows: ["popover, hover-card | `onOpenChange` details"],
    },
  ],
  "radio-group": [
    { text: "`inputRef` is accepted and ignored.", rows: ["radio-group | `inputRef`"] },
  ],
  resizable: [
    {
      text: "Built on UI SDK's resizable instead of react-resizable-panels. Layout maps, `onLayoutChange`/`onLayoutChanged`, `groupRef`/`panelRef` handles and panel `onResize` are emulated; sizes in `em`, `vh` or `vw` are dropped. `usePanelRef`/`useGroupRef` are not provided: use `React.useRef` with the exported `ResizablePanelHandle`/`ResizablePanelGroupHandle` types.",
      rows: [
        "resizable | layout map keyed by panel id",
        "resizable | `onLayoutChange`/`onLayoutChanged",
        "resizable | `usePanelRef`, `useGroupRef`",
      ],
    },
    {
      text: "Panels are sized by `flex-basis` (`--resizable-panel-size`), not `flex-grow`, with no inner content wrapper. `disableCursor`, `resizeTargetMinimumSize`, panel `disabled`/`groupResizeBehavior` and `disableDoubleClick` are not supported.",
      rows: ["resizable | `flex-grow` sizing", "resizable | `disableCursor`"],
    },
  ],
  "scroll-area": [
    {
      text: "Scrollbars stay mounted (hidden) while their axis does not overflow, and each axis has one scrollbar: your `ScrollBar` replaces the root's own. While both axes overflow, the `data-overflow-x-*` edges are not set. `overflowEdgeThreshold` is ignored.",
      rows: [
        "scroll-area | scrollbar unmounted",
        "scroll-area | any number of `ScrollBar`s",
        "scroll-area | root `data-has-overflow-x/y`",
        "scroll-area | `overflowEdgeThreshold`",
      ],
    },
  ],
  select: [
    {
      text: "Opening by pointer highlights the first or selected option and moves focus into the list. There are no scroll arrows; the list scrolls. `finalFocus` is ignored: focus always returns to the trigger.",
      rows: [
        "select | opening by pointer highlights nothing",
        "select | `SelectScrollUp/DownButton`",
        "select | `finalFocus` on `SelectContent`",
      ],
    },
  ],
  sidebar: [
    {
      text: "Menu button tooltips follow the tooltip differences.",
      rows: ["sidebar | `SidebarMenuButton` tooltip hidden"],
    },
  ],
  slider: [
    {
      text: "The indicator ends at the value's share of the whole track, under the thumb, and a press on the track maps through the whole track, so the value can land up to half a thumb's share from where Base UI puts it. Each thumb's input of a range is bounded by its neighbours.",
      rows: ["slider | the indicator ends at the thumb's centre", "slider | range input carries `aria-valuenow`"],
    },
    {
      text: "`thumbCollisionBehavior`, `inputRef` and a non-string `locale` are accepted and ignored.",
      rows: ["slider | `thumbCollisionBehavior`"],
    },
  ],
  switch: [
    {
      text: "Enter submits the form; only Space toggles. `inputRef` is accepted and ignored.",
      rows: ["switch | Enter toggles", "switch | `inputRef`, `nativeButton`"],
    },
  ],
  tabs: [
    {
      text: "`Tabs.Indicator` from `@base-ui/react/tabs` cannot be used; UI SDK's `TabsIndicator` (from `@ui-sdk/react/tabs`) reads the same `--active-tab-*` variables.",
      rows: ["tabs | `Tabs.Indicator` from `@base-ui/react/tabs`"],
    },
  ],
  "toggle-group": [
    {
      text: "A vertical group (`orientation=\"vertical\"`) moves focus with Up and Down; Base UI keeps Left and Right.",
      rows: ["toggle-group | `orientation` only sets `data-orientation`"],
    },
  ],
  toast: [
    {
      text: "Toasts over the limit wait unrendered (no `data-limited`). Each toast is an `<li>` in the region's list; per-toast `swipeDirection` is ignored, and toasts swipe toward the region's edge. `onRemove` runs on dismissal with `onClose`; `positionerProps` is ignored.",
      rows: [
        "toast | toasts over `limit`",
        "toast | Toast root is a `div`",
        "toast | `onRemove` after the exit animation",
      ],
    },
  ],
  toolbar: [{ text: "UI SDK's own `toolbar-*` data slots appear on the parts.", rows: ["toolbar | parts have no `data-slot`"] }],
  tooltip: [
    {
      text: "A closed tooltip stays mounted with `hidden`. A hover tooltip closes once the pointer moves somewhere else, so the pointer can travel onto it. The provider's `timeout` is ignored.",
      rows: [
        "tooltip | closed content unmounted",
        "tooltip | hover close on pointer leave",
        "tooltip | `TooltipProvider` groups tooltips",
      ],
    },
    {
      text: "A `Button` rendered as the trigger gets `data-slot=\"tooltip-trigger\"` instead of `button`.",
      rows: ["tooltip | trigger rendered through a `Button`"],
    },
  ],
};

/** Primitives whose content opens as a popup; they share POPUP_NOTE. */
export const POPUP_PRIMITIVES = new Set([
  "alert-dialog",
  "combobox",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "hover-card",
  "menubar",
  "navigation-menu",
  "popover",
  "select",
  "sheet",
  "tooltip",
]);

export const POPUP_NOTE: UiSdkNote = {
  text: "Popups open in the browser's top layer (the Popover API) where they are declared, with no portal and no Positioner element; `side=\"inline-start\"`/`\"inline-end\"` map to `start`/`end`. Callback `details.reason` strings are UI SDK's (for example `trigger-press`, `escape-key`, `outside-press`). An `initialFocus` or `finalFocus` function receives `\"mouse\"` as its interaction, and one that returns nothing hands focus back to the trigger.",
  rows: [
    "all popups | `XPortal` portals to `body`",
    "all popups | `side` accepts",
    "all popups | Positioner wrapper element",
    "all | callback `details.reason` strings",
    "dialog, alert-dialog, sheet, drawer, popover (`initialFocus`, `finalFocus`); dropdown-menu, menubar, context-menu (`finalFocus`) | a boolean, a ref",
  ],
};

/**
 * §8 rows a reader of the primitive pages would not notice, each with why. Most record how the flavour
 * keeps Base UI's API or markup; a row moves to a note as soon as something a reader sees differs.
 */
export const INTERNAL_ROWS: Record<string, string> = {
  "all popups | trigger `data-popup-open`": "the flavour adds `data-popup-open`, so trigger styles keep working",
  "button | `nativeButton`": "UI SDK detects a native button itself, which is what the prop told Base UI",
  "badge | `useRender` state": "the same attributes are set explicitly",
  "dialog | `DialogOverlay` is a plain div": "the overlay keeps its slot and look",
  "dialog | `DialogFooter` close button": "the slot stays `button`",
  "dialog, alert-dialog, sheet | popup has `data-nested-dialog-open`": "the attribute is still set",
  "tooltip | `delay`/`closeDelay`/`closeOnClick` on the trigger": "the trigger's values still apply",
  "tooltip | `trackCursorAxis`": "emulated; the bubble follows the pointer as in Base UI",
  "tooltip | `disableHoverablePopup`": "emulated; moving onto the popup closes it as in Base UI",
  "select | `items` value→label map": "converted; labels show as in Base UI",
  "select | `alignItemWithTrigger`": "item positions match Base UI (checked in Chrome)",
  "select | `SelectLabel` = group label": "same API and slot",
  "select | `SelectValue` children `(value)`": "same API",
  "dropdown-menu | checkbox item has no `value`": "an internal identifier; nothing visible",
  "registry | examples": "the registry layout; the installation guide covers the `/r/ui-sdk/` paths",
  "breadcrumb, button-group, item, marker, bubble, attachment, layer-card | `useRender` state": "the same attributes are set explicitly",
  "button-group, item | `ButtonGroupSeparator`/`ItemSeparator`": "no divergence left",
  "sidebar | `SidebarMenuButton` with `tooltip`": "the slot is kept",
  "sidebar | `SidebarInput`/`SidebarSeparator`": "no divergence left",
  "navigation-menu | content `h-full w-auto`": "the content sizes itself inside the viewport and looks the same",
  "navigation-menu | link `active`, `closeOnClick`": "same props, mapped",
  "combobox | `ComboboxChip` without `value`": "chips get their value as in Base UI",
  "combobox | `ComboboxValue` children `(value)`": "same API",
  "combobox | `ComboboxContent anchor` as a ref": "a ref anchor still works",
  "command | Autocomplete root: `value`/`onValueChange`": "same API: the value is the search text",
  "command | item `value` is any object": "items and filters behave as in Base UI; the default filter is `contains`",
  "command | `autoHighlight=\"always\"`": "no divergence: the first item is highlighted on mount in a browser too",
  "batch 4 (separator, tabs, accordion, collapsible, scroll-area, progress, meter, avatar, toggle, toggle-group, toolbar) | a caller's `data-slot`":
    "a caller's slot still wins",
  "tabs | selected tab has `data-active`": "the attribute is still set",
  "tabs | `activateOnFocus` (default false) and `loopFocus`": "the props still apply",
  "tabs | `value` typed `any`": "same API",
  "accordion, collapsible | open trigger has `data-panel-open`": "the attribute is still set",
  "accordion, collapsible | `value`/`open` beside": "the controlled value wins, as in Base UI",
  "accordion | header `<h3>` has no `data-slot`": "markup matches Base UI",
  "progress, meter | `getAriaValueText": "same API, mapped",
  "progress | indeterminate bar announces": "the same text is announced",
  "avatar | the image mounts with `data-starting-style`": "emulated; a `data-starting-style` fade runs as in Base UI",
  "avatar | `onLoadingStatusChange` on `AvatarImage`": "the callback still fires",
  "toolbar | `ToolbarButton render={<Toggle />}`": "works the same",
  "popover, hover-card | trigger `openOnHover`/`delay`/`closeDelay`": "the trigger's values still apply",
  "popover, hover-card | root children as a function": "supported",
  "alert-dialog, sheet, drawer | overlay slots": "the slots and look are kept",
  "sheet | Base UI Dialog": "built on UI SDK's dialog; behaves and slides as before",
  "sheet | `sheet-content` is a plain fixed panel": "looks the same",
  "sheet | a caller's `data-slot`": "a caller's slot still wins",
  "drawer | `initialFocus` default": "the same default as Base UI",
  "drawer | `swipeDirection`": "same prop, mapped",
  "drawer | `data-nested-drawer-open`, `data-swiping`, `data-modal`": "the attributes are still set (on the popup)",
  "drawer | a non-modal drawer closes": "behaves as in Base UI",
  "drawer | snap points typed": "the same values are accepted",
  "toast | `createToastManager()`": "same API",
  "toast | `<ToastViewport>` children": "the same markup works",
  "toast | `timeout: 0`, `priority: \"high\"`": "same options, mapped",
  "toast | Base UI stack variables": "the same variables are defined",
  "toast | `ToastAction` without `actionProps`": "behaves as in Base UI",
  "toast | viewport slot `toast-viewport`": "the slot and look are kept",
  "input, textarea, label | a caller's `data-slot`": "a caller's slot still wins",
  "input, textarea | `value` may be a number": "turned into text, as the DOM does",
  "textarea | native `onSubmit` accepted": "a textarea never fires `submit` in either flavour",
  "input-group | `InputGroup` is a plain `div role=\"group\"`": "the role is kept",
  "field | `FieldLabel` renders SevenUI `Label`": "looks and labels the same",
  "radio-group | `value` of any type": "values of any type work: `onValueChange` hands back the item's own value (8304597)",
  "switch | `uncheckedValue` submitted while off": "emulated; the value is submitted as in Base UI",
  "slider | `onValueCommitted`, `minStepsBetweenValues`": "same props, mapped",
  "slider | `thumbAlignment=\"edge\"`": "thumbs sit where Base UI puts them (checked in Chrome)",
  "number-field | root `id` and `inputRef`": "they still reach the input",
  "number-field | `allowWheelScrub`, `onValueCommitted`, `step=\"any\"`": "same props, mapped",
  "number-field | parts have no `data-slot`": "extra slots only",
  "input-otp | `length`, `validationType`, `onValueComplete`": "same props, mapped",
  "input-otp | `normalizeValue`, `mask`": "applied by the wrapper",
  "calendar | `Date` / `DateRange {from,to}`": "same value types",
  "calendar | react-day-picker selection rules": "the same rules apply",
  "calendar | a half range": "emitted as in Base UI",
  "calendar | `required` single date pressed again": "calls `onSelect` as in Base UI",
  "calendar | `startMonth`/`endMonth`": "navigation and hidden outside days match react-day-picker",
  "calendar | outside days of a shown month": "an internal tab order detail",
  "carousel | `-ml-4` on the row": "slides line up as in embla (checked in Chrome)",
  "carousel | no name required": "an unnamed carousel gets a default accessible name",
  "resizable | arrow key step": "5%, as in react-resizable-panels",
  "resizable | `groupRef`/`panelRef` handles": "emulated; covered by the layout note",
  "resizable | `data-group=\"true\"`": "the same attributes are set",
  "resizable | group `data-slot=\"resizable-panel-group\"`": "the slot is kept",
};
