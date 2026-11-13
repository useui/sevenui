"use client";

import * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import {
  ScrollAreaCorner,
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaScrollbar,
  type ScrollAreaState,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area";
import { cn } from "cn";

type Orientation = "vertical" | "horizontal";

// UI SDK allows one scrollbar per axis; Base UI rendered every one. A
// ScrollBar a caller adds (the shadcn pattern) replaces the root's own.
const ScrollBarRegistry = React.createContext<{
  internal: boolean;
  register: (orientation: Orientation) => () => void;
} | null>(null);

const flag = (on: boolean) => (on ? "" : undefined);

// Base UI marks the root with data-has-overflow-* and data-overflow-*-start
// and -end, which examples use for edge fades. UI SDK's state names the
// edges for the vertical axis, or for the horizontal one when only it
// overflows, so the x edges stay unset while both axes overflow.
function overflowAttributes(state: ScrollAreaState) {
  const xOnly = state.overflowX && !state.overflowY;
  return {
    "data-has-overflow-x": flag(state.overflowX),
    "data-has-overflow-y": flag(state.overflowY),
    "data-overflow-y-start": flag(state.overflowY && !state.atStart),
    "data-overflow-y-end": flag(state.overflowY && !state.atEnd),
    "data-overflow-x-start": flag(xOnly && !state.atStart),
    "data-overflow-x-end": flag(xOnly && !state.atEnd),
  };
}

// Base UI shows a scrollbar whenever its axis overflows, which is UI SDK's
// type="auto". `overflowEdgeThreshold` has no UI SDK counterpart; it is
// accepted for API parity and dropped.
function ScrollArea({
  className,
  children,
  orientation = "vertical",
  type = "auto",
  overflowEdgeThreshold: _overflowEdgeThreshold,
  render,
  "data-slot": slot = "scroll-area",
  ...props
}: Omit<
  React.ComponentProps<typeof ScrollAreaPrimitive>,
  "className" | "children" | "render"
> & {
  className?: string;
  children?: React.ReactNode;
  "data-slot"?: string;
  render?: React.ReactElement<unknown> | RenderProp<never>;
  orientation?: "vertical" | "horizontal" | "both";
  overflowEdgeThreshold?:
    | number
    | Partial<{ xStart: number; xEnd: number; yStart: number; yEnd: number }>;
}) {
  const [added, setAdded] = React.useState<Orientation[]>([]);
  const register = React.useCallback((axis: Orientation) => {
    setAdded((current) => [...current, axis]);
    return () =>
      setAdded((current) => {
        const index = current.indexOf(axis);
        return current.filter((_, i) => i !== index);
      });
  }, []);
  const external = React.useMemo(
    () => ({ internal: false, register }),
    [register],
  );
  const internal = React.useMemo(
    () => ({ internal: true, register }),
    [register],
  );
  return (
    <ScrollAreaPrimitive
      type={type}
      render={(rootProps, state) =>
        renderElement(
          "div",
          { ...rootProps, "data-slot": slot, ...overflowAttributes(state) },
          render as RenderProp<ScrollAreaState> | undefined,
          state,
        )
      }
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaViewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        <ScrollBarRegistry.Provider value={external}>
          {children}
        </ScrollBarRegistry.Provider>
      </ScrollAreaViewport>
      <ScrollBarRegistry.Provider value={internal}>
        {orientation !== "horizontal" && !added.includes("vertical") && (
          <ScrollBar />
        )}
        {orientation !== "vertical" && !added.includes("horizontal") && (
          <ScrollBar orientation="horizontal" />
        )}
      </ScrollBarRegistry.Provider>
      <ScrollAreaCorner />
    </ScrollAreaPrimitive>
  );
}

// Base UI unmounts a scrollbar while its axis does not overflow, unless
// `keepMounted` is set. UI SDK keeps it mounted and marks a showing one with
// data-visible, so a scrollbar that should not show is `hidden`.
function ScrollBar({
  className,
  orientation = "vertical",
  keepMounted = false,
  render,
  "data-slot": slot = "scroll-area-scrollbar",
  ...props
}: Omit<
  React.ComponentProps<typeof ScrollAreaScrollbar>,
  "className" | "render"
> & {
  className?: string;
  "data-slot"?: string;
  keepMounted?: boolean;
  render?: React.ReactElement<unknown> | RenderProp<never>;
}) {
  const registry = React.useContext(ScrollBarRegistry);
  React.useLayoutEffect(() => {
    if (!registry || registry.internal) return;
    return registry.register(orientation);
  }, [registry, orientation]);
  return (
    <ScrollAreaScrollbar
      data-orientation={orientation}
      orientation={orientation}
      render={(scrollbarProps, state) =>
        renderElement(
          "div",
          {
            ...scrollbarProps,
            "data-slot": slot,
            hidden: !keepMounted && !state.visible ? true : undefined,
          },
          render as RenderProp<typeof state> | undefined,
          state,
        )
      }
      className={cn(
        "flex touch-none bg-transparent p-px select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground/40 motion-reduce:transition-none"
      />
    </ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
