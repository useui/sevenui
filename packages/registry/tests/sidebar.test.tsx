import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// jsdom does not implement window.matchMedia, which useIsMobile (used by
// SidebarProvider) relies on. Mock it per-file with a switchable result.
let mediaMatches = false;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: mediaMatches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/registry/base/ui/sidebar";

function App(props: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider {...props}>
      <Sidebar>
        <SidebarContent>Sidebar body</SidebarContent>
      </Sidebar>
      <SidebarTrigger />
    </SidebarProvider>
  );
}

function getSidebar(container: HTMLElement) {
  return container.querySelector('[data-slot="sidebar"]');
}

afterEach(() => {
  mediaMatches = false;
  document.cookie = "sidebar_state=; path=/; max-age=0";
});

describe("SidebarProvider + Sidebar (desktop)", () => {
  it("renders expanded by default", () => {
    const { container } = render(<App />);
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("expanded");
    expect(screen.getByText("Sidebar body")).toBeTruthy();
  });

  it("starts collapsed when defaultOpen is false", () => {
    const { container } = render(<App defaultOpen={false} />);
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("collapsed");
  });

  it("toggles between expanded and collapsed via SidebarTrigger", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const trigger = screen.getByRole("button", { name: "Toggle Sidebar" });
    await user.click(trigger);
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("collapsed");
    await user.click(trigger);
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("expanded");
  });

  it("persists the open state in a cookie when toggled", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(document.cookie).toContain("sidebar_state=false");
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(document.cookie).toContain("sidebar_state=true");
  });

  it("toggles with the cmd/ctrl+b keyboard shortcut", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await user.keyboard("{Meta>}b{/Meta}");
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("collapsed");
    await user.keyboard("{Control>}b{/Control}");
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("expanded");
  });

  it("supports controlled open with onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(<App open onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: stays expanded until the owner flips the prop.
    expect(getSidebar(container)?.getAttribute("data-state")).toBe("expanded");
  });

  it("renders a plain container for collapsible='none' without state attributes", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>Static body</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    const sidebar = getSidebar(container);
    expect(sidebar).not.toBeNull();
    expect(sidebar?.getAttribute("data-state")).toBeNull();
  });
});

describe("useSidebar", () => {
  it("throws when used outside a SidebarProvider", () => {
    function Naked() {
      useSidebar();
      return null;
    }
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Naked />)).toThrow(
      "useSidebar must be used within a SidebarProvider.",
    );
    errorSpy.mockRestore();
  });
});

describe("Sidebar (mobile)", () => {
  it("renders inside a sheet dialog that opens via the trigger", async () => {
    mediaMatches = true;
    const user = userEvent.setup();
    const { container } = render(<App />);
    // Closed sheet: no sidebar content mounted.
    expect(screen.queryByText("Sidebar body")).toBeNull();
    expect(getSidebar(container)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-mobile")).toBe("true");
    expect(screen.getByText("Sidebar body")).toBeTruthy();
  });
});

describe("Sidebar v2 style", () => {
  function Styled({ variant }: { variant?: "sidebar" | "floating" | "inset" }) {
    return (
      <SidebarProvider>
        <Sidebar variant={variant}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Inbox</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Drafts</SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#a" isActive>
                        Archived
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
  }

  it("puts the container on the tray surface with a hairline edge", () => {
    const { container } = render(<Styled />);
    const inner = container.querySelector('[data-slot="sidebar-inner"]');
    const outer = container.querySelector('[data-slot="sidebar-container"]');
    expect(inner?.className).toContain("bg-surface-tray");
    expect(outer?.className).toContain("group-data-[side=left]:border-hairline");
  });

  it("sizes menu buttons to the item height and focuses with the offset ring", () => {
    render(<Styled />);
    const button = screen.getByRole("button", { name: "Drafts" });
    expect(button.className).toContain("min-h-[var(--item-h,2rem)]");
    expect(button.className).toContain("rounded-md");
    expect(button.className).toContain("focus-visible:focus-ring");
    expect(button.className).not.toContain("ring-2");
    expect(button.className).not.toContain("ring-sidebar-ring");
    expect(button.className).toContain("motion-reduce:transition-none");
  });

  it("raises the active item on a neutral surface without accent", () => {
    render(<Styled />);
    const active = screen.getByRole("button", { name: "Inbox" });
    expect(active.getAttribute("data-active")).not.toBeNull();
    expect(active.className).toContain("data-active:bg-surface-raised");
    expect(active.className).toContain("var(--hairline-strong");
    expect(active.className).toContain("var(--elevation-highlight");
    expect(active.className).not.toMatch(/\bbrand\b|bg-brand|text-brand/);
    const sub = screen.getByRole("link", { name: "Archived" });
    expect(sub.className).toContain("data-active:bg-surface-raised");
    expect(sub.className).toContain("focus-visible:focus-ring");
  });

  it("sets group labels in 11px uppercase mono", () => {
    render(<Styled />);
    const label = screen.getByText("Platform");
    expect(label.className).toContain("font-mono");
    expect(label.className).toContain("text-[11px]");
    expect(label.className).toContain("uppercase");
  });

  it("keeps the collapse width transition with a reduced-motion counterpart", () => {
    const { container } = render(<Styled />);
    const gap = container.querySelector('[data-slot="sidebar-gap"]');
    const outer = container.querySelector('[data-slot="sidebar-container"]');
    for (const el of [gap, outer]) {
      expect(el?.className).toContain("duration-200");
      expect(el?.className).toContain("motion-reduce:transition-none");
    }
  });

  it("renders the floating variant as a panel with a hairline", () => {
    const { container } = render(<Styled variant="floating" />);
    const inner = container.querySelector('[data-slot="sidebar-inner"]');
    expect(inner?.className).toContain(
      "group-data-[variant=floating]:bg-surface-panel",
    );
  });
});
