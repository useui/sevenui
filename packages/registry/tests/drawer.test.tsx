import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { isUiSdk } from "./helpers/flavour";

function ExampleDrawer(props: React.ComponentProps<typeof Drawer>) {
  return (
    <Drawer {...props}>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Dismiss</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function getPopup() {
  return document.querySelector('[data-slot="drawer-popup"]');
}

describe("Drawer", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleDrawer />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByText("Open drawer"));
    const drawer = await screen.findByRole("dialog");
    expect(drawer.getAttribute("data-slot")).toBe("drawer-popup");
  });

  it("wires the title and description via aria attributes", async () => {
    const user = userEvent.setup();
    render(<ExampleDrawer />);
    await user.click(screen.getByText("Open drawer"));
    const drawer = await screen.findByRole("dialog");
    const title = screen.getByText("Move goal");
    const description = screen.getByText("Set your daily activity goal.");
    expect(drawer.getAttribute("aria-labelledby")).toBe(title.id);
    expect(drawer.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("swipes down by default with a modal overlay", async () => {
    render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    const popup = getPopup();
    expect(popup?.getAttribute("data-swipe-axis")).toBe("y");
    expect(popup?.getAttribute("data-swipe-direction")).toBe("down");
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeTruthy();
  });

  it.each([
    ["down", "y"],
    ["up", "y"],
    ["left", "x"],
    ["right", "x"],
  ] as const)(
    "applies swipe data attributes for swipeDirection=%s",
    async (direction, axis) => {
      render(<ExampleDrawer open swipeDirection={direction} />);
      await screen.findByRole("dialog");
      const popup = getPopup();
      expect(popup?.getAttribute("data-swipe-direction")).toBe(direction);
      expect(popup?.getAttribute("data-swipe-axis")).toBe(axis);
    },
  );

  it("omits the overlay when modal is false", async () => {
    render(<ExampleDrawer open modal={false} />);
    await screen.findByRole("dialog");
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeNull();
    // UI SDK renders its own viewport, which takes no props; the flavour
    // marks the popup instead.
    const viewport = document.querySelector(
      isUiSdk ? '[data-slot="drawer-popup"]' : '[data-slot="drawer-viewport"]',
    );
    expect(viewport?.getAttribute("data-modal")).toBe("false");
  });

  it("renders a swipe handle only when showSwipeHandle is set", async () => {
    const { unmount } = render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    expect(
      document.querySelector('[data-slot="drawer-swipe-handle"]'),
    ).toBeNull();
    unmount();
    render(<ExampleDrawer open showSwipeHandle />);
    await screen.findByRole("dialog");
    expect(
      document.querySelector('[data-slot="drawer-swipe-handle"]'),
    ).toBeTruthy();
  });

  it("closes on Escape and reports it through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleDrawer onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Open drawer"));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("closes via a DrawerClose element", async () => {
    const user = userEvent.setup();
    render(<ExampleDrawer />);
    await user.click(screen.getByText("Open drawer"));
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Dismiss"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    rerender(<ExampleDrawer open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("throws when DrawerContent is used outside a Drawer", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DrawerContent />)).toThrow(
      "useDrawer must be used within a Drawer.",
    );
    spy.mockRestore();
  });
});

describe("Drawer v2 styles", () => {
  it("renders a popover panel with a border edge and an overlay shadow", async () => {
    render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    const popup = getPopup();
    const classes = popup?.className.split(" ") ?? [];
    for (const cls of [
      "bg-popover",
      "text-popover-foreground",
      "border",
      "border-popover",
      "dark:border-border",
      "shadow-overlay",
    ]) {
      expect(classes).toContain(cls);
    }
    expect(popup?.className).toContain(
      "after:bg-(--drawer-bleed-background,var(--color-popover))",
    );
    expect(popup?.className).not.toContain("surface-");
    expect(popup?.className).not.toContain("hairline");
    expect(popup?.className).not.toContain("ring-3");
  });

  // drawer-12 caps the sheet with a --drawer-height it sets itself.
  it("sizes the content from a caller's --drawer-height", async () => {
    const user = userEvent.setup();
    render(<ExampleDrawer />);
    await user.click(screen.getByText("Open drawer"));
    await screen.findByRole("dialog");
    expect(getPopup()?.className).toContain("[--drawer-content-height:var(--drawer-height,auto)]");
  });

  it("colours the swipe handle with the muted token", async () => {
    render(<ExampleDrawer open showSwipeHandle />);
    await screen.findByRole("dialog");
    const handle = document.querySelector('[data-slot="drawer-swipe-handle"]');
    expect(handle?.className).toContain("after:bg-muted");
    expect(handle?.className).not.toContain("hairline");
  });

  it("pads the header and footer with the panel padding", async () => {
    render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    for (const slot of ["drawer-header", "drawer-footer"]) {
      const el = document.querySelector(`[data-slot="${slot}"]`);
      expect(el?.className).toContain("p-[var(--panel-pad,1.125rem)]");
    }
  });

  it("slides in with a reduced-motion fade", async () => {
    render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    const popup = getPopup();
    expect(popup?.className).toContain("duration-200");
    expect(popup?.className).toContain("ease-snappy");
    expect(popup?.className).toContain("motion-reduce:data-ending-style:opacity-0!");
  });

  it("dims and blurs the backdrop as main does", async () => {
    render(<ExampleDrawer open />);
    await screen.findByRole("dialog");
    const overlay = document.querySelector('[data-slot="drawer-overlay"]');
    expect(overlay?.className).toContain("bg-black/30");
    expect(overlay?.className).toContain("supports-backdrop-filter:backdrop-blur-sm");
  });
});
