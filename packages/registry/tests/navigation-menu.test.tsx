import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";

function BasicMenu(props: React.ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/analytics">Analytics</NavigationMenuLink>
            <NavigationMenuLink href="/reports">Reports</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("renders a navigation landmark with a list and trigger", () => {
    render(<BasicMenu />);
    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(screen.getByRole("list")).toBeTruthy();
    const trigger = screen.getByRole("button", { name: "Products" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders plain link items as anchors", () => {
    render(<BasicMenu />);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
  });

  it("opens the shared popup with the item content on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    expect(screen.queryByText("Analytics")).toBeNull();
    const trigger = screen.getByRole("button", { name: "Products" });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const analytics = screen.getByRole("link", { name: "Analytics" });
    expect(analytics.getAttribute("href")).toBe("/analytics");
    expect(screen.getByRole("link", { name: "Reports" })).toBeTruthy();
  });

  it("points aria-controls at the shared popup containing the content", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: "Products" });
    await user.click(trigger);
    const popupId = trigger.getAttribute("aria-controls");
    expect(popupId).toBeTruthy();
    const popup = document.getElementById(popupId as string);
    expect(popup).not.toBeNull();
    expect(popup?.textContent).toContain("Analytics");
  });

  it("closes again when the trigger is clicked twice", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: "Products" });
    await user.click(trigger);
    expect(screen.getByText("Analytics")).toBeTruthy();
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("reports the active item through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicMenu onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Products" }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe("products");
  });
});

describe("NavigationMenu v2 styles", () => {
  const cls = (el: Element | null | undefined) => el?.getAttribute("class") ?? "";

  it("styles triggers as ghost controls sized from --control-h with main's focus ring", () => {
    render(<BasicMenu />);
    const trigger = cls(screen.getByRole("button", { name: "Products" }));
    expect(trigger).toContain("h-[var(--control-h,2.125rem)]");
    expect(trigger).toContain("px-[var(--control-px,0.75rem)]");
    expect(trigger).toContain("hover:bg-muted");
    expect(trigger).toContain("data-popup-open:bg-muted/50");
    expect(trigger).not.toContain("surface-panel");
    expect(trigger).not.toContain("hairline");
    expect(trigger).toContain("focus-visible:ring-3 focus-visible:ring-ring/50");
    expect(trigger).not.toContain("focus-ring");
    expect(trigger).toContain("motion-reduce:transition-none");
  });

  it("styles links with the md radius, a muted hover and active state and main's focus ring", () => {
    render(<BasicMenu />);
    const link = cls(screen.getByRole("link", { name: "Docs" }));
    expect(link).toContain("rounded-md");
    expect(link).toContain("hover:bg-muted");
    expect(link).toContain("data-active:bg-muted/50");
    expect(link).not.toContain("surface-panel");
    expect(link).not.toContain("hairline");
    expect(link).toContain("focus-visible:ring-3 focus-visible:ring-ring/50");
    expect(link).not.toContain("focus-ring");
  });

  it("renders the viewport popup on the popover with a ring edge, the overlay shadow and a reduced-motion fallback", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Products" }));
    const viewport = screen.getByRole("link", { name: "Analytics" }).closest(
      '[data-slot="navigation-menu-content"]',
    )?.parentElement;
    const surface = viewport?.parentElement;
    expect(cls(surface)).toContain("bg-popover");
    expect(cls(surface)).toContain("ring-1 ring-foreground/10");
    expect(cls(surface)).toContain("shadow-overlay");
    expect(cls(surface)).toContain("motion-reduce:transition-none");
  });
});
