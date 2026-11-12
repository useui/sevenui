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

function Tooltip({
  delay,
  closeDelay,
  closeOnPress,
  trackCursorAxis: _trackCursorAxis,
  disableHoverablePopup: _disableHoverablePopup,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive> & {
  trackCursorAxis?: "none" | "x" | "y" | "both";
  disableHoverablePopup?: boolean;
}) {
  const provider = React.useContext(ProviderTiming);
  const [trigger, setTrigger] = React.useState<Timing>({});
  return (
    <ReportTiming.Provider value={setTrigger}>
      <TooltipPrimitive
        delay={trigger.delay ?? delay ?? provider.delay}
        closeDelay={trigger.closeDelay ?? closeDelay ?? provider.closeDelay}
        closeOnPress={trigger.closeOnClick ?? closeOnPress}
        {...props}
      />
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
function popupOpen(render: TriggerProps["render"]): RenderProp<TriggerState> {
  return (props, state) =>
    renderElement(
      "button",
      { ...props, "data-popup-open": state.open ? "" : undefined },
      render as RenderProp<TriggerState> | undefined,
      state,
    );
}

function TooltipTrigger({
  delay,
  closeDelay,
  closeOnClick,
  render,
  ...props
}: TriggerProps & Timing) {
  const report = React.useContext(ReportTiming);
  React.useLayoutEffect(() => {
    report?.({ delay, closeDelay, closeOnClick });
  }, [report, delay, closeDelay, closeOnClick]);
  return <TooltipTriggerPrimitive render={popupOpen(render)} {...props} />;
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
  return (
    <TooltipContentPrimitive
      side={toSide(side)}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={cn(
        // Inverted bubble, fixed size; a 100ms fade, instant under reduced motion.
        "z-50 w-fit max-w-xs origin-[var(--transform-origin)] rounded-md bg-primary px-2 py-1 text-xs text-balance text-primary-foreground transition-opacity duration-100 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:opacity-0 motion-reduce:transition-none",
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
