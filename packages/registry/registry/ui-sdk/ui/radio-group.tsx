"use client";

import * as React from "react";
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

// The items' original values by their string, so onValueChange hands back
// what the item was given (`2`, not `"2"`), as Base UI does.
const RadioValuesContext = React.createContext<Map<string, unknown> | null>(null);

function RadioGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  inputRef: _inputRef,
  ...props
}: RadioGroupProps) {
  const [values] = React.useState(() => new Map<string, unknown>());
  const { current, track } = useCurrentValue<unknown>(value, defaultValue);
  useFieldControl({
    value: () => current.current ?? null,
    formValue: () => current.current ?? null,
    disabled: () => props.disabled === true,
  });
  return (
    <RadioValuesContext.Provider value={values}>
      <RadioGroupPrimitive
        data-slot="radio-group"
        className={cn("grid w-full gap-2", className)}
        value={toValue(value)}
        defaultValue={toValue(defaultValue)}
        onValueChange={(next, details) => {
          const original = next != null && values.has(next) ? values.get(next) : next;
          onValueChange?.(original, details);
          track(original, details);
        }}
        {...props}
      />
    </RadioValuesContext.Provider>
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
  const values = React.useContext(RadioValuesContext);
  React.useLayoutEffect(() => {
    if (!values) return;
    const key = String(value);
    values.set(key, value);
    return () => {
      if (values.get(key) === value) values.delete(key);
    };
  }, [values, value]);
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
