"use client";

import * as React from "react";
import {
  AccordionHeader as AccordionHeaderPrimitive,
  AccordionItem as AccordionItemPrimitive,
  AccordionPanel as AccordionPanelPrimitive,
  Accordion as AccordionPrimitive,
  AccordionTrigger as AccordionTriggerPrimitive,
} from "@ui-sdk/react/accordion";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

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

// The items' original values by their string, so onValueChange hands back
// what the item was given (`2`, not `"2"`), as Base UI does.
type AccordionChangeDetails = Parameters<
  NonNullable<React.ComponentProps<typeof AccordionPrimitive>["onValueChange"]>
>[1];

const AccordionValuesContext = React.createContext<Map<string, unknown> | null>(null);

// `orientation` and `loopFocus` are Base UI root props with no UI SDK
// counterpart; they are accepted for API parity and dropped.
function Accordion({
  className,
  value,
  defaultValue,
  onValueChange,
  orientation: _orientation,
  loopFocus: _loopFocus,
  "data-slot": slot = "accordion",
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitive>,
  "className" | "render" | "value" | "defaultValue" | "onValueChange"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
  orientation?: "vertical" | "horizontal";
  loopFocus?: boolean;
  // Base UI types item values as any; UI SDK holds strings.
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's AccordionValue is any[].
  value?: any[];
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's AccordionValue is any[].
  defaultValue?: any[];
  // biome-ignore lint/suspicious/noExplicitAny: Base UI's AccordionValue is any[].
  onValueChange?: (value: any[], details: AccordionChangeDetails) => void;
}) {
  const [values] = React.useState(() => new Map<string, unknown>());
  return (
    <AccordionValuesContext.Provider value={values}>
      <AccordionPrimitive
        render={part(slot, "div", render)}
        // Base UI lets `value` win over `defaultValue`; UI SDK rejects both.
        {...(value !== undefined ? { value } : { defaultValue })}
        onValueChange={
          onValueChange &&
          ((next: string[], details: AccordionChangeDetails) =>
            onValueChange(
              next.map((item) =>
                typeof item === "string" && values.has(item) ? values.get(item) : item,
              ),
              details,
            ))
        }
        className={cn("flex w-full flex-col", className)}
        {...props}
      />
    </AccordionValuesContext.Provider>
  );
}

function AccordionItem({
  className,
  "data-slot": slot = "accordion-item",
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionItemPrimitive>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
}) {
  const values = React.useContext(AccordionValuesContext);
  const { value } = props;
  React.useLayoutEffect(() => {
    if (!values || value === undefined) return;
    const key = String(value);
    values.set(key, value);
    return () => {
      if (values.get(key) === value) values.delete(key);
    };
  }, [values, value]);
  return (
    <AccordionItemPrimitive
      render={part(slot, "div", render)}
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

// Base UI's Header carries no data-slot; UI SDK's accordion-header is
// dropped so the markup matches. Base UI also marks an open item's trigger
// with data-panel-open, which examples style.
function AccordionTrigger({
  className,
  children,
  render,
  nativeButton: _nativeButton,
  "data-slot": slot = "accordion-trigger",
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionTriggerPrimitive>,
  "className" | "children" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  children?: React.ReactNode;
  render?: BaseRender;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
}) {
  return (
    <AccordionHeaderPrimitive
      render={(headerProps) => {
        const { "data-slot": _slot, ...rest } = headerProps;
        return <h3 {...rest} />;
      }}
      className="flex"
    >
      <AccordionTriggerPrimitive
        render={part<{ open: boolean }>(slot, "button", render, (state) => ({
          "data-panel-open": state.open ? "" : undefined,
        }))}
        className={cn(
          "group/accordion-trigger relative flex min-h-[var(--item-h,2rem)] flex-1 items-start justify-between gap-[var(--control-gap,0.5rem)] rounded-md border border-transparent py-[max(0.1875rem,calc((var(--item-h,2rem)-1.25rem)/2-1px))] text-left text-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
}

function AccordionContent({
  className,
  children,
  render,
  "data-slot": slot = "accordion-content",
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPanelPrimitive>,
  "className" | "children" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  children?: React.ReactNode;
  render?: BaseRender;
}) {
  return (
    <AccordionPanelPrimitive
      render={part(slot, "div", render)}
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up motion-reduce:animate-none"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-3 text-muted-foreground data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPanelPrimitive>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
