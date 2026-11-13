"use client";

import type * as React from "react";
import {
  MeterIndicator,
  MeterLabel as MeterLabelPrimitive,
  Meter as MeterPrimitive,
  MeterTrack,
  MeterValue as MeterValuePrimitive,
} from "@ui-sdk/react/meter";

import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. So the slot is set there: a caller's own data-slot, which replaced
// the default in Base UI, or the default. A caller's `render` still renders.
function slotted<P extends object>(
  slot: string | undefined,
  tag: string,
  props: P,
): P {
  const {
    "data-slot": own,
    render,
    ...rest
  } = props as P & { "data-slot"?: string; render?: RenderProp<never> };
  const name = own ?? slot;
  return {
    ...rest,
    render: (partProps: Record<string, unknown>, state: never) =>
      renderElement(
        tag,
        name ? { ...partProps, "data-slot": name } : partProps,
        render,
        state,
      ),
  } as P;
}

// Base UI takes any Intl locale; UI SDK takes a language tag.
function toLocale(locale: Intl.LocalesArgument): string | undefined {
  if (locale === undefined) return undefined;
  const first = Array.isArray(locale) ? locale[0] : locale;
  return first === undefined ? undefined : String(first);
}

// Base UI's `getAriaValueText(formatted, value)` is UI SDK's
// `getValueLabel(value, { formatted })`.
function Meter({
  className,
  children,
  locale,
  getAriaValueText,
  ...props
}: Omit<
  React.ComponentProps<typeof MeterPrimitive>,
  "className" | "children" | "locale"
> & {
  className?: string;
  children?: React.ReactNode;
  locale?: Intl.LocalesArgument;
  getAriaValueText?: (formattedValue: string, value: number) => string;
}) {
  return (
    <MeterPrimitive
      locale={toLocale(locale)}
      getValueLabel={
        getAriaValueText &&
        ((value, details) => getAriaValueText(details.formatted, value))
      }
      className={cn("grid w-full gap-2", className)}
      {...slotted("meter", "div", props)}
    >
      {children}
      <MeterTrack
        data-slot="meter-track"
        className="col-span-full h-1 w-full overflow-hidden rounded-full bg-primary/20 in-data-[density=compact]:h-[3px]"
      >
        <MeterIndicator
          data-slot="meter-indicator"
          className="h-full bg-primary transition-[width] duration-300 ease-snappy motion-reduce:transition-none"
        />
      </MeterTrack>
    </MeterPrimitive>
  );
}

function MeterLabel({
  className,
  ...props
}: Omit<React.ComponentProps<typeof MeterLabelPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <MeterLabelPrimitive
      className={cn("text-sm font-medium", className)}
      {...slotted("meter-label", "span", props)}
    />
  );
}

// Base UI calls a function child with (formatted, value); UI SDK calls it
// with its state.
function MeterValue({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof MeterValuePrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?:
    | React.ReactNode
    | ((formattedValue: string, value: number) => React.ReactNode);
}) {
  return (
    <MeterValuePrimitive
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...slotted("meter-value", "span", props)}
    >
      {typeof children === "function"
        ? (state) => children(state.text, state.value)
        : children}
    </MeterValuePrimitive>
  );
}

export { Meter, MeterLabel, MeterValue };
