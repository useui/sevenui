"use client";

import * as React from "react";
import {
  DrawerBackdrop as DrawerBackdropPrimitive,
  DrawerClose as DrawerClosePrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  Drawer as DrawerPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerTrigger as DrawerTriggerPrimitive,
} from "@ui-sdk/react/drawer";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type SwipeDirection = "up" | "down" | "left" | "right";
type DrawerProps = React.ComponentProps<typeof DrawerPrimitive>;
type SnapPoint = NonNullable<DrawerProps["snapPoint"]>;
type SnapPointChange = NonNullable<DrawerProps["onSnapPointChange"]>;
type BaseRender = React.ReactElement<unknown> | RenderProp<never>;
type ContentState = { nestedOpen: boolean; dragging: boolean };

type DrawerContextProps = {
  hasSnapPoints: boolean;
  modal: React.ComponentProps<typeof DrawerPrimitive>["modal"];
  showSwipeHandle: boolean;
  swipeDirection: SwipeDirection;
};

const DrawerContext = React.createContext<DrawerContextProps | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);

  if (!context) {
    throw new Error("useDrawer must be used within a Drawer.");
  }

  return context;
}

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. Used where SevenUI's slot name differs from UI SDK's.
function withSlot<State>(
  slot: string,
  tag: string,
  render?: BaseRender,
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

// Base UI names the edge by the direction a swipe closes it; UI SDK by side.
const sides = { down: "bottom", up: "top", left: "left", right: "right" } as const;

// `disablePointerDismissal` is Base UI's `closeOnOutsidePress={false}`. Base UI
// also closes a non-modal drawer on an outside press, which UI SDK only does
// when asked, so it is always asked.
function Drawer({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  swipeDirection = "down",
  disablePointerDismissal = false,
  ...props
}: Omit<
  DrawerProps,
  "side" | "snapPoints" | "snapPoint" | "defaultSnapPoint" | "onSnapPointChange"
> & {
  // Base UI types snap points as `number | string`; UI SDK narrows the
  // strings to px, rem, % and "content", which is what Base UI accepts.
  snapPoints?: (number | string)[];
  snapPoint?: number | string | null;
  defaultSnapPoint?: number | string | null;
  onSnapPointChange?: (
    snapPoint: number | string | null,
    details: Parameters<SnapPointChange>[1],
  ) => void;
  showSwipeHandle?: boolean;
  swipeDirection?: SwipeDirection;
  disablePointerDismissal?: boolean;
}) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = React.useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive
        modal={modal}
        snapPoints={snapPoints as SnapPoint[] | undefined}
        snapPoint={snapPoint as SnapPoint | null | undefined}
        defaultSnapPoint={(defaultSnapPoint ?? undefined) as SnapPoint | undefined}
        onSnapPointChange={onSnapPointChange}
        side={sides[swipeDirection]}
        closeOnOutsidePress={!disablePointerDismissal}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

// Base UI marks an open popup's trigger with data-popup-open and examples
// style it, so the trigger carries it beside UI SDK's data-open.
function DrawerTrigger({
  render,
  ...props
}: Omit<React.ComponentProps<typeof DrawerTriggerPrimitive>, "render"> & {
  render?: BaseRender;
}) {
  return (
    <DrawerTriggerPrimitive
      render={withSlot<{ open: boolean }>("drawer-trigger", "button", render, (state) => ({
        "data-popup-open": state.open ? "" : undefined,
      }))}
      {...props}
    />
  );
}

// UI SDK renders popups in place in the top layer, so there is nothing to
// portal; the part stays so composed markup keeps working.
function DrawerPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

function DrawerClose({
  render,
  ...props
}: Omit<React.ComponentProps<typeof DrawerClosePrimitive>, "render"> & {
  render?: BaseRender;
}) {
  return (
    <DrawerClosePrimitive render={withSlot("drawer-close", "button", render)} {...props} />
  );
}

// UI SDK drives the backdrop's opacity as the drawer moves, so Base UI's
// opacity classes are left out. Its popover reset is keyed to its own slot
// (drawer-backdrop), so size-auto undoes the popover's fit-content size.
function DrawerOverlay({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof DrawerBackdropPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <DrawerBackdropPrimitive
      render={withSlot("drawer-overlay", "div", render)}
      className={cn(
        "fixed inset-0 z-50 size-auto min-h-dvh bg-black/30 supports-backdrop-filter:backdrop-blur-sm select-none supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      {...props}
    />
  );
}

function DrawerSwipeHandle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={cn(
        "relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=down]/drawer-popup:items-end group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start after:block after:shrink-0 after:rounded-full after:bg-muted group-data-[swipe-axis=x]/drawer-popup:after:h-[100px] group-data-[swipe-axis=x]/drawer-popup:after:w-1.5 group-data-[swipe-axis=y]/drawer-popup:after:h-1.5 group-data-[swipe-axis=y]/drawer-popup:after:w-[100px] active:cursor-grabbing",
        className,
      )}
      {...props}
    />
  );
}

// UI SDK places the sheet in its own full-screen viewport and slides it with
// `translate`, so Base UI's fixed positioning and its transform machinery
// (swipe movement, snap offset, closed transform, stack height) are left out.
// The rest of the look is the base flavour's, keyed to the same data
// attributes: data-swipe-direction/-axis and data-snap-points are set here,
// and UI SDK's nestedOpen/dragging state is mirrored as Base UI's
// data-nested-drawer-open/data-swiping.
function DrawerContent({
  className,
  children,
  render,
  initialFocus,
  finalFocus,
  ...props
}: Omit<
  React.ComponentProps<typeof DrawerContentPrimitive>,
  "children" | "className" | "render" | "initialFocus" | "finalFocus"
> & {
  children?: React.ReactNode;
  className?: string;
  render?: BaseRender;
  initialFocus?: BaseFocus;
  finalFocus?: BaseFocus;
}) {
  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer();
  // Base UI's drawer focuses the popup itself on open, by any input; UI SDK
  // focuses the first tabbable control, which then shows its focus style.
  const popup = React.useRef<HTMLElement | null>(null);
  const swipeAxis =
    swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";

  return (
    <>
      {modal === true && (
        <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />
      )}
      <DrawerContentPrimitive
        data-swipe-axis={swipeAxis}
        data-swipe-direction={swipeDirection}
        data-snap-points={hasSnapPoints ? "" : undefined}
        data-modal={String(modal)}
        render={withSlot<ContentState>("drawer-popup", "div", render, (state) => ({
          "data-nested-drawer-open": state.nestedOpen ? "" : undefined,
          "data-swiping": state.dragging ? "" : undefined,
        }))}
        ref={(node: HTMLDivElement | null) => {
          popup.current = node;
        }}
        initialFocus={
          initialFocus === undefined
            ? (): HTMLElement | undefined => popup.current ?? undefined
            : toFocusTarget(initialFocus)
        }
        finalFocus={toFocusTarget(finalFocus)}
        className={cn(
          // Base.
          "group/drawer-popup pointer-events-auto z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) flex-col rounded-[min(var(--radius-4xl),24px)] border border-popover bg-popover text-sm text-popover-foreground shadow-overlay transition-[height,opacity,filter,scale] duration-200 ease-snappy outline-none select-none [--drawer-bleed-background:transparent] [--drawer-inset:--spacing(2)] [--drawer-stacked-shadow:0_-20px_25px_-5px_rgb(0_0_0/0.1),0_-8px_10px_-6px_rgb(0_0_0/0.1)] [interpolate-size:allow-keywords] data-[swipe-direction=down]:data-nested-drawer-open:shadow-(--drawer-stacked-shadow) dark:border-border",
          // Nested: UI SDK counts the drawers open above this one in
          // --drawer-stack; each pushes it back by the base step of 0.05.
          "[scale:calc(1-var(--drawer-stack,0)*0.05)] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
          // Bleed.
          "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
          // Sizing. UI SDK sets no --drawer-height; a caller's caps the height (drawer-12).
          "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem] [--bleed:3rem]",
          // Axis: x.
          "data-[swipe-axis=x]:flex-row",
          // Direction.
          "data-[swipe-direction=down]:origin-bottom data-[swipe-direction=up]:origin-top data-[swipe-direction=left]:origin-left data-[swipe-direction=right]:origin-right",
          // Reduced motion: UI SDK fades instead of sliding.
          "motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0!",
          className,
        )}
        {...props}
      >
        {showSwipeHandle && <DrawerSwipeHandle />}
        <div
          data-slot="drawer-content"
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none",
          )}
        >
          {children}
        </div>
      </DrawerContentPrimitive>
    </>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 flex-col gap-0.5 p-[var(--panel-pad,1.125rem)] pb-0 group-data-[swipe-axis=y]/drawer-popup:text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "mt-auto flex shrink-0 flex-col gap-2 p-[var(--panel-pad,1.125rem)] pt-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof DrawerTitlePrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <DrawerTitlePrimitive
      data-slot="drawer-title"
      className={cn(
        "cn-font-heading text-base font-semibold tracking-[-0.01em] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: Omit<React.ComponentProps<typeof DrawerDescriptionPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <DrawerDescriptionPrimitive
      data-slot="drawer-description"
      className={cn("text-sm text-balance text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
