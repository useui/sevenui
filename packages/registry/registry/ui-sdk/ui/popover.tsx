"use client";

import * as React from "react";
import {
  PopoverContent as PopoverContentPrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  Popover as PopoverPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
} from "@ui-sdk/react/popover";
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

type Side = React.ComponentProps<typeof PopoverContentPrimitive>["side"];
type OpenChange = NonNullable<React.ComponentProps<typeof PopoverPrimitive>["onOpenChange"]>;
// Base UI types `details.event` as always present; UI SDK leaves it undefined
// for controller changes. Callers written against the base flavour read it
// unguarded after checking the reason, so the type follows Base UI.
type OpenChangeDetails = Parameters<OpenChange>[1] & { event: Event };
type Timing = { openOnHover?: boolean; delay?: number; closeDelay?: number };

// Base UI sets hover opening and its delays on the trigger; UI SDK sets them
// on the root. The trigger reports its values up so the root can apply them.
const ReportTiming = React.createContext<((timing: Timing) => void) | null>(null);

// Base UI's root also takes children as a function of the payload of the
// trigger that opened it; UI SDK reports the payload through onPayloadChange.
function Popover({
  children,
  onPayloadChange,
  onOpenChange,
  openOnHover,
  delay,
  closeDelay,
  ...props
}: Omit<React.ComponentProps<typeof PopoverPrimitive>, "children" | "onOpenChange"> & {
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  children?: React.ReactNode | ((state: { payload: unknown }) => React.ReactNode);
}) {
  const [payload, setPayload] = React.useState<unknown>(undefined);
  const [trigger, setTrigger] = React.useState<Timing>({});
  return (
    <ReportTiming.Provider value={setTrigger}>
      <PopoverPrimitive
        openOnHover={trigger.openOnHover ?? openOnHover}
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
      </PopoverPrimitive>
    </ReportTiming.Provider>
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function PopoverTrigger({
  render,
  openOnHover,
  delay,
  closeDelay,
  ...props
}: Omit<React.ComponentProps<typeof PopoverTriggerPrimitive>, "render"> &
  Timing & {
    render?: React.ReactElement<unknown> | RenderProp<{ open: boolean }>;
  }) {
  const report = React.useContext(ReportTiming);
  React.useLayoutEffect(() => {
    if (openOnHover !== undefined || delay !== undefined || closeDelay !== undefined) {
      report?.({ openOnHover, delay, closeDelay });
    }
  }, [report, openOnHover, delay, closeDelay]);
  return (
    <PopoverTriggerPrimitive
      data-slot="popover-trigger"
      render={(triggerProps, state) =>
        renderElement(
          "button",
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

// Base UI's focus props take a boolean, a ref, or a function of the
// interaction that returns an element, `true`/`null` (the default) or
// `false`/nothing (leave focus). UI SDK takes "none" or a getter.
type BaseFocus =
  | boolean
  | React.RefObject<HTMLElement | null>
  | ((interaction: string) => boolean | HTMLElement | null | undefined);

function toFocusTarget(focus: BaseFocus | undefined) {
  if (focus === undefined || focus === true) return undefined;
  if (focus === false) return "none" as const;
  if (typeof focus === "function") {
    return (): HTMLElement | undefined => {
      const target = focus("mouse");
      if (target instanceof HTMLElement) return target;
      if (target === true || target === null) return undefined;
      return document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    };
  }
  return (): HTMLElement | undefined => focus.current ?? undefined;
}

// UI SDK has no Positioner or Portal: the content is positioned itself, in
// the top layer, so the positioning props go straight onto it.
function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  initialFocus,
  finalFocus,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverContentPrimitive>,
  "side" | "className" | "initialFocus" | "finalFocus"
> & {
  className?: string;
  side?: Side | "inline-start" | "inline-end";
  initialFocus?: BaseFocus;
  finalFocus?: BaseFocus;
}) {
  return (
    <PopoverContentPrimitive
      data-slot="popover-content"
      align={align}
      alignOffset={alignOffset}
      side={toSide(side)}
      // Base UI keeps popups 5px from the viewport edges; UI SDK 8px.
      collisionPadding={5}
      sideOffset={sideOffset}
      initialFocus={toFocusTarget(initialFocus)}
      finalFocus={toFocusTarget(finalFocus)}
      className={cn(
        "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-[var(--panel-pad,1.125rem)] text-sm text-popover-foreground shadow-overlay ring-1 ring-foreground/10 outline-hidden",
        // Same motion as the select popup; reduced motion shows it instantly.
        "transition-[scale,opacity] duration-150 ease-snappy data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      container={usePopupContainer()}
      {...props}
    />
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PopoverTitlePrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <PopoverTitlePrimitive
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PopoverDescriptionPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <PopoverDescriptionPrimitive
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
