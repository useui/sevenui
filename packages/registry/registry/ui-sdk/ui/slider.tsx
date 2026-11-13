"use client";

import * as React from "react";
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
  // UI SDK centres thumbs on their value; "edge" (the default, as in base)
  // shifts them back inside the track. Thumbs never swap in UI SDK.
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
  thumbAlignment = "edge",
  thumbCollisionBehavior: _thumbCollisionBehavior,
  inputRef: _inputRef,
  ...props
}: SliderProps) {
  // An uncontrolled slider defaults to the scalar `min`, so the no-value
  // fallback is a single thumb.
  const { current, track } = useCurrentValue<number | readonly number[]>(
    value,
    defaultValue ?? min,
  );
  useFieldControl({
    value: () => toValue(current.current),
    formValue: () => toValue(current.current),
    disabled: () => props.disabled === true,
  });
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
      onValueChange={(next, details) => {
        onValueChange?.(next, details);
        track(next, details);
      }}
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
            className={cn(
              "relative block size-(--slider-thumb) shrink-0 rounded-full border border-ring bg-white shadow-raised ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden has-focus-visible:ring-3 active:ring-3 data-disabled:pointer-events-none disabled:pointer-events-none disabled:opacity-50",
              // Edge alignment: UI SDK centres the thumb on its value, so a
              // translate of (50% - position) of the thumb's own size keeps it
              // inside the track at any thumb size, as Base UI's measured inset.
              thumbAlignment !== "center" &&
                "ltr:data-[orientation=horizontal]:[translate:calc(50%-var(--slider-thumb-position))_-50%]! rtl:data-[orientation=horizontal]:[translate:calc(var(--slider-thumb-position)-50%)_-50%]! data-[orientation=vertical]:[translate:-50%_var(--slider-thumb-position)]!",
            )}
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  );
}

export { Slider };
