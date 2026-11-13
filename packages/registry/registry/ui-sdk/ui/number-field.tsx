"use client";

import * as React from "react";
import {
  NumberInput as NumberInputPrimitive,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
} from "@ui-sdk/react/number-input";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "cn";

type NumberInputPrimitiveProps = React.ComponentProps<
  typeof NumberInputPrimitive
>;
type CommitDetails = Parameters<
  NonNullable<NumberInputPrimitiveProps["onValueCommit"]>
>[1];

// Base UI's root `id` and `inputRef` belong to the input; UI SDK's root is
// the wrapping div, so the root hands them to NumberFieldInput.
const InputPropsContext = React.createContext<{
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}>({});

type NumberFieldProps = Omit<
  NumberInputPrimitiveProps,
  "className" | "step" | "locale" | "wheel" | "onValueCommit"
> & {
  className?: string;
  // Base UI accepts "any"; UI SDK steps by a number.
  step?: number | "any";
  locale?: Intl.LocalesArgument;
  // Base UI names, mapped to UI SDK's `wheel` and `onValueCommit`.
  allowWheelScrub?: boolean;
  onValueCommitted?: (value: number | null, details: CommitDetails) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  // Base UI only: UI SDK always clamps and snaps a committed value.
  allowOutOfRange?: boolean;
  snapOnStep?: boolean;
};

function NumberField({
  className,
  id,
  inputRef,
  step,
  locale,
  allowWheelScrub,
  onValueCommitted,
  allowOutOfRange: _allowOutOfRange,
  snapOnStep: _snapOnStep,
  ...props
}: NumberFieldProps) {
  const inputProps = React.useMemo(() => ({ id, inputRef }), [id, inputRef]);
  return (
    <InputPropsContext.Provider value={inputProps}>
      <NumberInputPrimitive
        className={cn("grid gap-2", className)}
        step={step === "any" ? undefined : step}
        locale={typeof locale === "string" ? locale : undefined}
        wheel={allowWheelScrub}
        onValueCommit={onValueCommitted}
        {...props}
      />
    </InputPropsContext.Provider>
  );
}

function NumberFieldScrubArea({
  className,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputScrubArea>, "className"> & {
  className?: string;
}) {
  return (
    <NumberInputScrubArea
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function NumberFieldGroup({
  className,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputGroup>, "className"> & {
  className?: string;
}) {
  return (
    <NumberInputGroup
      className={cn(
        "flex h-[var(--control-h,2.125rem)] w-fit items-stretch overflow-hidden rounded-md border border-input shadow-xs transition-shadow duration-150 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

// Base UI names the stepper buttons Decrease and Increase; UI SDK leaves
// them unnamed. A caller's aria-label still wins.
const stepperClasses =
  "flex w-[var(--control-h,2.125rem)] shrink-0 items-center justify-center bg-muted/50 text-muted-foreground transition-[color,background-color] duration-150 select-none motion-reduce:transition-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

function NumberFieldDecrement({
  className,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputDecrement>, "className"> & {
  className?: string;
}) {
  return (
    <NumberInputDecrement
      aria-label="Decrease"
      className={cn(stepperClasses, "border-r border-input", className)}
      {...props}
    >
      <MinusIcon />
    </NumberInputDecrement>
  );
}

function NumberFieldInput({
  className,
  id,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputControl>, "className"> & {
  className?: string;
}) {
  const root = React.useContext(InputPropsContext);
  const inputRef = root.inputRef;
  return (
    <NumberInputControl
      id={id ?? root.id}
      ref={
        inputRef
          ? (node: HTMLInputElement | null) => {
              for (const target of [ref, inputRef]) {
                if (typeof target === "function") target(node);
                else if (target) target.current = node;
              }
            }
          : ref
      }
      className={cn(
        "h-full w-16 min-w-0 bg-transparent text-center text-[length:var(--control-text,0.8125rem)] text-foreground tabular-nums outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldIncrement({
  className,
  ...props
}: Omit<React.ComponentProps<typeof NumberInputIncrement>, "className"> & {
  className?: string;
}) {
  return (
    <NumberInputIncrement
      aria-label="Increase"
      className={cn(stepperClasses, "border-l border-input", className)}
      {...props}
    >
      <PlusIcon />
    </NumberInputIncrement>
  );
}

export {
  NumberField,
  NumberFieldScrubArea,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
};
