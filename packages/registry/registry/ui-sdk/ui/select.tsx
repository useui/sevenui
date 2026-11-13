"use client";

import * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import {
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectGroupLabel,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator,
  SelectItemText,
  Select as SelectPrimitive,
  type SelectProps as SelectPrimitiveProps,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from "@ui-sdk/react/select";
import { cn } from "cn";

// Base UI portals popups to <body>; UI SDK renders them in place, as children
// of whatever holds the trigger, where that parent's child rules (Field's
// `*:w-full`, ButtonGroup's corners) and inherited styles reach them. So they
// render into <body>, or into a DirectionProvider's host to keep its `dir`
// (direction.tsx); in place on the server and while hydrating.
type PopupHost = { host: HTMLElement | null } | null;
const popupHostKey = Symbol.for("sevenui.ui-sdk.popup-host");
const popupHosts = globalThis as { [key: symbol]: React.Context<PopupHost> | undefined };
popupHosts[popupHostKey] ??= React.createContext<PopupHost>(null);
const PopupHostContext = popupHosts[popupHostKey] as React.Context<PopupHost>;
const subscribeToNothing = () => () => {};
function usePopupContainer(): HTMLElement | null {
  const scope = React.useContext(PopupHostContext);
  const body = React.useSyncExternalStore(subscribeToNothing, () => document.body, () => null);
  return body && (scope ? scope.host : body);
}
import { CheckIcon, ChevronDownIcon } from "lucide-react";

type Side = React.ComponentProps<typeof SelectContentPrimitive>["side"];

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Used where SevenUI's slot name differs from UI SDK's.
function withSlot<State>(
  slot: string,
  tag: string,
  render?: RenderProp<State>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot }, render, state);
}

// Base UI's `items` only maps values to the labels the trigger shows, as
// `{ value, label }[]` or a record, with an optional `value: null` entry
// naming the placeholder. UI SDK's `items` is the list's data and would
// override the rendered items (their `disabled` among them), so the map
// becomes `itemToLabel` instead.
type LabeledItem = { value: unknown; label: React.ReactNode };
type BaseItems =
  | ReadonlyArray<LabeledItem>
  | ReadonlyArray<{ [key: string]: unknown; items: ReadonlyArray<LabeledItem> }>
  | Record<string, React.ReactNode>;

function readItems(items: BaseItems | undefined) {
  if (!items) return { itemToLabel: undefined, placeholder: undefined };
  const entries: ReadonlyArray<LabeledItem> = Array.isArray(items)
    ? items.flatMap((entry: LabeledItem | { items: ReadonlyArray<LabeledItem> }) =>
        "items" in entry && Array.isArray(entry.items) ? entry.items : [entry as LabeledItem],
      )
    : Object.entries(items).map(([value, label]) => ({ value, label }));
  const labels = new Map<unknown, string>();
  let placeholder: string | undefined;
  for (const { value, label } of entries) {
    const text = typeof label === "string" || typeof label === "number" ? String(label) : undefined;
    if (value == null) placeholder = text;
    else if (text !== undefined) labels.set(value, text);
  }
  return {
    itemToLabel: (value: unknown) => labels.get(value) ?? String(value),
    placeholder,
  };
}

// What this control reports to the SevenUI Field around it (field.tsx): the
// value Base UI hands `validate` and the serialized one `onFormSubmit` gets.
// Reached through a global symbol, so the exports stay those of base.
type FieldControlSource = {
  value: () => unknown;
  formValue: () => unknown;
  disabled: () => boolean;
};
type RegisterFieldControl = (source: FieldControlSource) => () => void;
const fieldControlKey = Symbol.for("sevenui.ui-sdk.field-control");
const fieldControls = globalThis as {
  [key: symbol]: React.Context<RegisterFieldControl | null> | undefined;
};
fieldControls[fieldControlKey] ??= React.createContext<RegisterFieldControl | null>(null);
const FieldControlContext = fieldControls[
  fieldControlKey
] as React.Context<RegisterFieldControl | null>;

function useFieldControl(source: FieldControlSource) {
  const register = React.useContext(FieldControlContext);
  const latest = React.useRef(source);
  React.useLayoutEffect(() => {
    latest.current = source;
  });
  React.useLayoutEffect(
    () =>
      register?.({
        value: () => latest.current.value(),
        formValue: () => latest.current.formValue(),
        disabled: () => latest.current.disabled(),
      }),
    [register],
  );
}

// The value a change leaves the control with, read from its controlled
// `value` or, uncontrolled, from the last change nobody canceled.
function useCurrentValue<Value>(
  value: Value | undefined,
  defaultValue: Value | undefined,
) {
  const uncontrolled = React.useRef(defaultValue);
  const current = React.useRef(value !== undefined ? value : defaultValue);
  React.useLayoutEffect(() => {
    current.current = value !== undefined ? value : uncontrolled.current;
  });
  const track = (next: Value, details: { canceled?: boolean } | undefined) => {
    if (details?.canceled || value !== undefined) return;
    uncontrolled.current = next;
    current.current = next;
  };
  return { current, track };
}

// Base UI's form value for a select or combobox item: `itemToStringValue`,
// else an object item's `value`, else the item; strings as they are, other
// values as JSON.
function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function toFormValue(item: unknown, itemToStringValue?: (item: never) => string): string {
  if (itemToStringValue && item != null) return itemToStringValue(item as never) ?? "";
  if (item && typeof item === "object" && "value" in item && "label" in item) {
    return serializeValue((item as { value: unknown }).value);
  }
  return serializeValue(item);
}

// The value props are typed as Base UI types them, so `T` is inferred from
// `value` and `onValueChange` gets its parameter type. UI SDK's own props are
// a union (single, multiple, either) that an Omit would merge.
type SelectValueType<T, Multiple extends boolean | undefined> = Multiple extends true ? T[] : T;
type SelectProps<T, Multiple extends boolean | undefined> = Omit<
  // biome-ignore lint/suspicious/noExplicitAny: a generic Omit here defeats inferring T.
  SelectPrimitiveProps<any>,
  "items" | "multiple" | "value" | "defaultValue" | "onValueChange"
> & {
  items?: BaseItems;
  multiple?: Multiple;
  value?: SelectValueType<T, Multiple> | null;
  defaultValue?: SelectValueType<T, Multiple> | null;
  onValueChange?: (
    value: SelectValueType<T, Multiple> | (Multiple extends true ? never : null),
    details: Parameters<NonNullable<SelectPrimitiveProps<T>["onValueChange"]>>[1],
  ) => void;
};

function Select<T, Multiple extends boolean | undefined = false>({
  items,
  placeholder,
  itemToLabel,
  onValueChange,
  ...props
}: SelectProps<T, Multiple>) {
  const data = React.useMemo(() => readItems(items), [items]);
  const { current, track } = useCurrentValue<unknown>(
    props.value,
    props.defaultValue ?? (props.multiple ? [] : null),
  );
  const itemToString = (props as { itemToStringValue?: (item: never) => string }).itemToStringValue;
  useFieldControl({
    value: () => current.current,
    formValue: () =>
      Array.isArray(current.current)
        ? current.current.map((item) => toFormValue(item, itemToString))
        : toFormValue(current.current, itemToString),
    disabled: () => props.disabled === true,
  });
  return (
    <SelectPrimitive<T, Multiple>
      {...(props as unknown as SelectPrimitiveProps<T, Multiple>)}
      onValueChange={
        ((next: unknown, details: { canceled?: boolean }) => {
          (onValueChange as ((value: unknown, details: unknown) => void) | undefined)?.(
            next,
            details,
          );
          track(next, details);
        }) as SelectPrimitiveProps<T, Multiple>["onValueChange"]
      }
      itemToLabel={itemToLabel ?? data.itemToLabel}
      placeholder={placeholder ?? data.placeholder}
    />
  );
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectGroupPrimitive>) {
  return (
    <SelectGroupPrimitive
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  );
}

// Base UI passes a function child the selected value; UI SDK passes the
// value's state, so the value is unwrapped.
function SelectValue({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectValuePrimitive>, "children"> & {
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  children?: React.ReactNode | ((value: any) => React.ReactNode);
}) {
  return (
    <SelectValuePrimitive
      data-slot="select-value"
      className={cn("flex min-w-0 flex-1 truncate text-left not-has-[*]:block", className)}
      {...props}
    >
      {typeof children === "function" ? (state) => children(state.value) : children}
    </SelectValuePrimitive>
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function SelectTrigger({
  className,
  size = "default",
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof SelectTriggerPrimitive>, "render" | "children"> & {
  children?: React.ReactNode;
  size?: "sm" | "default";
  render?: React.ReactElement<unknown> | RenderProp<{ open: boolean }>;
}) {
  return (
    <SelectTriggerPrimitive
      data-slot="select-trigger"
      data-size={size}
      render={(triggerProps, state) =>
        renderElement(
          "button",
          { ...triggerProps, "data-popup-open": state.open ? "" : undefined },
          render as RenderProp<{ open: boolean }> | undefined,
          state,
        )
      }
      className={cn(
        // Control-scale variables fall back inline: a :where() default on this
        // element would shadow a [data-density=compact] ancestor. A plain-text
        // value switches to block so it can ellipsize; a value with elements
        // stays flex.
        "flex w-fit items-center justify-between gap-[var(--control-gap,0.5rem)] rounded-lg border border-input bg-transparent pr-[calc(var(--control-px,0.75rem)-0.25rem)] pl-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] whitespace-nowrap transition-[color,background-color,border-color] outline-none select-none motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-[var(--control-h,2.125rem)] data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem)] data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate *:data-[slot=select-value]:not-has-[*]:block *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </SelectTriggerPrimitive>
  );
}

// Base UI's alignItemWithTrigger lays the selected item over the trigger, or
// the first item while nothing is selected; UI SDK aligns only a selected
// item and otherwise opens below, and an anchor turns its alignment off. So
// the flavour aligns both cases itself: the content is anchored to a
// zero-height box where its top must go for that item to sit on the trigger
// (UI SDK re-reads an anchor on every check). Like Base UI it falls back to
// the trigger when there is no room, and for touch.
const VIEWPORT_MARGIN = 10;

function placeholderAnchor(
  content: React.RefObject<HTMLElement | null>,
  touch: React.RefObject<boolean>,
  sideOffset: number,
  align: "start" | "center" | "end",
) {
  return {
    getBoundingClientRect: () => {
      const popup = content.current;
      const trigger = popup?.id
        ? popup.ownerDocument.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(popup.id)}"]`)
        : null;
      if (!popup || !trigger) return new DOMRect();
      const box = trigger.getBoundingClientRect();
      const selected = popup.querySelector<HTMLElement>("[data-slot=select-item][data-selected]:not([hidden])");
      const item =
        selected ?? popup.querySelector<HTMLElement>("[data-slot=select-item]:not([data-disabled]):not([hidden])");
      // The content gets sideOffset 0 here (UI SDK drops it while a selected
      // item could align), so the offset is added to the fallback box.
      const below = new DOMRect(box.left, box.top, box.width, box.height + sideOffset);
      const fallback = () => {
        if (popup.style.maxHeight) popup.style.maxHeight = "";
        return below;
      };
      if (touch.current || !item) return fallback();
      const popupBox = popup.getBoundingClientRect();
      const offset = item.getBoundingClientRect().top - popupBox.top + popup.scrollTop;
      const top = box.top + (box.height - item.offsetHeight) / 2 - offset;
      const view = popup.ownerDocument.defaultView?.innerHeight ?? 0;
      if (top < 0 || top + popup.offsetHeight > view) return fallback();
      // Near the top of the viewport Base UI keeps the popup 10px from the
      // edge and scrolls its list by the difference, so the item still sits
      // on the trigger and the popup is that much shorter.
      const shift = top < VIEWPORT_MARGIN ? VIEWPORT_MARGIN - top : 0;
      if (shift > 0) {
        popup.style.maxHeight = `${popup.scrollHeight - shift}px`;
        popup.scrollTop = shift;
      } else if (popup.style.maxHeight) {
        popup.style.maxHeight = "";
      }
      // Base UI also lines the item's text up with the value's text.
      const value = trigger.querySelector("[data-slot=select-value]")?.getBoundingClientRect();
      const text = item.querySelector("[data-slot=select-item-text]")?.getBoundingClientRect();
      const left = value && text ? box.left + (value.left - box.left) - (text.left - popupBox.left) : box.left;
      // The box keeps the trigger's width (it sets --anchor-width). With no
      // selected item UI SDK still applies `align` to a popup wider than it;
      // Base UI starts an aligned popup at `left` whatever the align, so undo
      // that shift. (With a selected item UI SDK already starts it at `left`.)
      const spare = selected ? 0 : popupBox.width - box.width;
      const x = align === "center" ? left + spare / 2 : align === "end" ? left + spare : left;
      return new DOMRect(x, top + shift, box.width, 0);
    },
  };
}

// Sets a caller's ref beside the wrapper's own, which a spread `ref` would
// otherwise replace.
function useMergedRef<T>(own: React.RefObject<T | null>, ref: React.Ref<T> | undefined) {
  return React.useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [own, ref],
  );
}

// No Positioner: UI SDK positions the content itself, in the top layer, so
// placement props sit on this part and Base UI's `inline-start`/`inline-end`
// map to `start`/`end`. UI SDK has no scroll arrows; the list scrolls.
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  finalFocus: _finalFocus,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof SelectContentPrimitive>, "side" | "children"> & {
  side?: Side | "inline-start" | "inline-end";
  children?: React.ReactNode;
  // Accepted for Base UI parity: UI SDK's select always returns focus to its trigger.
  finalFocus?:
    | boolean
    | React.RefObject<HTMLElement | null>
    | ((closeType: string) => boolean | HTMLElement | null | undefined);
}) {
  const content = React.useRef<HTMLDivElement | null>(null);
  const contentRef = useMergedRef(content, ref);
  const touch = React.useRef(false);
  React.useEffect(() => {
    const record = (event: PointerEvent) => {
      touch.current = event.pointerType === "touch";
    };
    document.addEventListener("pointerdown", record, true);
    return () => document.removeEventListener("pointerdown", record, true);
  }, []);
  const anchor = React.useMemo(
    () => (alignItemWithTrigger ? placeholderAnchor(content, touch, sideOffset, align) : undefined),
    [alignItemWithTrigger, sideOffset, align],
  );
  return (
    <SelectContentPrimitive
      ref={contentRef}
      anchor={anchor}
      data-slot="select-content"
      data-align-trigger={alignItemWithTrigger}
      side={side === "inline-start" ? "start" : side === "inline-end" ? "end" : side}
      // Base UI keeps popups 5px from the viewport edges; UI SDK 8px.
      collisionPadding={5}
      sideOffset={anchor ? 0 : sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className={cn(
        "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-overlay ring-1 ring-foreground/10 transition-[scale,opacity] duration-100 ease-snappy data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 motion-reduce:transition-none data-[align-trigger=true]:transition-none",
        className,
      )}
      container={usePopupContainer()}
      {...props}
    >
      {children}
    </SelectContentPrimitive>
  );
}

// SevenUI's SelectLabel labels a group, which is UI SDK's SelectGroupLabel
// (UI SDK's own SelectLabel labels the whole select).
function SelectLabel({
  className,
  render,
  ...props
}: React.ComponentProps<typeof SelectGroupLabel>) {
  return (
    <SelectGroupLabel
      render={withSlot("select-label", "div", render)}
      className={cn("px-2 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectItemPrimitive>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <SelectItemPrimitive
      data-slot="select-item"
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] w-full cursor-default items-center gap-[var(--control-gap,0.5rem)] rounded-md py-1 pr-8 pl-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectItemText className="flex min-w-0 flex-1 gap-2 truncate not-has-[*]:block">
        {children}
      </SelectItemText>
      <SelectItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <CheckIcon className="pointer-events-none" />
      </SelectItemIndicator>
    </SelectItemPrimitive>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectSeparatorPrimitive>) {
  return (
    <SelectSeparatorPrimitive
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// UI SDK's select has no scroll arrows: the content scrolls natively. The
// parts stay so composed markup keeps working, and render nothing.
function SelectScrollUpButton(_props: React.ComponentProps<"div">) {
  return null;
}

function SelectScrollDownButton(_props: React.ComponentProps<"div">) {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
