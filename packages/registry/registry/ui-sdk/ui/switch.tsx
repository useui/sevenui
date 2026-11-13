"use client";

import type * as React from "react";
import {
  Switch as SwitchPrimitive,
  SwitchThumb,
} from "@ui-sdk/react/switch";
import { renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type SwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitive>, "className"> & {
  className?: string;
  size?: "sm" | "default";
  // Base UI submits `uncheckedValue` while off; UI SDK submits nothing, so
  // the flavour adds that hidden input itself. `inputRef` (Base UI's hidden
  // input) and `nativeButton` (a hint for a non-button `render`) are
  // accepted, not mapped.
  uncheckedValue?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  nativeButton?: boolean;
};

function Switch({
  className,
  size = "default",
  uncheckedValue,
  inputRef: _inputRef,
  nativeButton: _nativeButton,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={size}
      className={cn(
        // Track geometry lives in two variables set here: --switch-h and
        // --switch-w. A [data-density=compact] ancestor and size="sm" each
        // step them down; the thumb is --switch-h minus the 2px inset on each
        // side (1px transparent border plus 1px padding), and travels
        // --switch-w minus --switch-h.
        "[--switch-h:19px] [--switch-w:2rem] [[data-density=compact]_&]:[--switch-h:1rem] [[data-density=compact]_&]:[--switch-w:1.75rem] data-[size=sm]:[--switch-h:1rem] data-[size=sm]:[--switch-w:1.75rem] [[data-density=compact]_&]:data-[size=sm]:[--switch-h:14px] [[data-density=compact]_&]:data-[size=sm]:[--switch-w:1.5rem]",
        "peer group/switch relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 items-center rounded-full border border-transparent p-px transition-[color,background-color,border-color,box-shadow] duration-200 outline-none motion-reduce:transition-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchThumb
        render={(thumbProps, state) => (
          <>
            {renderElement("span", thumbProps, undefined, state)}
            {uncheckedValue !== undefined && props.name && !state.checked && !state.disabled ? (
              <input type="hidden" name={props.name} value={uncheckedValue} form={props.form} />
            ) : null}
          </>
        )}
        data-slot="switch-thumb"
        className="pointer-events-none block size-[calc(var(--switch-h)-4px)] rounded-full bg-white shadow-raised data-checked:bg-primary-foreground transition-transform duration-200 ease-spring motion-reduce:transition-none data-checked:translate-x-[calc(var(--switch-w)-var(--switch-h))] data-unchecked:translate-x-0"
      />
    </SwitchPrimitive>
  );
}

export { Switch };
