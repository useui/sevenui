"use client";

import type * as React from "react";
import {
  CollapsiblePanel as CollapsiblePanelPrimitive,
  Collapsible as CollapsiblePrimitive,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@ui-sdk/react/collapsible";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins, so SevenUI's slot names are set there. A caller's own data-slot
// replaces the default, as it does in Base UI.
function part<State extends object>(
  slot: string,
  tag: string,
  render: BaseRender | undefined,
  extra?: (state: State) => Record<string, unknown>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(
      tag,
      { ...props, "data-slot": slot, ...extra?.(state) },
      render as RenderProp<State> | undefined,
      state,
    );
}

function Collapsible({
  open,
  defaultOpen,
  "data-slot": slot = "collapsible",
  render,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePrimitive>, "render"> & {
  "data-slot"?: string;
  render?: BaseRender;
}) {
  return (
    <CollapsiblePrimitive
      render={part(slot, "div", render)}
      // Base UI lets `open` win over `defaultOpen`; UI SDK rejects both.
      {...(open !== undefined ? { open } : { defaultOpen })}
      {...props}
    />
  );
}

// Base UI marks an open panel's trigger with data-panel-open, which
// examples style, beside UI SDK's data-open.
function CollapsibleTrigger({
  render,
  nativeButton: _nativeButton,
  "data-slot": slot = "collapsible-trigger",
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleTriggerPrimitive>, "render"> & {
  "data-slot"?: string;
  render?: BaseRender;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
}) {
  return (
    <CollapsibleTriggerPrimitive
      render={part<{ open: boolean }>(slot, "button", render, (state) => ({
        "data-panel-open": state.open ? "" : undefined,
      }))}
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  render,
  "data-slot": slot = "collapsible-content",
  ...props
}: Omit<
  React.ComponentProps<typeof CollapsiblePanelPrimitive>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  render?: BaseRender;
}) {
  return (
    <CollapsiblePanelPrimitive
      render={part(slot, "div", render)}
      className={cn(
        "overflow-hidden data-open:animate-collapsible-down data-closed:animate-collapsible-up motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
