import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

function ExampleSheet({
  side,
  ...props
}: React.ComponentProps<typeof Sheet> & {
  side?: React.ComponentProps<typeof SheetContent>["side"];
}) {
  return (
    <Sheet {...props}>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Edit settings</SheetTitle>
          <SheetDescription>Adjust your preferences.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Dismiss</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByText("Open sheet"));
    const sheet = await screen.findByRole("dialog");
    expect(sheet.getAttribute("data-slot")).toBe("sheet-content");
  });

  it("wires the title and description via aria attributes", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet />);
    await user.click(screen.getByText("Open sheet"));
    const sheet = await screen.findByRole("dialog");
    const title = screen.getByText("Edit settings");
    const description = screen.getByText("Adjust your preferences.");
    expect(sheet.getAttribute("aria-labelledby")).toBe(title.id);
    expect(sheet.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("renders a backdrop overlay while open", async () => {
    render(<ExampleSheet open />);
    await screen.findByRole("dialog");
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeTruthy();
  });

  it("defaults to the right side", async () => {
    render(<ExampleSheet open />);
    const sheet = await screen.findByRole("dialog");
    expect(sheet.getAttribute("data-side")).toBe("right");
  });

  it.each(["top", "right", "bottom", "left"] as const)(
    "applies the data-side attribute for side=%s",
    async (side) => {
      render(<ExampleSheet open side={side} />);
      const sheet = await screen.findByRole("dialog");
      expect(sheet.getAttribute("data-side")).toBe(side);
    },
  );

  it("closes on Escape and reports it through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleSheet onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Open sheet"));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet />);
    await user.click(screen.getByText("Open sheet"));
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Close"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes via a custom SheetClose element", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet />);
    await user.click(screen.getByText("Open sheet"));
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Dismiss"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("hides the built-in close button when showCloseButton is false", async () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>Plain</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    await screen.findByRole("dialog");
    expect(screen.queryByText("Close")).toBeNull();
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleSheet open />);
    await screen.findByRole("dialog");
    rerender(<ExampleSheet open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

describe("Sheet v2 styles", () => {
  it("renders a popover panel with an overlay shadow", async () => {
    render(<ExampleSheet open />);
    const sheet = await screen.findByRole("dialog");
    const classes = sheet.className.split(" ");
    expect(classes).toContain("bg-popover");
    expect(classes).toContain("text-popover-foreground");
    expect(classes).toContain("shadow-overlay");
    expect(sheet.className).not.toContain("surface-");
    expect(sheet.className).not.toContain("ring-3");
  });

  it("draws a default border on the inner edge", async () => {
    render(<ExampleSheet open />);
    const sheet = await screen.findByRole("dialog");
    expect(sheet.className).toContain("data-[side=right]:border-l");
    expect(sheet.className).not.toContain("hairline");
  });

  it("pads the header and footer with the panel padding", async () => {
    render(<ExampleSheet open />);
    await screen.findByRole("dialog");
    for (const slot of ["sheet-header", "sheet-footer"]) {
      const el = document.querySelector(`[data-slot="${slot}"]`);
      expect(el?.className).toContain("p-[var(--panel-pad,1.125rem)]");
    }
  });

  it("slides in with a reduced-motion fade", async () => {
    render(<ExampleSheet open />);
    const sheet = await screen.findByRole("dialog");
    expect(sheet.className).toContain("duration-200");
    expect(sheet.className).toContain("ease-snappy");
    expect(sheet.className).toContain("motion-reduce:translate-none!");
  });

  it("dims and blurs the backdrop as main does", async () => {
    render(<ExampleSheet open />);
    await screen.findByRole("dialog");
    const overlay = document.querySelector('[data-slot="sheet-overlay"]');
    expect(overlay?.className).toContain("bg-black/10");
    expect(overlay?.className).not.toContain("dark:bg-black");
    expect(overlay?.className).toContain("supports-backdrop-filter:backdrop-blur-xs");
  });
});
