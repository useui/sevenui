"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Textarea } from "@/registry/base/ui/textarea";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-[var(--control-h,2.125rem)] w-full min-w-0 items-center rounded-lg bg-surface-inset text-foreground shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input)),var(--elevation-inset,0_0_transparent)] transition-shadow duration-150 outline-none motion-reduce:transition-none",
        // The ring sits on the wrapper; inside a combobox popup the popup owns focus.
        "has-[[data-slot=input-group-control]:focus-visible]:focus-ring in-data-[slot=combobox-content]:[--focus-width:0px]",
        "has-disabled:opacity-50",
        "has-[[data-slot][aria-invalid=true]]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent),var(--elevation-inset,0_0_transparent)] has-[[data-slot][aria-invalid=true]]:[--focus-color:var(--destructive)]",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-[length:var(--control-text,0.8125rem)] font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[max(0px,calc(--theme(--radius-lg)-5px))] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-[calc(var(--control-px,0.75rem)-0.125rem)] has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-[calc(var(--control-px,0.75rem)-0.125rem)] has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-[var(--control-px,0.75rem)] pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 [.border-b]:border-hairline",
        "block-end":
          "order-last w-full justify-start px-[var(--control-px,0.75rem)] pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 [.border-t]:border-hairline",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-[length:var(--control-text,0.8125rem)] shadow-none",
  {
    variants: {
      size: {
        xs: "h-[calc(var(--control-h,2.125rem)-0.5rem)] gap-1 rounded-[max(0px,calc(--theme(--radius-lg)-3px))] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-[calc(var(--control-h,2.125rem)-0.25rem)]",
        "icon-xs":
          "size-[calc(var(--control-h,2.125rem)-0.5rem)] rounded-[max(0px,calc(--theme(--radius-lg)-3px))] p-0 has-[>svg]:p-0",
        "icon-sm":
          "size-[calc(var(--control-h,2.125rem)-0.25rem)] p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size={size}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-[length:var(--control-text,0.8125rem)] text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none [--focus-width:0px] disabled:opacity-100 aria-invalid:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent shadow-none [--focus-width:0px] disabled:opacity-100 aria-invalid:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
