"use client";

import type * as React from "react";
import {
  ProgressIndicator as ProgressIndicatorPrimitive,
  ProgressLabel as ProgressLabelPrimitive,
  Progress as ProgressPrimitive,
  ProgressTrack as ProgressTrackPrimitive,
  ProgressValue as ProgressValuePrimitive,
} from "@ui-sdk/react/progress";
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
// `getValueLabel(value, { formatted })`. Base UI also announces an
// indeterminate bar as "indeterminate progress", where UI SDK sets no text.
function Progress({
  className,
  children,
  value,
  locale,
  getAriaValueText,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressPrimitive>,
  "className" | "children" | "locale"
> & {
  className?: string;
  children?: React.ReactNode;
  locale?: Intl.LocalesArgument;
  getAriaValueText?: (
    formattedValue: string | null,
    value: number | null,
  ) => string;
}) {
  return (
    <ProgressPrimitive
      value={value}
      locale={toLocale(locale)}
      getValueLabel={(current, details) =>
        getAriaValueText
          ? getAriaValueText(
              current === null ? null : details.formatted,
              current,
            )
          : current === null
            ? "indeterminate progress"
            : details.formatted
      }
      className={cn("flex flex-wrap gap-3", className)}
      {...slotted("progress", "div", props)}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive>
  );
}

function ProgressTrack({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ProgressTrackPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ProgressTrackPrimitive
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted in-data-[density=compact]:h-[3px]",
        className,
      )}
      {...slotted("progress-track", "div", props)}
    />
  );
}

function ProgressIndicator({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressIndicatorPrimitive>,
  "className"
> & {
  className?: string;
}) {
  return (
    <ProgressIndicatorPrimitive
      className={cn(
        "h-full bg-primary transition-[width] duration-300 ease-snappy motion-reduce:transition-none",
        className,
      )}
      {...slotted("progress-indicator", "div", props)}
    />
  );
}

function ProgressLabel({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ProgressLabelPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ProgressLabelPrimitive
      className={cn("text-sm font-medium", className)}
      {...slotted("progress-label", "span", props)}
    />
  );
}

// Base UI calls a function child with (formatted, value), formatted being
// null while indeterminate; UI SDK calls it with its state.
function ProgressValue({
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressValuePrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?:
    | React.ReactNode
    | ((
        formattedValue: string | null,
        value: number | null,
      ) => React.ReactNode);
}) {
  return (
    <ProgressValuePrimitive
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className,
      )}
      {...slotted("progress-value", "span", props)}
    >
      {typeof children === "function"
        ? (state) =>
            children(state.value === null ? null : state.text, state.value)
        : children}
    </ProgressValuePrimitive>
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
