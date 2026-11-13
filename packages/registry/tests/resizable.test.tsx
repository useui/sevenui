import { act, fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";
import type { PanelSize } from "react-resizable-panels";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";
import { byFlavour, isUiSdk } from "./helpers/flavour";
import { must } from "./helpers/must";

// react-resizable-panels v4 measures groups and panels via offsetWidth /
// offsetHeight, which are 0 in jsdom; seed a 400x300 layout so the library
// computes real percentages and enables keyboard resizing.
const originalDescriptors = {
  offsetWidth: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  ),
  offsetHeight: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight",
  ),
};

// When enabled, panel widths derive from the flex-grow percentage the library
// writes into each panel's inline style (grow/100 * 400px group width).
let dynamicPanelWidths = false;

// Panel onResize only fires from ResizeObserver entries, which jsdom never
// emits. Record every observer the library creates so tests can deliver the
// entry the browser would.
type RecordedObserver = {
  callback: ResizeObserverCallback;
  elements: Set<Element>;
};
const observers: RecordedObserver[] = [];

class ManualResizeObserver {
  private record: RecordedObserver;
  constructor(callback: ResizeObserverCallback) {
    this.record = { callback, elements: new Set() };
    observers.push(this.record);
  }
  observe(element: Element) {
    this.record.elements.add(element);
  }
  unobserve(element: Element) {
    this.record.elements.delete(element);
  }
  disconnect() {
    this.record.elements.clear();
  }
}

const originalResizeObserver = window.ResizeObserver;

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      if (dynamicPanelWidths && this.hasAttribute("data-panel")) {
        const grow = Number.parseFloat(this.style.flexGrow || "");
        if (Number.isFinite(grow)) return (grow / 100) * 400;
      }
      return 400;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 300;
    },
  });
  window.ResizeObserver =
    ManualResizeObserver as unknown as typeof ResizeObserver;
});

afterAll(() => {
  for (const [name, descriptor] of Object.entries(originalDescriptors)) {
    if (descriptor) {
      Object.defineProperty(HTMLElement.prototype, name, descriptor);
    }
  }
  window.ResizeObserver = originalResizeObserver;
});

function renderGroup(
  groupProps: Partial<
    React.ComponentProps<typeof ResizablePanelGroup>
  > = {},
  panelProps: Partial<React.ComponentProps<typeof ResizablePanel>> = {},
) {
  const view = render(
    <ResizablePanelGroup id="group" {...groupProps}>
      <ResizablePanel id="first" defaultSize="50%" {...panelProps}>
        One
      </ResizablePanel>
      <ResizableHandle id="handle" withHandle />
      <ResizablePanel id="second" defaultSize="50%">
        Two
      </ResizablePanel>
    </ResizablePanelGroup>,
  );
  const separator = view.container.querySelector(
    "[role=separator]",
  ) as HTMLElement;
  return { ...view, separator };
}

describe("ResizablePanelGroup", () => {
  it("renders the library's data attributes on group, panels and handle", () => {
    // react-resizable-panels marks its parts with data-group, data-panel and
    // data-separator; UI SDK marks every part with data-orientation instead.
    const attribute = byFlavour({
      base: { group: "data-group", panel: "data-panel", handle: "data-separator" },
      "ui-sdk": {
        group: "data-orientation",
        panel: "data-orientation",
        handle: "data-orientation",
      },
    });
    const { container } = renderGroup();
    const group = container.querySelector("[data-slot=resizable-panel-group]");
    expect(group?.hasAttribute(attribute.group)).toBe(true);
    const panels = container.querySelectorAll("[data-slot=resizable-panel]");
    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(panel.hasAttribute(attribute.panel)).toBe(true);
    }
    const handle = container.querySelector("[data-slot=resizable-handle]");
    expect(handle?.hasAttribute(attribute.handle)).toBe(true);
  });

  it("lays out horizontally by default and vertically with orientation='vertical'", () => {
    const first = renderGroup();
    const group = first.container.querySelector(
      "[data-slot=resizable-panel-group]",
    ) as HTMLElement;
    expect(group.style.flexDirection).toBe("row");
    // separator orientation is perpendicular to the group axis
    expect(first.separator.getAttribute("aria-orientation")).toBe("vertical");
    first.unmount();

    const second = renderGroup({ orientation: "vertical" });
    const verticalGroup = second.container.querySelector(
      "[data-slot=resizable-panel-group]",
    ) as HTMLElement;
    expect(verticalGroup.style.flexDirection).toBe("column");
    expect(second.separator.getAttribute("aria-orientation")).toBe(
      "horizontal",
    );
  });
});

describe("ResizableHandle", () => {
  it("renders a focusable separator with aria value state", async () => {
    const { separator } = renderGroup();
    // UI SDK measures the group after mount and only then writes the
    // separator's tabindex and aria values.
    if (isUiSdk) {
      await waitFor(() => expect(separator.hasAttribute("aria-valuenow")).toBe(true));
    }
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("tabindex")).toBe("0");
    expect(separator.getAttribute("aria-controls")).toBe("first");
    expect(separator.getAttribute("aria-valuemin")).toBe("0");
    expect(separator.getAttribute("aria-valuemax")).toBe("100");
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
  });

  it("renders the grip only when withHandle is set", () => {
    const withGrip = renderGroup();
    expect(withGrip.separator.firstElementChild).not.toBeNull();
    withGrip.unmount();

    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="50%">One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="50%">Two</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const bare = container.querySelector("[data-slot=resizable-handle]");
    expect(bare?.firstElementChild).toBeNull();
  });

  it("resizes panels with arrow keys", async () => {
    const { separator } = renderGroup();
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("55"),
    );
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("45"),
    );
  });

  it("jumps to the edges with Home and End", async () => {
    const { separator } = renderGroup();
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    fireEvent.keyDown(separator, { key: "Home" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("0"),
    );
    fireEvent.keyDown(separator, { key: "End" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("100"),
    );
  });

  it("renders a disabled handle as unfocusable and inert", async () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel id="first" defaultSize="50%">
          One
        </ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel id="second" defaultSize="50%">
          Two
        </ResizablePanel>
      </ResizablePanelGroup>,
    );
    const separator = container.querySelector(
      "[role=separator]",
    ) as HTMLElement;
    expect(separator.getAttribute("aria-disabled")).toBe("true");
    if (isUiSdk) {
      await waitFor(() => expect(separator.hasAttribute("aria-valuenow")).toBe(true));
      expect(separator.hasAttribute("data-disabled")).toBe(true);
    } else {
      expect(separator.getAttribute("data-separator")).toBe("disabled");
    }
    // Not focusable, so keyboard resizing is unreachable for real users.
    // (Synthetic keydown on a disabled separator throws inside the library,
    // but that path cannot be hit through the browser.)
    expect(separator.hasAttribute("tabindex")).toBe(false);
    const firstPanel = container.querySelector("#first") as HTMLElement;
    // react-resizable-panels sizes a panel with flex-grow; UI SDK with
    // --resizable-panel-size, a percentage.
    if (isUiSdk) {
      await waitFor(() =>
        expect(firstPanel.style.getPropertyValue("--resizable-panel-size")).toBe("50%"),
      );
    } else {
      await waitFor(() => expect(firstPanel.style.flexGrow).toBe("50"));
    }
  });
});

// Examples style react-resizable-panels' data-group, data-panel and
// data-separator (inactive, hover, focus, active, disabled); the flavour emits
// the same attributes.
describe("Resizable data attributes", () => {
  it("marks the group, panels and separator state", async () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel id="one" defaultSize="50%">One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="two" defaultSize="50%">Two</ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel id="three" defaultSize="50%">Three</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(container.querySelector("[data-slot=resizable-panel-group]")?.getAttribute("data-group")).toBe("true");
    const panels = container.querySelectorAll("[data-slot=resizable-panel]");
    expect([...panels].map((panel) => panel.getAttribute("data-panel"))).toEqual(["true", "true", "true"]);
    const [handle, disabled] = container.querySelectorAll<HTMLElement>("[data-slot=resizable-handle]");
    await waitFor(() => expect(handle.getAttribute("data-separator")).toBe("inactive"));
    expect(disabled.getAttribute("data-separator")).toBe("disabled");
    act(() => handle.focus());
    await waitFor(() => expect(handle.getAttribute("data-separator")).toBe("focus"));
    act(() => handle.blur());
    await waitFor(() => expect(handle.getAttribute("data-separator")).toBe("inactive"));
  });
});

describe("ResizablePanel", () => {
  it("fires onLayoutChanged on mount and after keyboard resize", async () => {
    const onLayoutChanged = vi.fn();
    const { separator } = renderGroup({ onLayoutChanged });
    await waitFor(() =>
      expect(onLayoutChanged).toHaveBeenCalledWith(
        { first: 50, second: 50 },
        { isUserInteraction: false },
      ),
    );
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    await waitFor(() =>
      expect(onLayoutChanged).toHaveBeenCalledWith(
        { first: 55, second: 45 },
        { isUserInteraction: true },
      ),
    );
  });

  it("fires onResize with the new panel size when the element resizes", async () => {
    const onResize = vi.fn();
    const { container, separator } = renderGroup({}, { onResize });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    const panel = container.querySelector("#first") as HTMLElement;
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("55"),
    );
    // jsdom never emits ResizeObserver entries, so deliver the one the
    // browser would after the flex layout change; the library still does its
    // own measuring (via the offsetWidth mock reflecting the flex styles).
    dynamicPanelWidths = true;
    try {
      const entries = [
        {
          target: panel,
          borderBoxSize: [{ inlineSize: 220, blockSize: 300 }],
        },
      ] as unknown as ResizeObserverEntry[];
      for (const record of observers) {
        if (record.elements.has(panel)) {
          record.callback(entries, {} as ResizeObserver);
        }
      }
      expect(onResize).toHaveBeenCalled();
      const [panelSize, id] = (onResize.mock.calls.at(-1) ?? []) as [
        PanelSize,
        string | number | undefined,
      ];
      expect(panelSize.asPercentage).toBe(55);
      expect(panelSize.inPixels).toBeCloseTo(220);
      expect(id).toBe("first");
    } finally {
      dynamicPanelWidths = false;
    }
  });

  it("collapses and expands a collapsible panel with Enter on the handle", async () => {
    const { separator } = renderGroup(
      {},
      { collapsible: true, minSize: "20%" },
    );
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    fireEvent.keyDown(separator, { key: "Enter" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("0"),
    );
    fireEvent.keyDown(separator, { key: "Enter" });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
  });
});

describe("ResizableHandle v2 styling", () => {
  it("draws a border-coloured handle with the ring focus style", () => {
    const { separator } = renderGroup();
    const classes = separator.className.split(" ");
    expect(classes).toContain("bg-border");
    expect(classes).toContain("focus-visible:ring-1");
    expect(classes).toContain("focus-visible:ring-ring");
    expect(classes).toContain("ring-offset-background");
    expect(separator.className).not.toContain("hairline");
    expect(separator.className).not.toContain("focus-ring");
  });

  it("renders the grip in the border colour with the raised shadow", () => {
    const { separator } = renderGroup();
    const grip = must(separator.firstElementChild);
    expect(grip.className).toContain("bg-border");
    expect(grip.className).toContain("shadow-raised");
    expect(grip.className).not.toContain("surface");
    expect(grip.className).not.toContain("hairline");
  });
});

// The base API is react-resizable-panels': layouts are maps of panel id to
// percent and refs expose imperative handles. The UI SDK flavour adapts its
// array layouts and controller to the same surface, so these run in both.
describe("Resizable layout API", () => {
  it("starts from a defaultLayout map keyed by panel id", async () => {
    const { separator } = renderGroup({ defaultLayout: { first: 30, second: 70 } });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("30"),
    );
  });

  it("reports onLayoutChange as a map while keys move the handle", async () => {
    const onLayoutChange = vi.fn();
    const { separator } = renderGroup({ onLayoutChange });
    await waitFor(() =>
      expect(onLayoutChange).toHaveBeenCalledWith({ first: 50, second: 50 }),
    );
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    await waitFor(() =>
      expect(onLayoutChange).toHaveBeenLastCalledWith({ first: 45, second: 55 }),
    );
  });

  it("reads and sets the layout through groupRef", async () => {
    const groupRef = React.createRef<{
      getLayout: () => Record<string, number>;
      setLayout: (layout: Record<string, number>) => Record<string, number>;
    }>();
    const { separator } = renderGroup({ groupRef });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    expect(groupRef.current?.getLayout()).toEqual({ first: 50, second: 50 });
    groupRef.current?.setLayout({ first: 25, second: 75 });
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("25"),
    );
    expect(groupRef.current?.getLayout()).toEqual({ first: 25, second: 75 });
  });

  it("collapses, expands and resizes a panel through panelRef", async () => {
    const panelRef = React.createRef<{
      collapse: () => void;
      expand: () => void;
      isCollapsed: () => boolean;
      resize: (size: number | string) => void;
      getSize: () => { asPercentage: number; inPixels: number };
    }>();
    const { separator } = renderGroup(
      {},
      { panelRef, collapsible: true, minSize: "20%" },
    );
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    expect(panelRef.current?.isCollapsed()).toBe(false);
    act(() => panelRef.current?.collapse());
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("0"),
    );
    expect(panelRef.current?.isCollapsed()).toBe(true);
    act(() => panelRef.current?.expand());
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("50"),
    );
    act(() => panelRef.current?.resize("40%"));
    await waitFor(() =>
      expect(separator.getAttribute("aria-valuenow")).toBe("40"),
    );
    expect(panelRef.current?.getSize().asPercentage).toBe(40);
  });
});
