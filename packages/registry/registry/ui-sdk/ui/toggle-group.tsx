"use client";

import * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import {
  ToggleGroup as ToggleGroupPrimitive,
  Toggle as TogglePrimitive,
} from "@ui-sdk/react/toggle";
import { type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { toggleVariants } from "@/registry/ui-sdk/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

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

// Base UI's `loopFocus` is UI SDK's `loop`. The wrapper passes
// `orientation` on, so a vertical group moves with the up and down arrows.
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  loopFocus,
  value,
  defaultValue,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive>,
  "className" | "children" | "orientation"
> &
  VariantProps<typeof toggleVariants> & {
    className?: string;
    children?: React.ReactNode;
    spacing?: number;
    orientation?: "horizontal" | "vertical";
    loopFocus?: boolean;
  }) {
  return (
    <ToggleGroupPrimitive
      orientation={orientation}
      loop={loopFocus}
      // Base UI lets `value` win over `defaultValue`; UI SDK rejects both.
      {...(value !== undefined ? { value } : { defaultValue })}
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(--theme(--radius-md),10px)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
      {...slotted("toggle-group", "div", props)}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so the item keeps SevenUI's toggle-group-item slot.
function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  render,
  nativeButton: _nativeButton,
  "data-slot": slot = "toggle-group-item",
  ...props
}: Omit<
  React.ComponentProps<typeof TogglePrimitive>,
  "className" | "children" | "render"
> &
  VariantProps<typeof toggleVariants> & {
    className?: string;
    children?: React.ReactNode;
    "data-slot"?: string;
    render?: React.ReactElement<unknown> | RenderProp<never>;
    // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
    nativeButton?: boolean;
  }) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      render={(itemProps, state) =>
        renderElement(
          "button",
          { ...itemProps, "data-slot": slot },
          render as RenderProp<typeof state> | undefined,
          state,
        )
      }
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
