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

  it("hands onValueChange a numeric tab value as a number", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue={1} onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value={1}>One</TabsTrigger>
          <TabsTrigger value={2}>Two</TabsTrigger>
        </TabsList>
        <TabsContent value={1}>First</TabsContent>
        <TabsContent value={2}>Second</TabsContent>
      </Tabs>,
    );
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe(2);
    expect(screen.getByRole("tabpanel").textContent).toBe("Second");
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
    it("renders the default list as a muted track at control height", () => {
      render(<BasicTabs />);
      const list = screen.getByRole("tablist");
      expect(list.className.split(" ")).toContain("bg-muted");
      expect(list.className).not.toContain("surface");
      expect(list.className).not.toContain("hairline");
      expect(list.className).not.toContain("elevation-inset");
      expect(list.className).toContain("p-0.5");
      expect(list.className).toContain("h-[var(--control-h,2.125rem)]");
    });

    it("sizes triggers inside the list and focuses with the ring", () => {
      render(<BasicTabs />);
      for (const tab of screen.getAllByRole("tab")) {
        expect(tab.className).toContain("h-[calc(var(--control-h,2.125rem)-4px)]");
        expect(tab.className).toContain("focus-visible:border-ring");
        expect(tab.className).toContain("focus-visible:ring-[3px]");
        expect(tab.className).toContain("focus-visible:ring-ring/50");
        expect(tab.className).toContain("focus-visible:outline-ring");
        expect(tab.className).not.toContain("focus-ring");
      }
    });

    it("lifts the active tab onto the background as a plain pill, with no bottom indicator", () => {
      render(<BasicTabs />);
      const tab = screen.getByRole("tab", { name: "Account" });
      expect(tab.className).toContain("data-active:bg-background");
      // The underline belongs to the line variant only: an inset shadow on
      // the default pill draws a bar clipped by its rounded corners.
      expect(tab.className).not.toMatch(/inset_/);
      expect(tab.className).toContain(
        "group-data-[variant=default]/tabs-list:data-active:shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1)]",
      );
      expect(tab.className).not.toContain("group-data-[variant=default]/tabs-list:data-active:after:opacity-100");
      expect(tab.className).toContain("group-data-[variant=line]/tabs-list:data-active:after:opacity-100");
      expect(tab.className).not.toContain("surface");
      expect(tab.className).not.toContain("hairline");
      expect(tab.className).not.toContain("highlight");
    });

    it("draws the line variant without a hairline, with a 2px foreground bar", () => {
      render(
        <Tabs defaultValue="one">
          <TabsList variant="line">
            <TabsTrigger value="one">One</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(screen.getByRole("tablist").className).not.toContain(
        "hairline",
      );
      const tab = screen.getByRole("tab");
      expect(tab.className).toContain("after:bg-foreground");
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

describe("Tabs state attributes", () => {
  it("marks the selected tab with data-active", async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    const account = screen.getByRole("tab", { name: "Account" });
    const billing = screen.getByRole("tab", { name: "Billing" });
    expect(account.hasAttribute("data-active")).toBe(true);
    expect(billing.hasAttribute("data-active")).toBe(false);
    await user.click(billing);
    expect(billing.hasAttribute("data-active")).toBe(true);
    expect(account.hasAttribute("data-active")).toBe(false);
  });

  it("lets a caller's data-slot replace the default", () => {
    render(
      <Tabs defaultValue="one" data-slot="panel-tabs">
        <TabsList>
          <TabsTrigger value="one" data-slot="panel-tab">
            One
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tab").getAttribute("data-slot")).toBe(
      "panel-tab",
    );
  });
});
