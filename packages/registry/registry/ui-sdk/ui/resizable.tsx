"use client";

import * as React from "react";
import {
  createResizableController,
  Resizable as ResizablePrimitive,
  ResizableHandle as ResizableHandlePrimitive,
  ResizablePanel as ResizablePanelPrimitive,
  type ResizableController,
  type ResizableLayoutChangeReason,
  type ResizableSize,
} from "@ui-sdk/react/resizable";
import { renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

// The base flavour's API is react-resizable-panels': a layout is a map of
// panel id to percent, and a bare number size means pixels. UI SDK keeps the
// layout as an array in panel order and reads a bare number as percent, so
// the wrappers below translate both ways.
type Layout = { [panelId: string]: number };
type LayoutChangedMeta = { isUserInteraction: boolean };
type PanelSize = { asPercentage: number; inPixels: number };

type ResizablePanelGroupHandle = {
  getLayout: () => Layout;
  setLayout: (layout: Layout) => Layout;
};

type ResizablePanelHandle = {
  collapse: () => void;
  expand: () => void;
  getSize: () => PanelSize;
  isCollapsed: () => boolean;
  resize: (size: number | string) => void;
};

// "50" is percent and 50 is pixels in the base flavour; em, vh and vw have no
// UI SDK unit and are dropped.
function toSize(size: number | string | undefined): ResizableSize | undefined {
  if (size === undefined) return undefined;
  if (typeof size === "number") return `${size}px`;
  const match = /^(-?\d*\.?\d+)(%|px|rem)?$/.exec(size.trim());
  if (!match) return undefined;
  return (match[2] ? size.trim() : `${match[1]}%`) as ResizableSize;
}

const USER_REASONS: ResizableLayoutChangeReason[] = ["drag", "step-key", "collapse"];

type GroupContextValue = {
  controller: ResizableController;
  orientation: "horizontal" | "vertical";
  defaultLayout?: Layout;
  panelIndex: (element: Element) => number;
};

const GroupContext = React.createContext<GroupContextValue | null>(null);

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T>).current = value;
}

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  defaultLayout,
  onLayoutChange,
  onLayoutChanged,
  groupRef,
  elementRef,
  id,
  disabled,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "id"> & {
  orientation?: "horizontal" | "vertical";
  defaultLayout?: Layout;
  onLayoutChange?: (layout: Layout) => void;
  onLayoutChanged?: (layout: Layout, meta: LayoutChangedMeta) => void;
  groupRef?: React.Ref<ResizablePanelGroupHandle | null>;
  elementRef?: React.Ref<HTMLDivElement | null>;
  id?: string | number;
  disabled?: boolean;
}) {
  const [controller] = React.useState(createResizableController);
  const element = React.useRef<HTMLDivElement | null>(null);
  const callbacks = useLatest({ onLayoutChange, onLayoutChanged });
  const emitted = React.useRef({ change: "", changed: "" });

  // Panels may sit inside wrappers, so they are found in the DOM, skipping
  // the panels of a nested group.
  const panels = React.useCallback(() => {
    const root = element.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>("[data-slot=resizable-panel]"),
    ).filter(
      (panel) =>
        panel.parentElement?.closest("[data-slot=resizable-panel-group]") ===
        root,
    );
  }, []);

  const toLayout = React.useCallback(
    (sizes: number[]) => {
      const layout: Layout = {};
      panels().forEach((panel, index) => {
        if (index < sizes.length) layout[panel.id] = sizes[index];
      });
      return layout;
    },
    [panels],
  );

  const emitChange = React.useCallback(
    (sizes: number[]) => {
      const layout = toLayout(sizes);
      const key = JSON.stringify(layout);
      if (key === emitted.current.change) return;
      emitted.current.change = key;
      callbacks.current.onLayoutChange?.(layout);
    },
    [callbacks, toLayout],
  );

  const emitChanged = React.useCallback(
    (sizes: number[], isUserInteraction: boolean) => {
      const layout = toLayout(sizes);
      const key = JSON.stringify(layout);
      if (key === emitted.current.changed) return;
      emitted.current.changed = key;
      callbacks.current.onLayoutChanged?.(layout, { isUserInteraction });
    },
    [callbacks, toLayout],
  );

  // The base flavour reports the first layout once it is known. UI SDK sets
  // it up after mount and reports nothing, so wait for it.
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const report = () => {
      const sizes = controller.getLayout();
      if (sizes.length === 0) {
        timer = setTimeout(report, 16);
        return;
      }
      emitChange(sizes);
      emitChanged(sizes, false);
    };
    report();
    return () => clearTimeout(timer);
  }, [controller, emitChange, emitChanged]);

  React.useImperativeHandle(
    groupRef,
    () => ({
      getLayout: () => toLayout(controller.getLayout()),
      setLayout: (layout) => {
        const current = controller.getLayout();
        controller.setLayout(
          panels().map((panel, index) => layout[panel.id] ?? current[index]),
        );
        return toLayout(controller.getLayout());
      },
    }),
    [controller, panels, toLayout],
  );

  const context = React.useMemo<GroupContextValue>(
    () => ({
      controller,
      orientation,
      defaultLayout,
      panelIndex: (panel) => panels().indexOf(panel as HTMLElement),
    }),
    [controller, orientation, defaultLayout, panels],
  );

  return (
    <GroupContext.Provider value={context}>
      <ResizablePrimitive
        {...(props as React.ComponentProps<typeof ResizablePrimitive>)}
        id={id === undefined ? undefined : String(id)}
        ref={(node: HTMLDivElement | null) => {
          element.current = node;
          assignRef(elementRef, node);
        }}
        controller={controller}
        orientation={orientation}
        disabled={disabled}
        // react-resizable-panels moves a handle 5% per arrow key.
        step={5}
        onLayoutChange={(sizes, details) => {
          emitChange(sizes);
          // Keys, collapses and calls finish at once; a drag finishes on
          // pointer up, in onLayoutCommit.
          if (details.reason !== "drag") {
            emitChanged(sizes, USER_REASONS.includes(details.reason));
          }
        }}
        onLayoutCommit={(sizes, details) =>
          emitChanged(sizes, USER_REASONS.includes(details.reason))
        }
        // UI SDK names the group `resizable`; SevenUI keeps its own slot.
        render={(partProps, state) =>
          renderElement(
            "div",
            // react-resizable-panels marks the group data-group="true".
            { ...partProps, "data-slot": "resizable-panel-group", "data-group": "true" },
            undefined,
            state,
          )
        }
        className={cn("flex h-full w-full", className)}
      />
    </GroupContext.Provider>
  );
}

function ResizablePanel({
  id,
  defaultSize,
  minSize,
  maxSize,
  collapsible,
  collapsedSize,
  onResize,
  panelRef,
  elementRef,
  style,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "id" | "onResize"> & {
  id?: string | number;
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  collapsible?: boolean;
  collapsedSize?: number | string;
  onResize?: (
    panelSize: PanelSize,
    id: string | number | undefined,
    prevPanelSize: PanelSize | undefined,
  ) => void;
  panelRef?: React.Ref<ResizablePanelHandle | null>;
  elementRef?: React.Ref<HTMLDivElement | null>;
}) {
  const group = React.useContext(GroupContext);
  const element = React.useRef<HTMLDivElement | null>(null);
  const handler = useLatest(onResize);
  const fromLayout =
    id === undefined ? undefined : group?.defaultLayout?.[String(id)];

  const target = React.useCallback(
    () => (id === undefined ? (element.current?.id ?? "") : String(id)),
    [id],
  );
  const percent = React.useCallback(() => {
    if (!group || !element.current) return 0;
    return group.controller.getLayout()[group.panelIndex(element.current)] ?? 0;
  }, [group]);
  const pixels = React.useCallback(() => {
    const rect = element.current?.getBoundingClientRect();
    if (!rect) return 0;
    return group?.orientation === "vertical" ? rect.height : rect.width;
  }, [group]);

  React.useImperativeHandle(
    panelRef,
    () => ({
      collapse: () => void group?.controller.collapse(target()),
      expand: () => void group?.controller.expand(target()),
      getSize: () => ({ asPercentage: percent(), inPixels: pixels() }),
      isCollapsed: () => group?.controller.isCollapsed(target()) ?? false,
      resize: (size) => {
        const next = toSize(size);
        if (next !== undefined) group?.controller.resize(target(), next);
      },
    }),
    [group, percent, pixels, target],
  );

  // react-resizable-panels reports a panel's size from a ResizeObserver on
  // the panel; the same happens here, with the percent from the group.
  const observing = onResize !== undefined;
  React.useEffect(() => {
    const node = element.current;
    if (!observing || !node || typeof ResizeObserver === "undefined") return;
    let previous: PanelSize | undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries.find((item) => item.target === node);
      if (!entry) return;
      const box = entry.borderBoxSize?.[0];
      const vertical = group?.orientation === "vertical";
      const inPixels = box
        ? vertical
          ? box.blockSize
          : box.inlineSize
        : vertical
          ? entry.contentRect.height
          : entry.contentRect.width;
      const size = { asPercentage: percent(), inPixels };
      handler.current?.(size, id, previous);
      previous = size;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [observing, group, percent, handler, id]);

  return (
    <ResizablePanelPrimitive
      {...(props as React.ComponentProps<typeof ResizablePanelPrimitive>)}
      ref={(node: HTMLDivElement | null) => {
        element.current = node;
        assignRef(elementRef, node);
      }}
      data-slot="resizable-panel"
      // react-resizable-panels marks every panel data-panel="true";
      // examples select panels by it.
      data-panel="true"
      // react-resizable-panels scrolls a panel's content that overflows.
      style={{ overflow: "auto", ...style }}
      id={id === undefined ? undefined : String(id)}
      defaultSize={fromLayout === undefined ? toSize(defaultSize) : `${fromLayout}%`}
      minSize={toSize(minSize)}
      maxSize={toSize(maxSize)}
      collapsible={collapsible}
      collapsedSize={toSize(collapsedSize)}
    />
  );
}

function ResizableHandle({
  withHandle,
  className,
  elementRef,
  id,
  children: _children,
  onFocus,
  onBlur,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "id"> & {
  withHandle?: boolean;
  disabled?: boolean;
  id?: string | number;
  elementRef?: React.Ref<HTMLDivElement | null>;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <ResizableHandlePrimitive
      {...(props as React.ComponentProps<typeof ResizableHandlePrimitive>)}
      ref={elementRef as React.Ref<HTMLDivElement>}
      id={id === undefined ? undefined : String(id)}
      data-slot="resizable-handle"
      onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        onBlur?.(event);
      }}
      // react-resizable-panels' separator state, which examples style:
      // disabled, then active (dragging), focus, hover, inactive.
      render={(partProps, state) =>
        renderElement(
          "div",
          {
            ...partProps,
            "data-slot": "resizable-handle",
            "data-separator": state.disabled
              ? "disabled"
              : state.dragging
                ? "active"
                : focused
                  ? "focus"
                  : state.hovering
                    ? "hover"
                    : "inactive",
          },
          undefined,
          state,
        )
      }
      className={cn(
        "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1.5 shrink-0 rounded-full bg-border shadow-raised" />
      )}
    </ResizableHandlePrimitive>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
export type {
  Layout,
  LayoutChangedMeta,
  PanelSize,
  ResizablePanelGroupHandle,
  ResizablePanelHandle,
};
