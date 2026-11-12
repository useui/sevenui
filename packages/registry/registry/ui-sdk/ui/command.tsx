"use client";

import * as React from "react";
import {
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroupLabel as CommandGroupLabelPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  Command as CommandPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
} from "@ui-sdk/react/command";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { SearchIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui-sdk/ui/dialog";
import { InputGroup, InputGroupAddon } from "@/registry/ui-sdk/ui/input-group";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;
type CommandPrimitiveProps = React.ComponentProps<typeof CommandPrimitive>;
type QueryChangeDetails = Parameters<NonNullable<CommandPrimitiveProps["onQueryChange"]>>[1];

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

function defaultItemKey(item: unknown): string {
  if (item !== null && typeof item === "object") {
    const record = item as { value?: unknown; id?: unknown };
    if (typeof record.value === "string") return record.value;
    if (record.id !== undefined) return String(record.id);
  }
  return defaultItemLabel(item);
}

// Base UI's Autocomplete renders the list from `items` through function
// children and hands its filter the item; UI SDK's Command filters the
// commands it renders by a string value. The flavour renders every item,
// keys each by a string, and maps keys back to items for the filter.
type CommandContextValue = {
  items: readonly unknown[] | undefined;
  toLabel: (item: unknown) => string;
  toKey: (item: unknown) => string;
  register: (key: string, item: unknown) => void;
};
const CommandContext = React.createContext<CommandContextValue>({
  items: undefined,
  toLabel: defaultItemLabel,
  toKey: defaultItemKey,
  register: () => {},
});

// The Base UI Autocomplete root props the command takes. Its `value` is the
// search text, which UI SDK calls the query; UI SDK's own `value` is the
// highlighted command and has no Base UI counterpart here.
type CommandProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "onSelect"
> & {
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  items?: readonly any[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, eventDetails: QueryChangeDetails) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  filter?: null | ((itemValue: any, query: string, itemToString?: (itemValue: any) => string) => boolean);
  mode?: "list" | "both" | "inline" | "none";
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  itemToStringValue?: (itemValue: any) => string;
  autoHighlight?: boolean | "always";
  loopFocus?: boolean;
  // Base UI root props with no UI SDK counterpart: accepted and dropped.
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: unknown) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  inline?: boolean;
  keepHighlight?: boolean;
  highlightItemOnHover?: boolean;
  openOnInputClick?: boolean;
  submitOnItemClick?: boolean;
  limit?: number;
  locale?: Intl.LocalesArgument;
  grid?: boolean;
  virtualized?: boolean;
  modal?: boolean;
  actionsRef?: React.RefObject<unknown>;
  inputRef?: React.Ref<HTMLInputElement>;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  onItemHighlighted?: (highlightedValue: any, eventDetails: unknown) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  filteredItems?: readonly any[];
  name?: string;
  form?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
};

function Command({
  className,
  children,
  items,
  value,
  defaultValue,
  onValueChange,
  filter,
  mode,
  itemToStringValue,
  autoHighlight = true,
  loopFocus,
  open: _open,
  defaultOpen: _defaultOpen,
  onOpenChange: _onOpenChange,
  onOpenChangeComplete: _onOpenChangeComplete,
  inline: _inline,
  keepHighlight: _keepHighlight,
  highlightItemOnHover: _highlightItemOnHover,
  openOnInputClick: _openOnInputClick,
  submitOnItemClick: _submitOnItemClick,
  limit: _limit,
  locale: _locale,
  grid: _grid,
  virtualized: _virtualized,
  modal: _modal,
  actionsRef: _actionsRef,
  inputRef: _inputRef,
  onItemHighlighted: _onItemHighlighted,
  filteredItems: _filteredItems,
  name: _name,
  form: _form,
  disabled: _disabled,
  readOnly: _readOnly,
  required: _required,
  ...props
}: CommandProps) {
  const byKey = React.useRef(new Map<string, unknown>());
  const context = React.useMemo<CommandContextValue>(
    () => ({
      items,
      toLabel: itemToStringValue
        ? (item) => (typeof item === "string" ? item : itemToStringValue(item))
        : defaultItemLabel,
      toKey: itemToStringValue
        ? (item) => (typeof item === "string" ? item : itemToStringValue(item))
        : defaultItemKey,
      register: (key, item) => {
        byKey.current.set(key, item);
      },
    }),
    [items, itemToStringValue],
  );

  // Base UI's default matches the text itself; mode "none" leaves the
  // filtering to the caller.
  let uiFilter: CommandPrimitiveProps["filter"] = "contains";
  if (filter === null || mode === "none" || mode === "inline") uiFilter = false;
  else if (filter) {
    uiFilter = (entry, query) => {
      const key = String(entry.value);
      const item = byKey.current.has(key) ? byKey.current.get(key) : entry.value;
      return filter(item, query, context.toLabel);
    };
  }

  return (
    <CommandContext.Provider value={context}>
      <CommandPrimitive
        query={value}
        defaultQuery={defaultValue}
        onQueryChange={onValueChange}
        filter={uiFilter}
        autoHighlight={autoHighlight !== false}
        loop={loopFocus}
        render={(rootProps, state) =>
          renderElement("div", { ...rootProps, "data-slot": "command" }, undefined, state)
        }
        className={cn(
          "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
          className,
        )}
        {...(props as Omit<CommandPrimitiveProps, "children">)}
      >
        {children}
      </CommandPrimitive>
    </CommandContext.Provider>
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0 shadow-overlay",
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandInputPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-[var(--control-h,2.125rem)]! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandInputPrimitive
          render={part("command-input", "input", render)}
          className={cn(
            "w-full bg-transparent text-[length:var(--control-text,0.8125rem)] outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({
  className,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandListPrimitive>, "render" | "className" | "children"> & {
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
  render?: BaseRender;
}) {
  const { items } = React.useContext(CommandContext);
  return (
    <CommandListPrimitive
      render={part("command-list", "div", render)}
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    >
      {typeof children === "function" ? items?.map((item, index) => children(item, index)) : children}
    </CommandListPrimitive>
  );
}

function CommandEmpty({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandEmptyPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <CommandEmptyPrimitive
      render={part("command-empty", "div", render)}
      className={cn(
        "not-empty:py-6 text-center text-[length:var(--control-text,0.8125rem)] text-muted-foreground",
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
  items,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandGroupPrimitive>, "children" | "render" | "className"> & {
  className?: string;
  heading?: React.ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the item as any.
  children: (item: any, index: number) => React.ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types items as any[].
  items?: readonly any[];
  render?: BaseRender;
}) {
  const { items: rootItems } = React.useContext(CommandContext);
  return (
    <CommandGroupPrimitive
      render={part("command-group", "div", render)}
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {heading != null && (
        <CommandGroupLabelPrimitive className="px-2 pt-2 pb-1 font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {heading}
        </CommandGroupLabelPrimitive>
      )}
      {(items ?? rootItems)?.map((item, index) => children(item, index))}
    </CommandGroupPrimitive>
  );
}

function CommandSeparator({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandSeparatorPrimitive>, "render" | "className"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <CommandSeparatorPrimitive
      render={part("command-separator", "div", render)}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// Base UI items take any value and run `onClick` for pointer and keyboard;
// UI SDK commands take a string value and run `onSelect`, so both are mapped.
function CommandItem({
  className,
  value,
  label,
  onClick,
  render,
  ...props
}: Omit<React.ComponentProps<typeof CommandItemPrimitive>, "render" | "className" | "value" | "onClick"> & {
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the value as any.
  value?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI hands onClick its own event type.
  onClick?: (event: any) => void;
  render?: BaseRender;
  nativeButton?: boolean;
}) {
  const { toLabel, toKey, register } = React.useContext(CommandContext);
  const { nativeButton: _nativeButton, ...rest } = props;
  const key = value === undefined ? undefined : toKey(value);
  if (key !== undefined) register(key, value);
  return (
    <CommandItemPrimitive
      render={part("command-item", "div", render)}
      value={key}
      label={label ?? (value === undefined ? undefined : toLabel(value))}
      onSelect={onClick}
      className={cn(
        "group/command-item relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-[var(--control-gap,0.5rem)] rounded-md px-2 py-0.5 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-accent-foreground",
        className,
      )}
      {...rest}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-sm px-1 font-mono text-[10.5px] leading-none font-medium text-muted-foreground group-data-highlighted/command-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
