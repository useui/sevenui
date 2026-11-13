"use client";

import * as React from "react";
import {
  HoverCardContent as HoverCardContentPrimitive,
  HoverCard as HoverCardPrimitive,
  HoverCardTrigger as HoverCardTriggerPrimitive,
} from "@ui-sdk/react/hover-card";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

// Base UI portals popups to <body>; UI SDK renders them in place, as children
// of whatever holds the trigger, where that parent's child rules (Field's
// `*:w-full`, ButtonGroup's corners) and inherited styles reach them. So they
// render into <body>, or into a DirectionProvider's host to keep its `dir`
// (direction.tsx); in place on the server and while hydrating.
type PopupHost = { host: HTMLElement | null } | null;
const popupHostKey = Symbol.for("sevenui.ui-sdk.popup-host");
const popupHosts = globalThis as { [key: symbol]: React.Context<PopupHost> | undefined };
popupHosts[popupHostKey] ??= React.createContext<PopupHost>(null);
const PopupHostContext = popupHosts[popupHostKey] as React.Context<PopupHost>;
const subscribeToNothing = () => () => {};
function usePopupContainer(): HTMLElement | null {
  const scope = React.useContext(PopupHostContext);
  const body = React.useSyncExternalStore(subscribeToNothing, () => document.body, () => null);
  return body && (scope ? scope.host : body);
}

type Side = React.ComponentProps<typeof HoverCardContentPrimitive>["side"];
type OpenChange = NonNullable<React.ComponentProps<typeof HoverCardPrimitive>["onOpenChange"]>;
// Base UI types `details.event` as always present; UI SDK leaves it undefined
// for controller changes. Callers written against the base flavour read it
// unguarded after checking the reason, so the type follows Base UI.
type OpenChangeDetails = Parameters<OpenChange>[1] & { event: Event };
type Timing = { delay?: number; closeDelay?: number };

// Base UI sets the delays on the trigger; UI SDK sets them on the root. The
// trigger reports its values up so the root can apply them.
const ReportTiming = React.createContext<((timing: Timing) => void) | null>(null);

// Base UI's root also takes children as a function of the payload of the
// trigger that opened it (one card for many links); UI SDK reports the
// payload through onPayloadChange.
function HoverCard({
  children,
  onPayloadChange,
  onOpenChange,
  delay,
  closeDelay,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardPrimitive>, "children" | "onOpenChange"> & {
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: React.ReactNode | ((state: { payload: unknown }) => React.ReactNode);
}) {
  const [payload, setPayload] = React.useState<unknown>(undefined);
  const [trigger, setTrigger] = React.useState<Timing>({});
  return (
    <ReportTiming.Provider value={setTrigger}>
      <HoverCardPrimitive
        delay={trigger.delay ?? delay}
        closeDelay={trigger.closeDelay ?? closeDelay}
        onOpenChange={onOpenChange as OpenChange | undefined}
        onPayloadChange={(next, details) => {
          setPayload(next);
          onPayloadChange?.(next, details);
        }}
        {...props}
      >
        {typeof children === "function" ? children({ payload }) : children}
      </HoverCardPrimitive>
    </ReportTiming.Provider>
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function HoverCardTrigger({
  render,
  delay,
  closeDelay,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardTriggerPrimitive>, "render"> &
  Timing & {
    render?: React.ReactElement<unknown> | RenderProp<{ open: boolean }>;
  }) {
  const report = React.useContext(ReportTiming);
  React.useLayoutEffect(() => {
    if (delay !== undefined || closeDelay !== undefined) {
      report?.({ delay, closeDelay });
    }
  }, [report, delay, closeDelay]);
  return (
    <HoverCardTriggerPrimitive
      data-slot="hover-card-trigger"
      render={(triggerProps, state) =>
        renderElement(
          "a",
          { ...triggerProps, "data-popup-open": state.open ? "" : undefined },
          render as RenderProp<{ open: boolean }> | undefined,
          state,
        )
      }
      {...props}
    />
  );
}

// Base UI's logical sides map onto UI SDK's start/end.
function toSide(side: Side | "inline-start" | "inline-end" | undefined): Side {
  if (side === "inline-start") return "start";
  if (side === "inline-end") return "end";
  return side;
}

// UI SDK has no Positioner or Portal: the content is positioned itself, in
// the top layer, so the positioning props go straight onto it.
function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardContentPrimitive>, "side" | "className"> & {
  className?: string;
  side?: Side | "inline-start" | "inline-end";
}) {
  return (
    <HoverCardContentPrimitive
      data-slot="hover-card-content"
      align={align}
      alignOffset={alignOffset}
      side={toSide(side)}
      // Base UI keeps popups 5px from the viewport edges; UI SDK 8px.
      collisionPadding={5}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 origin-(--transform-origin) rounded-lg bg-popover p-[var(--panel-pad,1.125rem)] text-sm text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-hidden",
        // Same motion as the select popup; reduced motion shows it instantly.
        "transition-[scale,opacity] duration-150 ease-snappy data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      container={usePopupContainer()}
      {...props}
    />
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
