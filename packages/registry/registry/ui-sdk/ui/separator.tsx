"use client";

import type * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { Separator as SeparatorPrimitive } from "@ui-sdk/react/separator";
import { cn } from "cn";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Base UI let a caller's data-slot replace the default (sidebar,
// button-group and item separators rely on it), so the slot is set there.
function Separator({
  className,
  orientation = "horizontal",
  "data-slot": slot = "separator",
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof SeparatorPrimitive>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
}) {
  return (
    <SeparatorPrimitive
      orientation={orientation}
      render={(separatorProps, state) =>
        renderElement(
          "div",
          { ...separatorProps, "data-slot": slot },
          render as RenderProp<typeof state> | undefined,
          state,
        )
      }
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
