import { fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";
import type { PanelSize } from "react-resizable-panels";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

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
    const { container } = renderGroup();
    const group = container.querySelector("[data-slot=resizable-panel-group]");
    expect(group?.hasAttribute("data-group")).toBe(true);
    const panels = container.querySelectorAll("[data-slot=resizable-panel]");
    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(panel.hasAttribute("data-panel")).toBe(true);
    }
    const handle = container.querySelector("[data-slot=resizable-handle]");
    expect(handle?.hasAttribute("data-separator")).toBe(true);
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
    expect(separator.getAttribute("data-separator")).toBe("disabled");
    // Not focusable, so keyboard resizing is unreachable for real users.
    // (Synthetic keydown on a disabled separator throws inside the library,
    // but that path cannot be hit through the browser.)
    expect(separator.hasAttribute("tabindex")).toBe(false);
    const firstPanel = container.querySelector("#first") as HTMLElement;
    await waitFor(() => expect(firstPanel.style.flexGrow).toBe("50"));
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
