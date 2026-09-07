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
