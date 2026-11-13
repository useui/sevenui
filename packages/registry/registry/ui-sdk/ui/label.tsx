"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "@ui-sdk/react/label";
import { renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

function Label({
  className,
  "data-slot": slot = "label",
  ...props
}: React.ComponentProps<"label"> & { "data-slot"?: string }) {
  return (
    <LabelPrimitive
      // UI SDK ignores a data-slot prop on its part; set through `render`, a
      // caller's slot still wins, as in the base flavour.
      render={(p, state) =>
        renderElement("label", { ...p, "data-slot": slot }, undefined, state)
      }
      className={cn(
        "flex items-center gap-2 text-[length:var(--control-text,0.8125rem)] leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-data-disabled:opacity-60",
        className,
      )}
      {...(props as Omit<React.ComponentProps<typeof LabelPrimitive>, "className">)}
    />
  );
}

export { Label };
