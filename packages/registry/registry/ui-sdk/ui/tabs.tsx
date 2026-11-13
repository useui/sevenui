"use client";

import * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import {
  TabsList as TabsListPrimitive,
  TabsPanel as TabsPanelPrimitive,
  Tabs as TabsPrimitive,
  TabsTab as TabsTabPrimitive,
} from "@ui-sdk/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names are set there. A caller's own data-slot
// replaces the default, as it does in Base UI.
function part<State extends object>(
  slot: string,
  tag: string,
  render: BaseRender | undefined,
  extra?: (state: State) => Record<string, unknown>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(
      tag,
      { ...props, "data-slot": slot, ...extra?.(state) },
      render as RenderProp<State> | undefined,
      state,
    );
}

// Base UI sets keyboard activation and focus looping on the list; UI SDK
// sets them on the root. The list reports its values up.
type ListOptions = { activateOnFocus: boolean; loopFocus: boolean };
const TabsOptionsContext = React.createContext<
  ((options: ListOptions) => void) | null
>(null);

// The tabs' original values by their string, so onValueChange hands back
// what the tab was given (`2`, not `"2"`), as Base UI does.
const TabsValuesContext = React.createContext<Map<string, unknown> | null>(null);

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive>;
type TabsChangeDetails = Parameters<
  NonNullable<TabsRootProps["onValueChange"]>
>[1];

// Base UI types a tab value as `any`, and examples hand it straight to a
// typed setter, so the wrapper keeps that typing over UI SDK's string.
function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  "data-slot": slot = "tabs",
  render,
  ...props
}: Omit<
  TabsRootProps,
  "className" | "value" | "defaultValue" | "onValueChange" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's Tabs.Tab.Value is any
  value?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's Tabs.Tab.Value is any
  defaultValue?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's Tabs.Tab.Value is any
  onValueChange?: (value: any, details: TabsChangeDetails) => void;
}) {
  // Base UI's TabsList defaults: arrows move focus only, and focus loops.
  const [options, setOptions] = React.useState<ListOptions>({
    activateOnFocus: false,
    loopFocus: true,
  });
  const report = React.useCallback((next: ListOptions) => {
    setOptions((current) =>
      current.activateOnFocus === next.activateOnFocus &&
      current.loopFocus === next.loopFocus
        ? current
        : next,
    );
  }, []);
  const [values] = React.useState(() => new Map<string, unknown>());
  return (
    <TabsOptionsContext.Provider value={report}>
      <TabsValuesContext.Provider value={values}>
        <TabsPrimitive
          render={part(slot, "div", render)}
          data-orientation={orientation}
          orientation={orientation}
          // Base UI lets `value` win over `defaultValue`; UI SDK rejects both.
          {...(value !== undefined ? { value } : { defaultValue })}
          onValueChange={
            onValueChange &&
            ((next: unknown, details: TabsChangeDetails) =>
              onValueChange(
                typeof next === "string" && values.has(next) ? values.get(next) : next,
                details,
              ))
          }
          activation={options.activateOnFocus ? "automatic" : "manual"}
          loop={options.loopFocus}
          className={cn(
            "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
            className,
          )}
          {...props}
        />
      </TabsValuesContext.Provider>
    </TabsOptionsContext.Provider>
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center gap-0.5 rounded-lg p-0.5 text-muted-foreground group-data-[orientation=horizontal]/tabs:h-[var(--control-h,2.125rem)] group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  activateOnFocus = false,
  loopFocus = true,
  "data-slot": slot = "tabs-list",
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof TabsListPrimitive>,
  "className" | "render"
> &
  VariantProps<typeof tabsListVariants> & {
    className?: string;
    "data-slot"?: string;
    render?: BaseRender;
    activateOnFocus?: boolean;
    loopFocus?: boolean;
  }) {
  const report = React.useContext(TabsOptionsContext);
  React.useLayoutEffect(() => {
    report?.({ activateOnFocus, loopFocus });
  }, [report, activateOnFocus, loopFocus]);
  return (
    <TabsListPrimitive
      render={part(slot, "div", render)}
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

// Base UI marks the selected tab with data-active, which the classes and
// examples style; UI SDK's data-selected stays beside it.
function TabsTrigger({
  className,
  render,
  nativeButton: _nativeButton,
  "data-slot": slot = "tabs-trigger",
  ...props
}: Omit<
  React.ComponentProps<typeof TabsTabPrimitive>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
}) {
  const values = React.useContext(TabsValuesContext);
  const { value } = props;
  React.useLayoutEffect(() => {
    if (!values) return;
    const key = String(value);
    values.set(key, value);
    return () => {
      if (values.get(key) === value) values.delete(key);
    };
  }, [values, value]);
  return (
    <TabsTabPrimitive
      render={part<{ selected: boolean }>(slot, "button", render, (state) => ({
        "data-active": state.selected ? "" : undefined,
      }))}
      className={cn(
        "relative inline-flex h-[calc(var(--control-h,2.125rem)-4px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,box-shadow] duration-150 ease-snappy motion-reduce:transition-none group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),inset_0_-2px_0_var(--foreground)] dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity after:duration-150 motion-reduce:after:transition-none group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-3px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-[3px] group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  render,
  "data-slot": slot = "tabs-content",
  ...props
}: Omit<
  React.ComponentProps<typeof TabsPanelPrimitive>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
}) {
  return (
    <TabsPanelPrimitive
      render={part(slot, "div", render)}
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
