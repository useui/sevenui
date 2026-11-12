"use client";

import type * as React from "react";
import {
  Radio as RadioPrimitive,
  RadioGroup as RadioGroupPrimitive,
  RadioIndicator,
} from "@ui-sdk/react/radio";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

// UI SDK's radio parts render their own slots (`radio`, `radio-indicator`);
// a data-slot on the element `render` returns wins (guide §4.1).
function withSlot<State>(
  slot: string,
  tag: string,
  render?: RenderProp<State>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot }, render, state);
}

type RadioGroupPrimitiveProps = React.ComponentProps<typeof RadioGroupPrimitive>;
type ValueChangeDetails = Parameters<
  NonNullable<RadioGroupPrimitiveProps["onValueChange"]>
>[1];

// Base UI types a radio value as anything; UI SDK holds a string. Values are
// stringified on the way in, as a native radio's would be.
const toValue = (value: unknown) =>
  value === undefined || value === null ? (value as null | undefined) : String(value);

type RadioGroupProps = Omit<
  RadioGroupPrimitiveProps,
  "value" | "defaultValue" | "onValueChange" | "className"
> & {
  className?: string;
  value?: any;
  defaultValue?: any;
  onValueChange?: (value: any, details: ValueChangeDetails) => void;
  // Base UI's ref to the hidden input; UI SDK renders native radios itself.
  inputRef?: React.Ref<HTMLInputElement>;
};

function RadioGroup({
  className,
  value,
  defaultValue,
  inputRef: _inputRef,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      value={toValue(value)}
      defaultValue={toValue(defaultValue)}
      {...props}
    />
  );
}

type RadioPrimitiveProps = React.ComponentProps<typeof RadioPrimitive>;

type RadioGroupItemProps = Omit<
  RadioPrimitiveProps,
  "value" | "className" | "render"
> & {
  className?: string;
  render?: RadioPrimitiveProps["render"] | React.ReactElement<unknown>;
  value: any;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
};

function RadioGroupItem({
  className,
  value,
  nativeButton: _nativeButton,
  inputRef: _inputRef,
  render,
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioPrimitive
      data-slot="radio-group-item"
      render={withSlot(
        "radio-group-item",
        "button",
        render as RadioPrimitiveProps["render"],
      )}
      value={String(value)}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-[max(0.875rem,calc(var(--control-h,2.125rem)*0.47))] shrink-0 rounded-full border border-input transition-[background-color,border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <RadioIndicator
        render={withSlot("radio-group-indicator", "span")}
        className="flex size-full items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioIndicator>
    </RadioPrimitive>
  );
}

export { RadioGroup, RadioGroupItem };
