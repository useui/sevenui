import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

function BasicTabs(props: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="account" {...props}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account panel</TabsContent>
      <TabsContent value="password">Password panel</TabsContent>
      <TabsContent value="billing">Billing panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("wires up tablist, tab, and tabpanel roles", () => {
    render(<BasicTabs />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    // Inactive panels are unmounted by default, so only one tabpanel exists.
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
  });

  it("links the selected tab and its panel via aria-controls/aria-labelledby", () => {
    render(<BasicTabs />);
    const tab = screen.getByRole("tab", { name: "Account" });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.id);
  });

  it("selects the tab matching defaultValue", () => {
    render(<BasicTabs defaultValue="password" />);
    expect(
      screen
        .getByRole("tab", { name: "Password" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("Password panel")).toBeTruthy();
    expect(screen.queryByText("Account panel")).toBeNull();
  });

  it("switches panels on click", async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    await user.click(screen.getByRole("tab", { name: "Billing" }));
    expect(
      screen.getByRole("tab", { name: "Billing" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("Billing panel")).toBeTruthy();
    expect(screen.queryByText("Account panel")).toBeNull();
  });

  it("moves focus with arrow keys and activates with Enter", async () => {
    // Base UI 1.7 defaults activateOnFocus to false: arrows only move focus,
    // Enter/Space activates the focused tab.
    const user = userEvent.setup();
    render(<BasicTabs />);
    await user.click(screen.getByRole("tab", { name: "Account" }));
    await user.keyboard("{ArrowRight}");
    const passwordTab = screen.getByRole("tab", { name: "Password" });
    expect(document.activeElement).toBe(passwordTab);
    expect(passwordTab.getAttribute("aria-selected")).toBe("false");
    await user.keyboard("{Enter}");
    expect(passwordTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Password panel")).toBeTruthy();
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "Account" }),
    );
  });

  it("supports controlled value with onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicTabs value="account" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Password" }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe("password");
    // Controlled: selection must not move without a value update from outside.
    expect(
      screen.getByRole("tab", { name: "Account" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("Account panel")).toBeTruthy();
  });

  it("does not activate a disabled tab", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two" disabled>
            Two
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel one</TabsContent>
        <TabsContent value="two">Panel two</TabsContent>
      </Tabs>,
    );
    const disabledTab = screen.getByRole("tab", { name: "Two" });
    expect(disabledTab.getAttribute("aria-disabled")).toBe("true");
    await user.click(disabledTab);
    expect(
      screen.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.queryByText("Panel two")).toBeNull();
  });

  it("renders orientation and list variant data attributes", () => {
    render(
      <Tabs defaultValue="one" orientation="vertical" data-testid="tabs-root">
        <TabsList variant="line" data-testid="tabs-list">
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel one</TabsContent>
      </Tabs>,
    );
    expect(
      screen.getByTestId("tabs-root").getAttribute("data-orientation"),
    ).toBe("vertical");
    expect(screen.getByTestId("tabs-list").getAttribute("data-variant")).toBe(
      "line",
    );
  });

  describe("v2 style", () => {
    it("renders the default list as a segmented tray at control height", () => {
      render(<BasicTabs />);
      const list = screen.getByRole("tablist");
      expect(list.className).toContain("bg-surface-tray");
      expect(list.className).toContain("inset_0_0_0_1px_var(--hairline");
      expect(list.className).toContain("p-0.5");
      expect(list.className).toContain("h-[var(--control-h,2.125rem)]");
    });

    it("sizes triggers inside the tray and focuses with the offset ring", () => {
      render(<BasicTabs />);
      for (const tab of screen.getAllByRole("tab")) {
        expect(tab.className).toContain("h-[calc(var(--control-h,2.125rem)-4px)]");
        expect(tab.className).toContain("focus-visible:focus-ring");
        expect(tab.className).not.toContain("ring-3");
        expect(tab.className).not.toContain("ring-ring");
        expect(tab.className).not.toContain("focus-visible:border-ring");
      }
    });

    it("raises the active tab with a brand bottom indicator", () => {
      render(<BasicTabs />);
      const tab = screen.getByRole("tab", { name: "Account" });
      expect(tab.className).toContain("data-active:bg-surface-raised");
      expect(tab.className).toContain("inset_0_-2px_0_var(--brand");
    });

    it("draws the line variant on a hairline with a 2px brand bar", () => {
      render(
        <Tabs defaultValue="one">
          <TabsList variant="line">
            <TabsTrigger value="one">One</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(screen.getByRole("tablist").className).toContain(
        "var(--hairline",
      );
      const tab = screen.getByRole("tab");
      expect(tab.className).toContain("after:bg-brand");
      expect(tab.className).toContain("after:h-0.5");
    });

    it("pairs every transition with a motion-reduce counterpart", () => {
      render(<BasicTabs />);
      const tab = screen.getByRole("tab", { name: "Account" });
      expect(tab.className).toContain("motion-reduce:transition-none");
      expect(tab.className).toContain("motion-reduce:after:transition-none");
    });
  });
});
