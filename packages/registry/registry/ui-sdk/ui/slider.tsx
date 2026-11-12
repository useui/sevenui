"use client";

import type * as React from "react";
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type SliderPrimitiveProps = React.ComponentProps<typeof SliderPrimitive>;
type ChangeDetails = Parameters<
  NonNullable<SliderPrimitiveProps["onValueChange"]>
>[1];
type CommitDetails = Parameters<
  NonNullable<SliderPrimitiveProps["onValueCommit"]>
>[1];

// UI SDK's indicator renders its own `slider-indicator` slot; SevenUI's is
// `slider-range`. A data-slot on the element `render` returns wins.
function withSlot<State>(slot: string, tag: string): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot }, undefined, state);
}

type SliderProps = Omit<
  SliderPrimitiveProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onValueCommit"
  | "className"
  | "locale"
> & {
  className?: string;
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  onValueChange?: (value: number | number[], details: ChangeDetails) => void;
  // Base UI names, mapped to UI SDK's `onValueCommit` and
  // `minStepsBetweenThumbs`.
  onValueCommitted?: (value: number | number[], details: CommitDetails) => void;
  minStepsBetweenValues?: number;
  locale?: Intl.LocalesArgument;
  // Base UI only: UI SDK positions thumbs itself and never lets them swap.
  thumbAlignment?: "center" | "edge" | "edge-client-only";
  thumbCollisionBehavior?: "push" | "swap" | "none";
  inputRef?: React.Ref<HTMLInputElement>;
};

const toValue = (value: number | readonly number[] | undefined) =>
  Array.isArray(value) ? [...value] : (value as number | undefined);

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  minStepsBetweenValues,
  locale,
  thumbAlignment: _thumbAlignment,
  thumbCollisionBehavior: _thumbCollisionBehavior,
  inputRef: _inputRef,
  ...props
}: SliderProps) {
  // An uncontrolled slider defaults to the scalar `min`, so the no-value
  // fallback is a single thumb.
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min];

  return (
    <SliderPrimitive
      className={cn(
        // The thumb size steps with density through --slider-thumb.
        "[--slider-thumb:0.875rem] [[data-density=compact]_&]:[--slider-thumb:0.75rem] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className,
      )}
      data-slot="slider"
      defaultValue={toValue(defaultValue)}
      value={toValue(value)}
      min={min}
      max={max}
      minStepsBetweenThumbs={minStepsBetweenValues}
      locale={typeof locale === "string" ? locale : undefined}
      onValueChange={onValueChange}
      onValueCommit={onValueCommitted}
      {...props}
    >
      <SliderControl className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderTrack
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
        >
          <SliderIndicator
            render={withSlot("slider-range", "div")}
            className="bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderTrack>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderThumb
            data-slot="slider-thumb"
            key={index}
            index={index}
            // UI SDK focuses the range input inside the thumb, so the focus
            // ring follows has-focus-visible on the thumb.
            className="relative block size-(--slider-thumb) shrink-0 rounded-full border border-ring bg-white shadow-raised ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden has-focus-visible:ring-3 active:ring-3 data-disabled:pointer-events-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  );
}

export { Slider };
