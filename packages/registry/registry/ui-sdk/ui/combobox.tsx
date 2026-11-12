"use client";

import * as React from "react";
import {
  ComboboxChip as ComboboxChipPrimitive,
  ComboboxChipRemove as ComboboxChipRemovePrimitive,
  ComboboxChips as ComboboxChipsPrimitive,
  ComboboxClear as ComboboxClearPrimitive,
  ComboboxContent as ComboboxContentPrimitive,
  ComboboxEmpty as ComboboxEmptyPrimitive,
  ComboboxGroup as ComboboxGroupPrimitive,
  ComboboxGroupLabel as ComboboxGroupLabelPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxItemIndicator as ComboboxItemIndicatorPrimitive,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxList as ComboboxListPrimitive,
  Combobox as ComboboxPrimitive,
  ComboboxSeparator as ComboboxSeparatorPrimitive,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxValue as ComboboxValuePrimitive,
} from "@ui-sdk/react/combobox";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";

import { Button } from "@/registry/ui-sdk/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/ui-sdk/ui/input-group";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;
type Side = React.ComponentProps<typeof ComboboxContentPrimitive>["side"];
type Align = React.ComponentProps<typeof ComboboxContentPrimitive>["align"];

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names are set there.
function part<State extends object>(
  slot: string,
  tag: string,
  render: BaseRender | undefined,
): RenderProp<State> {
  return (props, state) =>
    renderElement(
      tag,
      { ...props, "data-slot": slot },
      render as RenderProp<State> | undefined,
      state,
    );
}

// Base UI's logical sides map onto UI SDK's start/end.
function toSide(side: Side | "inline-start" | "inline-end" | undefined): Side {
  if (side === "inline-start") return "start";
  if (side === "inline-end") return "end";
  return side;
}

// Base UI reads an object item's `label`, else its `value`, else the item.
function defaultItemLabel(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    const record = item as { label?: unknown; value?: unknown };
    if (record.label !== undefined) return String(record.label);
    if (record.value !== undefined) return String(record.value);
  }
  return String(item);
}

// Base UI renders the list from `items` through a function child; UI SDK
// filters the items it renders, so the flavour renders every item and lets
// UI SDK filter them by the label each item carries.
type ItemsContextValue = {
  items: readonly unknown[] | undefined;
  toLabel: (item: unknown) => string;
};
const ItemsContext = React.createContext<ItemsContextValue>({
  items: undefined,
  toLabel: defaultItemLabel,
});
const GroupItemsContext = React.createContext<readonly unknown[] | undefined>(undefined);

type ComboboxValueType<Value, Multiple extends boolean | undefined> = Multiple extends true
  ? Value[]
  : Value;

type ComboboxProps<Value, Multiple extends boolean | undefined = false> = {
  children?: React.ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  items?: readonly any[];
  multiple?: Multiple;
  value?: ComboboxValueType<Value, Multiple> | null;
  defaultValue?: ComboboxValueType<Value, Multiple> | null;
  onValueChange?: (
    value: ComboboxValueType<Value, Multiple> | (Multiple extends true ? never : null),
    // biome-ignore lint/suspicious/noExplicitAny: UI SDK change details.
    eventDetails: any,
  ) => void;
  inputValue?: React.ComponentProps<"input">["value"];
  defaultInputValue?: React.ComponentProps<"input">["defaultValue"];
  // biome-ignore lint/suspicious/noExplicitAny: UI SDK change details.
  onInputValueChange?: (inputValue: string, eventDetails: any) => void;
  open?: boolean;
  defaultOpen?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: UI SDK change details.
  onOpenChange?: (open: boolean, eventDetails: any) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  filter?: null | ((itemValue: any, query: string, itemToString?: (itemValue: any) => string) => boolean);
  itemToStringLabel?: (itemValue: Value) => string;
  itemToStringValue?: (itemValue: Value) => string;
  isItemEqualToValue?: (itemValue: Value, value: Value) => boolean;
  // biome-ignore lint/suspicious/noExplicitAny: UI SDK highlight details.
  onItemHighlighted?: (highlightedValue: Value | undefined, eventDetails: any) => void;
  autoHighlight?: boolean;
  loopFocus?: boolean;
  modal?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  // Base UI props with no UI SDK counterpart: accepted and dropped.
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  actionsRef?: React.RefObject<unknown>;
  openOnInputClick?: boolean;
  highlightItemOnHover?: boolean;
  autoComplete?: string;
  limit?: number;
  locale?: Intl.LocalesArgument;
  grid?: boolean;
  virtualized?: boolean;
  inline?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  filteredItems?: readonly any[];
};

function Combobox<Value, Multiple extends boolean | undefined = false>({
  children,
  items,
  filter,
  itemToStringLabel,
  itemToStringValue,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  onItemHighlighted,
  loopFocus,
  id: _id,
  inputRef: _inputRef,
  actionsRef: _actionsRef,
  openOnInputClick: _openOnInputClick,
  highlightItemOnHover: _highlightItemOnHover,
  autoComplete: _autoComplete,
  limit: _limit,
  locale: _locale,
  grid: _grid,
  virtualized: _virtualized,
  inline: _inline,
  filteredItems: _filteredItems,
  ...props
}: ComboboxProps<Value, Multiple>) {
  const toLabel = React.useCallback(
    (item: unknown) =>
      item === null || item === undefined
        ? ""
        : itemToStringLabel
          ? itemToStringLabel(item as Value)
          : defaultItemLabel(item),
    [itemToStringLabel],
  );
  const context = React.useMemo(() => ({ items, toLabel }), [items, toLabel]);
  // UI SDK hands a filter the item entry; Base UI hands it the item.
  const uiFilter =
    filter === null
      ? false
      : filter
        ? (entry: { value: unknown }, query: string) => filter(entry.value, query, toLabel)
        : undefined;
  const toText = (text: React.ComponentProps<"input">["value"]) =>
    text === undefined || text === null ? undefined : String(text);

  return (
    <ItemsContext.Provider value={context}>
      <ComboboxPrimitive
        // biome-ignore lint/suspicious/noExplicitAny: the generic value shape is the caller's.
        {...(props as any)}
        itemToLabel={toLabel}
        itemToValue={itemToStringValue}
        filter={uiFilter}
        query={toText(inputValue)}
        defaultQuery={toText(defaultInputValue)}
        onQueryChange={onInputValueChange}
        onHighlight={onItemHighlighted}
        loop={loopFocus}
      >
        {children}
      </ComboboxPrimitive>
    </ItemsContext.Provider>
  );
}

// UI SDK's value children receive the whole state; Base UI's receive the
// value. UI SDK chips also need their value, which Base UI chips infer from
// their order, so chips without one get the value at their position.
function ComboboxValue({
  children,
  placeholder,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  children?: React.ReactNode | ((selectedValue: any) => React.ReactNode);
  placeholder?: React.ReactNode;
}) {
  return (
    <ComboboxValuePrimitive>
      {(state) => {
        if (typeof children === "function") {
          const values = Array.isArray(state.value) ? state.value : [];
          return withChipValues(children(state.value), values);
        }
        if (children !== undefined) return children;
        return state.label === "" && placeholder !== undefined ? placeholder : state.label;
      }}
    </ComboboxValuePrimitive>
  );
}

function withChipValues(node: React.ReactNode, values: readonly unknown[]) {
  let index = 0;
  const walk = (child: React.ReactNode): React.ReactNode =>
    React.Children.map(child, (element) => {
      if (!React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(element)) {
        return element;
      }
      if (element.type === ComboboxChip) {
        const value = element.props.value === undefined ? values[index] : element.props.value;
        index += 1;
        return React.cloneElement(element, { value });
      }
      if (element.props.children === undefined) return element;
      return React.cloneElement(element, undefined, walk(element.props.children));
    });
  return walk(node);
}

// A caller's data-slot wins, as in Base UI: rendered through
// InputGroupButton, the trigger keeps the input-group-button slot.
function ComboboxTrigger({
  className,
  children,
  render,
  "data-slot": slot = "combobox-trigger",
  ...props
}: Omit<React.ComponentProps<typeof ComboboxTriggerPrimitive>, "render" | "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
  render?: BaseRender;
  nativeButton?: boolean;
  "data-slot"?: string;
}) {
  const { nativeButton: _nativeButton, ...rest } = props;
  return (
    <ComboboxTriggerPrimitive
      render={part(slot, "button", render)}
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...rest}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxTriggerPrimitive>
  );
}

function ComboboxClear({
  className,
  render: _render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxClearPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ComboboxClearPrimitive
      className={cn(className)}
      {...props}
      render={
        <InputGroupButton data-slot="combobox-clear" variant="ghost" size="icon-xs">
          <XIcon className="pointer-events-none" />
        </InputGroupButton>
      }
    />
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  render: _render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInputPrimitive>, "render" | "className"> & {
  className?: string;
  children?: React.ReactNode;
  showTrigger?: boolean;
  showClear?: boolean;
  render?: BaseRender;
  value?: React.ComponentProps<"input">["value"];
  defaultValue?: React.ComponentProps<"input">["defaultValue"];
}) {
  return (
    <InputGroup
      className={cn(
        // InputGroup draws the field (border, focus ring, invalid state).
        "w-auto text-[length:var(--control-text,0.8125rem)]",
        className,
      )}
    >
      {/* A render element would take the part's own combobox-input slot, which
          the flavour Input lets win; the group's focus ring keys on this one. */}
      <ComboboxInputPrimitive
        render={(inputProps) => (
          <InputGroupInput
            {...(inputProps as React.ComponentProps<typeof InputGroupInput>)}
            data-slot="input-group-control"
            disabled={disabled}
          />
        )}
        {...(props as React.ComponentProps<typeof ComboboxInputPrimitive>)}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            render={<ComboboxTrigger />}
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

// A Base UI anchor is often a ref; UI SDK reads anything with a box, every
// time it positions, so a ref is read through one.
type AnchorProp = React.ComponentProps<typeof ComboboxContentPrimitive>["anchor"];
function useAnchor(
  anchor: AnchorProp | React.RefObject<Element | null> | undefined,
): AnchorProp | undefined {
  return React.useMemo(() => {
    if (anchor && typeof anchor === "object" && "current" in anchor) {
      const ref = anchor;
      return {
        getBoundingClientRect: () =>
          ref.current?.getBoundingClientRect() ?? new DOMRect(),
      } as AnchorProp;
    }
    return anchor as AnchorProp | undefined;
  }, [anchor]);
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxContentPrimitive>, "render" | "className" | "side" | "anchor"> & {
  className?: string;
  side?: Side | "inline-start" | "inline-end";
  align?: Align;
  anchor?: AnchorProp | React.RefObject<Element | null>;
  render?: BaseRender;
}) {
  const resolvedAnchor = useAnchor(anchor);
  return (
    <ComboboxContentPrimitive
      render={part("combobox-content", "div", render)}
      side={toSide(side)}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      anchor={resolvedAnchor}
      data-chips={!!anchor}
      className={cn(
        "group/combobox-content relative isolate z-50 max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] [--list-available-h:var(--available-height)] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-overlay ring-1 ring-foreground/10 transition-[opacity,scale] duration-150 ease-snappy data-[chips=true]:min-w-(--anchor-width) data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-ending-style:scale-[0.98] data-ending-style:opacity-0 motion-reduce:transition-none *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-[var(--control-h,2.125rem)] *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxList({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxListPrimitive>, "render" | "className" | "children"> & {
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
  render?: BaseRender;
}) {
  const { items } = React.useContext(ItemsContext);
  return (
    <ComboboxListPrimitive
      render={part("combobox-list", "div", render)}
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--list-available-h)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className,
      )}
      {...props}
    >
      {typeof children === "function" ? items?.map((item, index) => children(item, index)) : children}
    </ComboboxListPrimitive>
  );
}

function ComboboxItem({
  className,
  children,
  value,
  label,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxItemPrimitive>, "render" | "className" | "children" | "value"> & {
  className?: string;
  children?: React.ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  value?: any;
  render?: BaseRender;
  index?: number;
  nativeButton?: boolean;
}) {
  const { toLabel } = React.useContext(ItemsContext);
  const { nativeButton: _nativeButton, ...rest } = props;
  return (
    <ComboboxItemPrimitive
      render={part("combobox-item", "div", render)}
      value={value}
      label={label ?? toLabel(value)}
      className={cn(
        "relative flex min-h-[var(--item-h,2rem)] w-full cursor-default items-center gap-[var(--control-gap,0.5rem)] rounded-md py-1 pr-8 pl-2 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:[&_.text-muted-foreground]:text-accent-foreground data-disabled:data-highlighted:bg-transparent data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...rest}
    >
      {children}
      <ComboboxItemIndicatorPrimitive
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxItemIndicatorPrimitive>
    </ComboboxItemPrimitive>
  );
}

function ComboboxGroup({
  className,
  items,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxGroupPrimitive>, "render" | "className"> & {
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  items?: readonly any[];
  render?: BaseRender;
}) {
  return (
    <GroupItemsContext.Provider value={items}>
      <ComboboxGroupPrimitive
        render={part("combobox-group", "div", render)}
        className={cn(className)}
        {...props}
      />
    </GroupItemsContext.Provider>
  );
}

function ComboboxLabel({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxGroupLabelPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ComboboxGroupLabelPrimitive
      render={part("combobox-label", "div", render)}
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

// Renders a group's items (from ComboboxGroup's `items`), else the root's.
function ComboboxCollection({
  children,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  children: (item: any, index: number) => React.ReactNode;
}) {
  const groupItems = React.useContext(GroupItemsContext);
  const { items } = React.useContext(ItemsContext);
  return <>{(groupItems ?? items)?.map((item, index) => children(item, index))}</>;
}

// UI SDK mounts the empty part only while nothing matches, so it shows
// whenever it is in the page.
function ComboboxEmpty({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxEmptyPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ComboboxEmptyPrimitive
      render={part("combobox-empty", "div", render)}
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex data-empty:flex",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxSeparatorPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ComboboxSeparatorPrimitive
      render={part("combobox-separator", "div", render)}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxChipsPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ComboboxChipsPrimitive
      render={part("combobox-chips", "div", render)}
      className={cn(
        "flex min-h-[var(--control-h,2.125rem)] flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-[var(--control-px,0.75rem)] py-1 text-[length:var(--control-text,0.8125rem)] transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  value,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxChipPrimitive>, "render" | "className" | "children" | "value"> & {
  className?: string;
  children?: React.ReactNode;
  showRemove?: boolean;
  // UI SDK chips need their value; ComboboxValue fills it in by position.
  value?: unknown;
  render?: BaseRender;
}) {
  return (
    <ComboboxChipPrimitive
      render={part("combobox-chip", "div", render)}
      value={value}
      className={cn(
        "flex h-[calc(var(--control-h,2.125rem)-0.625rem)] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxChipRemovePrimitive
          className="-ml-1 opacity-50 hover:opacity-100"
          render={
            <Button data-slot="combobox-chip-remove" variant="ghost" size="icon-xs">
              <XIcon className="pointer-events-none" />
            </Button>
          }
        />
      )}
    </ComboboxChipPrimitive>
  );
}

function ComboboxChipsInput({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInputPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
  value?: React.ComponentProps<"input">["value"];
  defaultValue?: React.ComponentProps<"input">["defaultValue"];
}) {
  return (
    <ComboboxInputPrimitive
      render={part("combobox-chip-input", "input", render)}
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...(props as React.ComponentProps<typeof ComboboxInputPrimitive>)}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
