"use client";

import * as React from "react";
import {
  TooltipArrow,
  TooltipContent as TooltipContentPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";

import { cn } from "cn";

type Timing = { delay?: number; closeDelay?: number; closeOnClick?: boolean };
type Side = React.ComponentProps<typeof TooltipContentPrimitive>["side"];

// UI SDK groups tooltips without a provider, so TooltipProvider only hands
// its delays down as defaults. Base UI's `timeout` (the grouping window) has
// no UI SDK counterpart and is accepted for API parity.
const ProviderTiming = React.createContext<Timing>({});

function TooltipProvider({
  delay,
  closeDelay,
  timeout: _timeout,
  children,
}: {
  delay?: number;
  closeDelay?: number;
  timeout?: number;
  children?: React.ReactNode;
}) {
  const timing = React.useMemo(() => ({ delay, closeDelay }), [delay, closeDelay]);
  return <ProviderTiming.Provider value={timing}>{children}</ProviderTiming.Provider>;
}

// Base UI sets delays and closeOnClick on the trigger; UI SDK sets them on the
// root. The trigger reports its values up so the root can apply them.
const ReportTiming = React.createContext<((timing: Timing) => void) | null>(null);

// Base UI's trackCursorAxis and disableHoverablePopup, which UI SDK lacks. The
// trigger records the pointer, and the content anchors to a box at the
// pointer on the tracked axis and at the trigger on the other.
type Tracking = {
  axis: "none" | "x" | "y" | "both";
  hoverable: boolean;
  trigger: React.RefObject<HTMLElement | null>;
  pointer: React.RefObject<{ x: number; y: number } | null>;
};
const TrackingContext = React.createContext<Tracking | null>(null);

// Whether the root is disabled, for the trigger's description below.
const DisabledContext = React.createContext(false);

function Tooltip({
  delay,
  closeDelay,
  closeOnPress,
  trackCursorAxis = "none",
  disableHoverablePopup = false,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive> & {
  trackCursorAxis?: "none" | "x" | "y" | "both";
  disableHoverablePopup?: boolean;
}) {
  const provider = React.useContext(ProviderTiming);
  const [trigger, setTrigger] = React.useState<Timing>({});
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const pointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const tracking = React.useMemo<Tracking>(
    () => ({
      axis: trackCursorAxis,
      hoverable: !disableHoverablePopup,
      trigger: triggerRef,
      pointer: pointerRef,
    }),
    [trackCursorAxis, disableHoverablePopup],
  );
  return (
    <ReportTiming.Provider value={setTrigger}>
      <TrackingContext.Provider value={tracking}>
        <DisabledContext.Provider value={props.disabled === true}>
          <TooltipPrimitive
            delay={trigger.delay ?? delay ?? provider.delay}
            closeDelay={trigger.closeDelay ?? closeDelay ?? provider.closeDelay}
            closeOnPress={trigger.closeOnClick ?? closeOnPress}
            {...props}
          />
        </DisabledContext.Provider>
      </TrackingContext.Provider>
    </ReportTiming.Provider>
  );
}

type TriggerState = { open: boolean };
// Also accepts a Base UI-typed render element (its props are `unknown`), so
// callers written against the base flavour compile unchanged.
type TriggerProps = Omit<React.ComponentProps<typeof TooltipTriggerPrimitive>, "render"> & {
  render?: React.ReactElement<unknown> | RenderProp<TriggerState>;
};

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it; UI SDK gives a tooltip trigger no state attribute, so add it.
// UI SDK also points aria-describedby at the content from the start (hidden
// content still describes), replacing the caller's own; Base UI describes
// nothing. So the trigger keeps the caller's description, and adds the
// tooltip's only while it is open and not disabled: a closed or disabled
// tooltip (an expanded sidebar's "Home" on a "Home" button) is not read out.
function popupOpen(
  render: TriggerProps["render"],
  own: string | undefined,
  disabled: boolean,
): RenderProp<TriggerState> {
  return (props, state) => {
    const tip = props["aria-describedby"] as string | undefined;
    const described =
      state.open && !disabled && tip && tip !== own ? [own, tip].filter(Boolean).join(" ") : own;
    return renderElement(
      "button",
      {
        ...props,
        "aria-describedby": described,
        "data-popup-open": state.open ? "" : undefined,
      },
      render as RenderProp<TriggerState> | undefined,
      state,
    );
  };
}

function TooltipTrigger({
  delay,
  closeDelay,
  closeOnClick,
  render,
  ...props
}: TriggerProps & Timing) {
  const report = React.useContext(ReportTiming);
  const tracking = React.useContext(TrackingContext);
  const disabled = React.useContext(DisabledContext);
  React.useLayoutEffect(() => {
    report?.({ delay, closeDelay, closeOnClick });
  }, [report, delay, closeDelay, closeOnClick]);
  const track =
    tracking && tracking.axis !== "none"
      ? (event: React.PointerEvent<HTMLElement>) => {
          tracking.trigger.current = event.currentTarget;
          tracking.pointer.current = { x: event.clientX, y: event.clientY };
        }
      : undefined;
  return (
    <TooltipTriggerPrimitive
      render={popupOpen(render, props["aria-describedby"], disabled)}
      {...props}
      onPointerEnter={(event: React.PointerEvent<HTMLElement>) => {
        track?.(event);
        props.onPointerEnter?.(event as never);
      }}
      onPointerMove={(event: React.PointerEvent<HTMLElement>) => {
        track?.(event);
        props.onPointerMove?.(event as never);
      }}
    />
  );
}

// Base UI's logical sides map onto UI SDK's start/end.
function toSide(side: Side | "inline-start" | "inline-end" | undefined): Side {
  if (side === "inline-start") return "start";
  if (side === "inline-end") return "end";
  return side;
}

function TooltipContent({
  className,
  side,
  align,
  sideOffset = 8,
  alignOffset,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipContentPrimitive>, "side" | "children"> & {
  side?: Side | "inline-start" | "inline-end";
  children?: React.ReactNode;
}) {
  const tracking = React.useContext(TrackingContext);
  const axis = tracking?.axis ?? "none";
  const anchor = React.useMemo(() => {
    if (!tracking || axis === "none") return undefined;
    return {
      getBoundingClientRect: () => {
        const box = tracking.trigger.current?.getBoundingClientRect() ?? new DOMRect();
        const pointer = tracking.pointer.current;
        if (!pointer) return box;
        const x = axis === "x" || axis === "both" ? pointer.x : null;
        const y = axis === "y" || axis === "both" ? pointer.y : null;
        return new DOMRect(x ?? box.x, y ?? box.y, x === null ? box.width : 0, y === null ? box.height : 0);
      },
    };
  }, [tracking, axis]);
  return (
    <TooltipContentPrimitive
      side={toSide(side)}
      anchor={props.anchor ?? anchor}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={cn(
        // Inverted bubble, fixed size; a 100ms fade, instant under reduced motion.
        "z-50 w-fit max-w-xs origin-[var(--transform-origin)] rounded-md bg-primary px-2 py-1 text-xs text-balance text-primary-foreground transition-opacity duration-100 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:opacity-0 motion-reduce:transition-none",
        // Not hoverable: the pointer passes through, so leaving the trigger
        // closes the tooltip even when it moves over the popup.
        tracking?.hoverable === false && "pointer-events-none",
        className,
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="z-50 size-2.5 rotate-45 rounded-[2px] bg-primary data-[side=bottom]:-top-[5px] data-[side=left]:-right-[5px] data-[side=right]:-left-[5px] data-[side=top]:-bottom-[5px]" />
    </TooltipContentPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
