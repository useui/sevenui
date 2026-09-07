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
