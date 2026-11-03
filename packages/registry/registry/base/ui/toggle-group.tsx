"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { toggleVariants } from "@/registry/base/ui/toggle";

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

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        // The default variant is a segmented control: a recessed tray, 2px of
        // padding, and items sized 4px under the control height so the whole
        // group lands on the density step. The outline variant keeps joined,
        // bordered segments without a tray.
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(--theme(--radius-md),10px)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch not-data-[variant=outline]:bg-surface-tray not-data-[variant=outline]:p-0.5 not-data-[variant=outline]:shadow-[inset_0_0_0_1px_var(--hairline,var(--border)),var(--elevation-inset,0_0_#0000)]",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 focus:z-10 focus-visible:z-10",
        // Segments inside the default tray: inner radius, 4px under each size
        // step, muted until pressed.
        "data-[variant=default]:rounded-[max(0px,calc(--theme(--radius-lg)-2px))] data-[variant=default]:data-[size=sm]:rounded-[max(0px,calc(min(--theme(--radius-md),10px)-2px))] data-[variant=default]:data-[size=default]:h-[calc(var(--control-h,2.125rem)-4px)] data-[variant=default]:data-[size=default]:min-w-[calc(var(--control-h,2.125rem)-4px)] data-[variant=default]:data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem-4px)] data-[variant=default]:data-[size=sm]:min-w-[calc(var(--control-h,2.125rem)-0.25rem-4px)] data-[variant=default]:data-[size=lg]:h-[calc(var(--control-h,2.125rem)+0.25rem-4px)] data-[variant=default]:data-[size=lg]:min-w-[calc(var(--control-h,2.125rem)+0.25rem-4px)] data-[variant=default]:not-aria-pressed:text-muted-foreground data-[variant=default]:not-aria-pressed:hover:text-foreground",
        // Joined outline segments when spacing is 0.
        "group-data-[spacing=0]/toggle-group:data-[variant=outline]:rounded-none group-data-[spacing=0]/toggle-group:data-[variant=outline]:px-2 group-data-[spacing=0]/toggle-group:data-[variant=outline]:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:data-[variant=outline]:has-data-[icon=inline-start]:pl-1.5 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:rounded-l-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:rounded-t-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:last:rounded-r-lg group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:last:rounded-b-lg group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
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
