import type * as React from "react";
import { mergeProps, type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Separator } from "@/registry/ui-sdk/ui/separator";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex w-full flex-col gap-4", className)}
      {...props}
    />
  );
}

// UI SDK ignores a data-slot prop on a part; one on the rendered element wins.
function ItemSeparator({
  className,
  render,
  "data-slot": slot = "item-separator",
  ...props
}: React.ComponentProps<typeof Separator> & { "data-slot"?: string }) {
  return (
    <Separator
      orientation="horizontal"
      className={cn("my-2", className)}
      render={(partProps, state) =>
        renderElement("div", { ...partProps, "data-slot": slot }, render, state)
      }
      {...props}
    />
  );
}

// Rows never drop below --item-h. Its fallback sits inside var(): a :where()
// default on the row would shadow an ancestor's data-density value.
const itemVariants = cva(
  "group/item flex min-h-[var(--item-h,2rem)] w-full flex-wrap items-center rounded-lg border text-sm transition-[color,background-color,border-color] duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none [a]:transition-[color,background-color,border-color] [a]:hover:bg-muted [a]:motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      // Padding and gap scale from the density variables, so compact rows
      // tighten (the --item-h floor sits below a row's content and rarely
      // binds). Comfortable values match the previous fixed spacing:
      // default/sm 10px 12px with a 10px gap, xs 8px 10px with an 8px gap.
      size: {
        default:
          "gap-[calc(var(--control-gap,0.5rem)*1.25)] px-[var(--control-px,0.75rem)] py-[calc(var(--control-gap,0.5rem)*1.25)]",
        sm: "gap-[calc(var(--control-gap,0.5rem)*1.25)] px-[var(--control-px,0.75rem)] py-[calc(var(--control-gap,0.5rem)*1.25)]",
        xs: "gap-[var(--control-gap,0.5rem)] px-[calc(var(--control-px,0.75rem)*5/6)] py-[var(--control-gap,0.5rem)] in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ItemState = {
  slot: "item";
  variant: VariantProps<typeof itemVariants>["variant"];
  size: VariantProps<typeof itemVariants>["size"];
};

// Base UI's useRender turns state into data attributes; renderElement does not,
// so data-slot, data-variant and data-size are set explicitly.
// ReactElement<unknown> keeps Base UI's render type.
function Item({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & {
    render?: RenderProp<ItemState> | React.ReactElement<unknown>;
  }) {
  return renderElement(
    "div",
    mergeProps(
      {
        "data-slot": "item",
        "data-variant": variant ?? undefined,
        "data-size": size ?? undefined,
        className: cn(itemVariants({ variant, size, className })),
      },
      props,
    ),
    render as RenderProp<ItemState> | undefined,
    { slot: "item", variant, size } satisfies ItemState,
  );
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-md group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className,
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className,
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
