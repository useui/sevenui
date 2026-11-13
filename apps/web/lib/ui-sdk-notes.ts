// What a reader of a primitive page would notice when the UI SDK flavour is selected: the differences
// from Base UI that change behaviour, markup they might style, or props that are accepted but ignored.
// Condensed from the divergence table (docs/superpowers/plans/2026-11-13-ui-sdk-porting-guide.md §8),
// which stays the full record; when a row there changes what a user sees, change its line here.
// Keyed by primitive name. A primitive with no entry has no difference worth a reader's attention.
// Inline code is written with backticks and rendered as <code>.

export const UI_SDK_NOTES: Partial<Record<string, string[]>> = {
  accordion: ["`orientation` and `loopFocus` on the root are accepted and ignored."],
  avatar: [
    "The image is rendered at once and hidden until it loads, so a `data-starting-style` fade-in does not run.",
  ],
  calendar: [
    "Built on UI SDK's calendar instead of react-day-picker. Values stay `Date` objects; days are grid cells, not buttons, so styles that target the day's inner `button` do not match.",
    "`startMonth`/`endMonth` also make days beyond them unselectable; `animate` is ignored.",
    "The `DateRange` type is exported from the calendar module; import it from there instead of `react-day-picker`.",
  ],
  carousel: [
    "Built on UI SDK's carousel instead of embla. `CarouselApi` is a shim with the same common methods; embla `plugins`, `breakpoints`, `axis`, `containScroll` and `duration` are not supported.",
    "Previous and Next stay focusable at the ends (`aria-disabled`) instead of becoming `disabled`.",
  ],
  checkbox: ["An uncontrolled checkbox with `indeterminate` stays mixed until the prop is cleared."],
  combobox: [
    "Filtered-out items stay mounted with `hidden`. Base UI's `filter(item, query)` and `inputValue` map to UI SDK's own filter and query.",
  ],
  command: [
    "The first item is highlighted once the input is used, not on mount. Filtered-out items stay mounted with `hidden`.",
    "Choosing an item never changes the search text.",
  ],
  "context-menu": ["`disabled`, `orientation` and `closeDelay` on the root are accepted and ignored."],
  direction: ["`DirectionProvider` adds a `display: contents` wrapper with `dir`, because UI SDK reads direction from the page."],
  drawer: ["UI SDK's own swipe and snap physics replace Base UI's. `--drawer-height` is not measured; only a value you set applies."],
  "dropdown-menu": [
    "Item `onClick` runs on selection by pointer or keyboard (UI SDK's `onSelect`). `openOnHover`, `closeDelay` and `orientation` on the root are ignored.",
  ],
  field: [
    "Validation runs through the wrapper: `validate` blocks a submit only inside SevenUI `Form`. `FieldError match=\"valid\"` never shows.",
  ],
  form: ["A native `<form>` adapter with the same `onFormSubmit`, `errors` and `validationMode`; native constraint errors are shown by the browser."],
  "hover-card": ["Trigger delays are applied on the root, as UI SDK expects."],
  "input-otp": [
    "One native input lies over the slot boxes. `onValueInvalid` and `autoSubmit` are ignored.",
    "Pasting a code is affected by a UI SDK 0.1.0-beta.1 bug in strict mode.",
  ],
  menubar: ["Menus follow the dropdown-menu differences."],
  "navigation-menu": ["One viewport popup holds the open content. `actionsRef` and positioner options such as `sticky` are ignored."],
  "number-field": ["A committed value is always clamped and snapped (`allowOutOfRange`, `snapOnStep` are ignored)."],
  "radio-group": ["Values are strings."],
  resizable: [
    "Built on UI SDK's resizable instead of react-resizable-panels. Layout maps, `onLayoutChange`/`onLayoutChanged` and panel handles are emulated; `usePanelRef`/`useGroupRef` are not provided, so use `React.useRef`.",
    "No `data-panel`/`data-separator` attributes; panels are sized by `--resizable-panel-size`.",
  ],
  "scroll-area": ["Scrollbars stay mounted (hidden) while their axis does not overflow; one scrollbar per axis."],
  select: [
    "Opening by pointer highlights the first or selected option. There are no scroll arrows; the list scrolls.",
  ],
  sheet: ["Built on UI SDK's dialog with the same CSS slide."],
  sidebar: ["Menu button tooltips follow the tooltip differences."],
  slider: ["Thumbs centre on their value, so at 0% and 100% half a thumb overhangs the track."],
  switch: ["Enter submits the form; only Space toggles. `uncheckedValue` is ignored."],
  tabs: ["`Tabs.Indicator` from `@base-ui/react/tabs` cannot be used; UI SDK's indicator reads the same `--active-tab-*` variables."],
  toast: [
    "Toasts over the limit wait unrendered. Per-toast `swipeDirection` is ignored; toasts swipe toward the region's edge.",
  ],
  toolbar: ["UI SDK's own `toolbar-*` data slots appear on the parts."],
  tooltip: [
    "A closed tooltip stays mounted with `hidden`. `trackCursorAxis`, `disableHoverablePopup` and the provider `timeout` are ignored.",
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

export const POPUP_NOTE =
  "Popups open in the browser's top layer (the Popover API) where they are declared, with no portal and no Positioner element; `side=\"inline-start\"`/`\"inline-end\"` map to `start`/`end`.";
