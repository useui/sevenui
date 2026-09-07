import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
} from "@/registry/base/ui/message-scroller";

// jsdom has no layout: mock scroll geometry per element and stub
// Element.prototype.scrollTo so programmatic scrolls are observable.
const VIEWPORT_HEIGHT = 150;
const CONTENT_HEIGHT = 600;
const ITEM_HEIGHT = 200;

const scrollToMock = vi.fn(function (
  this: Element,
  options?: ScrollToOptions | number,
) {
  if (typeof options === "object" && typeof options?.top === "number") {
    (this as HTMLElement).scrollTop = options.top;
  }
});

beforeAll(() => {
  window.requestAnimationFrame ??= ((cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(performance.now()), 16)) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame ??= (id: number) => window.clearTimeout(id);
  Object.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    writable: true,
    value: scrollToMock,
  });
});

afterAll(() => {
  delete (Element.prototype as { scrollTo?: unknown }).scrollTo;
});

beforeEach(() => {
  scrollToMock.mockClear();
});

function domRect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockViewportLayout(viewport: HTMLElement) {
  let scrollTop = 0;
  Object.defineProperty(viewport, "scrollHeight", {
    configurable: true,
    get: () => CONTENT_HEIGHT,
  });
  Object.defineProperty(viewport, "clientHeight", {
    configurable: true,
    get: () => VIEWPORT_HEIGHT,
  });
  Object.defineProperty(viewport, "scrollTop", {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = value;
    },
  });
  viewport.getBoundingClientRect = () => domRect(0, VIEWPORT_HEIGHT);
}

// Items live at fixed content coordinates; their client rects shift with scroll.
function mockItemRect(
  item: HTMLElement,
  viewport: HTMLElement,
  top: number,
  bottom: number,
) {
  item.getBoundingClientRect = () =>
    domRect(top - viewport.scrollTop, bottom - viewport.scrollTop);
}

function mockChatLayout(ids: string[]) {
  const viewport = screen.getByTestId("viewport");
  mockViewportLayout(viewport);
  ids.forEach((id, index) => {
    mockItemRect(
      screen.getByTestId(`item-${id}`),
      viewport,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
    );
  });
  return viewport;
}

function Chat({
  ids = ["m1", "m2", "m3"],
  anchors = [],
  autoScroll = false,
  probe = null,
}: {
  ids?: string[];
  anchors?: string[];
  autoScroll?: boolean;
  probe?: React.ReactNode;
}) {
  return (
    <MessageScrollerProvider autoScroll={autoScroll}>
      <MessageScroller data-testid="root">
        <MessageScrollerViewport data-testid="viewport">
          <MessageScrollerContent data-testid="content">
            {ids.map((id) => (
              <MessageScrollerItem
                key={id}
                messageId={id}
                scrollAnchor={anchors.includes(id)}
                data-testid={`item-${id}`}
              >
                {id}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton data-testid="scroll-button" />
      </MessageScroller>
      {probe}
    </MessageScrollerProvider>
  );
}

describe("MessageScroller structure", () => {
  it("renders viewport, log content, and items with expected roles and attributes", () => {
    const { container } = render(<Chat anchors={["m2"]} />);
    const viewport = screen.getByTestId("viewport");
    expect(viewport.getAttribute("role")).toBe("region");
    expect(viewport.getAttribute("aria-label")).toBe("Messages");
    expect(viewport.tabIndex).toBe(0);

    const content = screen.getByTestId("content");
    expect(content.getAttribute("role")).toBe("log");
    expect(content.getAttribute("aria-relevant")).toBe("additions");
    // Bottom spacer used to reserve space for scroll anchoring.
    expect(
      content.querySelector("[data-message-scroller-spacer]"),
    ).not.toBeNull();

    const item = screen.getByTestId("item-m1");
    expect(item.getAttribute("data-message-id")).toBe("m1");
    expect(item.getAttribute("data-scroll-anchor")).toBe("false");
    expect(
      screen.getByTestId("item-m2").getAttribute("data-scroll-anchor"),
    ).toBe("true");

    for (const slot of [
      "message-scroller",
      "message-scroller-viewport",
      "message-scroller-content",
      "message-scroller-item",
      "message-scroller-button",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it("supports a custom aria-label and appended classNames", () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-96" data-testid="root">
          <MessageScrollerViewport
            aria-label="Conversation"
            className="p-3"
            data-testid="viewport"
          >
            <MessageScrollerContent className="gap-2" data-testid="content" />
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>,
    );
    expect(screen.getByTestId("viewport").getAttribute("aria-label")).toBe(
      "Conversation",
    );
    expect(screen.getByTestId("root").className).toContain("h-96");
    expect(screen.getByTestId("root").className).toContain("flex-col");
    expect(screen.getByTestId("viewport").className).toContain("p-3");
    expect(screen.getByTestId("content").className).toContain("gap-2");
  });

  it("renders with no items", () => {
    render(<Chat ids={[]} />);
    expect(screen.getByTestId("content")).not.toBeNull();
  });

  it("throws when used outside a MessageScrollerProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MessageScroller />)).toThrow(
      /must be used within a MessageScroller/,
    );
    spy.mockRestore();
  });
});

describe("MessageScrollerButton", () => {
  it("is inactive and unfocusable when the viewport is not scrollable", () => {
    render(<Chat />);
    const button = screen.getByTestId("scroll-button");
    expect(button.getAttribute("data-active")).toBe("false");
    expect(button.getAttribute("data-direction")).toBe("end");
    expect(button.tabIndex).toBe(-1);
    expect(button.textContent).toContain("Scroll to end");
  });

  it("labels the start direction", () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent />
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" data-testid="up-button" />
        </MessageScroller>
      </MessageScrollerProvider>,
    );
    const button = screen.getByTestId("up-button");
    expect(button.getAttribute("data-direction")).toBe("start");
    expect(button.textContent).toContain("Scroll to start");
  });

  it("activates away from the bottom and smooth-scrolls back to the end on click", async () => {
    const user = userEvent.setup();
    const ids = ["m1", "m2", "m3"];
    render(<Chat ids={ids} />);
    const viewport = mockChatLayout(ids);
    const button = screen.getByTestId("scroll-button");

    // At scrollTop 0 the content overflows below: the end button activates.
    fireEvent.scroll(viewport);
    expect(button.getAttribute("data-active")).toBe("true");
    expect(button.tabIndex).toBe(0);

    await user.click(button);
    expect(scrollToMock).toHaveBeenCalledWith({
      top: CONTENT_HEIGHT - VIEWPORT_HEIGHT,
      behavior: "smooth",
    });

    // Once pinned to the bottom the button deactivates again.
    fireEvent.scroll(viewport);
    expect(button.getAttribute("data-active")).toBe("false");
  });
});

describe("useMessageScrollerScrollable", () => {
  function ScrollableProbe() {
    const scrollable = useMessageScrollerScrollable();
    return (
      <output data-testid="scrollable">
        {`${scrollable.start}:${scrollable.end}`}
      </output>
    );
  }

  it("reports start/end scrollability as the viewport scrolls", () => {
    const ids = ["m1", "m2", "m3"];
    render(<Chat ids={ids} probe={<ScrollableProbe />} />);
    expect(screen.getByTestId("scrollable").textContent).toBe("false:false");

    const viewport = mockChatLayout(ids);
    fireEvent.scroll(viewport);
    expect(screen.getByTestId("scrollable").textContent).toBe("false:true");

    viewport.scrollTop = CONTENT_HEIGHT - VIEWPORT_HEIGHT;
    fireEvent.scroll(viewport);
    expect(screen.getByTestId("scrollable").textContent).toBe("true:false");
  });
});

describe("useMessageScroller", () => {
  function ScrollActions({ onResult }: { onResult: (result: boolean) => void }) {
    const { scrollToEnd, scrollToMessage } = useMessageScroller();
    return (
      <div>
        <button type="button" onClick={() => onResult(scrollToMessage("m2"))}>
          to-m2
        </button>
        <button type="button" onClick={() => onResult(scrollToMessage("nope"))}>
          to-missing
        </button>
        <button type="button" onClick={() => onResult(scrollToEnd())}>
          to-end
        </button>
      </div>
    );
  }

  it("scrolls to a registered message and to the end, and rejects unknown ids", async () => {
    const user = userEvent.setup();
    const results: boolean[] = [];
    const ids = ["m1", "m2", "m3"];
    render(
      <Chat ids={ids} probe={<ScrollActions onResult={(r) => results.push(r)} />} />,
    );
    mockChatLayout(ids);

    await user.click(screen.getByRole("button", { name: "to-m2" }));
    expect(results).toEqual([true]);
    // m2 starts at content offset 200.
    expect(scrollToMock).toHaveBeenCalledWith({ top: 200, behavior: "auto" });

    scrollToMock.mockClear();
    await user.click(screen.getByRole("button", { name: "to-missing" }));
    expect(results).toEqual([true, false]);
    expect(scrollToMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "to-end" }));
    expect(results).toEqual([true, false, true]);
    expect(scrollToMock).toHaveBeenCalledWith({
      top: CONTENT_HEIGHT - VIEWPORT_HEIGHT,
      behavior: "auto",
    });
  });
});

describe("auto-scroll", () => {
  it("sticks to the bottom when a new message is appended", async () => {
    const ids = ["m1", "m2", "m3"];
    const view = render(<Chat ids={ids} autoScroll />);
    mockChatLayout(ids);
    scrollToMock.mockClear();

    await act(async () => {
      view.rerender(<Chat ids={[...ids, "m4"]} autoScroll />);
      await Promise.resolve();
    });

    expect(scrollToMock).toHaveBeenCalledWith({
      top: CONTENT_HEIGHT - VIEWPORT_HEIGHT,
      behavior: "auto",
    });
  });

  it("does not interrupt a user who scrolled up", async () => {
    const ids = ["m1", "m2", "m3"];
    const view = render(<Chat ids={ids} autoScroll />);
    const viewport = mockChatLayout(ids);

    // Reach the bottom, then scroll up: the scroller leaves follow mode.
    viewport.scrollTop = CONTENT_HEIGHT - VIEWPORT_HEIGHT;
    fireEvent.scroll(viewport);
    viewport.scrollTop = 200;
    fireEvent.scroll(viewport);
    scrollToMock.mockClear();

    await act(async () => {
      view.rerender(<Chat ids={[...ids, "m4"]} autoScroll />);
      await Promise.resolve();
    });

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("anchors a new own-message near the top of the viewport", async () => {
    const ids = ["m1", "m2", "m3"];
    const view = render(<Chat ids={ids} autoScroll />);
    const viewport = mockChatLayout(ids);
    scrollToMock.mockClear();

    // rerender flushes synchronously; the content MutationObserver callback is
    // queued as a microtask, so the rect mock below lands before it runs.
    view.rerender(<Chat ids={[...ids, "m4"]} anchors={["m4"]} autoScroll />);
    mockItemRect(screen.getByTestId("item-m4"), viewport, 550, 600);
    await act(async () => {
      await Promise.resolve();
    });

    // Anchor top (550) minus the default previous-item peek (64).
    expect(scrollToMock).toHaveBeenCalledWith({ top: 486, behavior: "auto" });
    // The spacer reserves room below the anchor so it can sit at the top.
    const spacer = screen
      .getByTestId("content")
      .querySelector("[data-message-scroller-spacer]") as HTMLElement;
    expect(spacer.style.height).toBe("36px");
    expect(spacer.hidden).toBe(false);
  });
});
