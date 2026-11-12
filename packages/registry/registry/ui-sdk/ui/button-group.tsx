import type * as React from "react";
import { mergeProps, type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Separator } from "@/registry/ui-sdk/ui/separator";

const buttonGroupVariants = cva(
  "flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "*:data-slot:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0",
        vertical:
          "flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

type ButtonGroupTextState = { slot: "button-group-text" };

// Base UI's useRender turns state into data attributes; renderElement does not,
// so data-slot is set explicitly. ReactElement<unknown> keeps Base UI's render type.
function ButtonGroupText({
  className,
  render,
  ...props
}: React.ComponentProps<"div"> & {
  render?: RenderProp<ButtonGroupTextState> | React.ReactElement<unknown>;
}) {
  return renderElement(
    "div",
    mergeProps(
      {
        "data-slot": "button-group-text",
        className: cn(
          "flex items-center gap-[var(--control-gap,0.5rem)] rounded-lg border bg-muted px-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className,
        ),
      },
      props,
    ),
    render as RenderProp<ButtonGroupTextState> | undefined,
    { slot: "button-group-text" } satisfies ButtonGroupTextState,
  );
}

// UI SDK ignores a data-slot prop on a part; one on the rendered element wins.
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  render,
  "data-slot": slot = "button-group-separator",
  ...props
}: React.ComponentProps<typeof Separator> & { "data-slot"?: string }) {
  return (
    <Separator
      orientation={orientation}
      render={(partProps, state) =>
        renderElement("div", { ...partProps, "data-slot": slot }, render, state)
      }
      className={cn(
        "relative self-stretch bg-input data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
