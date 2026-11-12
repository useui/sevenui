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
  ...props
}: SelectProps<T, Multiple>) {
  const data = React.useMemo(() => readItems(items), [items]);
  return (
    <SelectPrimitive<T, Multiple>
      {...(props as unknown as SelectPrimitiveProps<T, Multiple>)}
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
  return (
    <SelectContentPrimitive
      data-slot="select-content"
      data-align-trigger={alignItemWithTrigger}
      side={side === "inline-start" ? "start" : side === "inline-end" ? "end" : side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      className={cn(
        "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-overlay ring-1 ring-foreground/10 transition-[scale,opacity] duration-100 ease-snappy data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 motion-reduce:transition-none data-[align-trigger=true]:transition-none",
        className,
      )}
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
