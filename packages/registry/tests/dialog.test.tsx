import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";

function ExampleDialog(props: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleDialog />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByText("Open dialog"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-slot")).toBe("dialog-content");
  });

  it("wires the title and description via aria attributes", async () => {
    const user = userEvent.setup();
    render(<ExampleDialog />);
    await user.click(screen.getByText("Open dialog"));
    const dialog = await screen.findByRole("dialog");
    const title = screen.getByText("Edit profile");
    const description = screen.getByText("Make changes to your profile here.");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("renders a backdrop overlay while open", async () => {
    const user = userEvent.setup();
    render(<ExampleDialog />);
    await user.click(screen.getByText("Open dialog"));
    await screen.findByRole("dialog");
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeTruthy();
  });

  it("closes on Escape and reports it through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleDialog onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Open dialog"));
    await screen.findByRole("dialog");
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    render(<ExampleDialog />);
    await user.click(screen.getByText("Open dialog"));
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Close"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes via a custom DialogClose element", async () => {
    const user = userEvent.setup();
    render(<ExampleDialog />);
    await user.click(screen.getByText("Open dialog"));
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("hides the built-in close button when showCloseButton is false", async () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Plain</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(screen.queryByText("Close")).toBeNull();
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleDialog open />);
    await screen.findByRole("dialog");
    rerender(<ExampleDialog open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

describe("Dialog v2 styles", () => {
  async function renderOpen() {
    render(<ExampleDialog open />);
    return screen.findByRole("dialog");
  }

  it("paints the popup on the popover surface with a ring edge and overlay elevation", async () => {
    const popup = await renderOpen();
    const classes = popup.className.split(" ");
    for (const cls of [
      "bg-popover",
      "text-popover-foreground",
      "ring-1",
      "ring-foreground/10",
      "shadow-overlay",
      "grid",
      "gap-4",
      "p-[var(--panel-pad,1.125rem)]",
    ]) {
      expect(classes).toContain(cls);
    }
    expect(popup.className).not.toContain("surface-");
    expect(popup.className).not.toContain("hairline");
    expect(popup.className).not.toContain("highlight");
    expect(popup.className).not.toContain("ring-3");
  });

  it("parents the consumer's children directly, with no wrapper", async () => {
    const popup = await renderOpen();
    const header = popup.querySelector('[data-slot="dialog-header"]');
    const footer = popup.querySelector('[data-slot="dialog-footer"]');
    expect(header?.parentElement).toBe(popup);
    expect(footer?.parentElement).toBe(popup);
    expect(popup.querySelector('[data-slot="dialog-panel"]')).toBeNull();
  });

  it("puts consumer layout classes on the element that parents the children", async () => {
    render(
      <Dialog open>
        <DialogContent className="max-h-80 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle>Layout</DialogTitle>
          </DialogHeader>
          <p>Body</p>
          <DialogFooter className="m-0">Footer</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const popup = await screen.findByRole("dialog");
    expect(screen.getByText("Body").parentElement).toBe(popup);
    for (const cls of [
      "p-0",
      "gap-0",
      "grid-rows-[auto_minmax(0,1fr)_auto]",
      "overflow-hidden",
    ]) {
      expect(popup.className.split(" ")).toContain(cls);
    }
    // p-0 / gap-0 replace the defaults instead of fighting them.
    expect(popup.className).not.toContain("p-[var(--panel-pad,1.125rem)]");
    expect(popup.className.split(" ")).not.toContain("gap-4");
    // m-0 cancels the footer's bleed margins for full-bleed consumers.
    const footer = screen.getByText("Footer");
    expect(footer.className.split(" ")).toContain("m-0");
    expect(footer.className).not.toContain("-mx-[");
    expect(footer.className).not.toContain("-mb-[");
  });

  it("renders the footer as a muted bar bleeding to the panel edges", async () => {
    const popup = await renderOpen();
    const footer = popup.querySelector('[data-slot="dialog-footer"]');
    for (const cls of [
      "-mx-[var(--panel-pad,1.125rem)]",
      "-mb-[var(--panel-pad,1.125rem)]",
      "bg-muted/50",
      "border-t",
      "rounded-b-xl",
      "p-[var(--panel-pad,1.125rem)]",
    ]) {
      expect(footer?.className.split(" ")).toContain(cls);
    }
    expect(footer?.className).not.toContain("surface-");
    expect(footer?.className).not.toContain("hairline");
  });

  it("scales in with a reduced-motion fallback", async () => {
    const popup = await renderOpen();
    expect(popup.className).toContain("data-starting-style:scale-[0.98]");
    expect(popup.className).toContain("duration-150");
    expect(popup.className).toContain("ease-snappy");
    expect(popup.className).toContain("motion-reduce:scale-100!");
  });

  it("dims and blurs the backdrop as main does", async () => {
    await renderOpen();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay?.className).toContain("bg-black/10");
    expect(overlay?.className).not.toContain("dark:bg-black");
    expect(overlay?.className).toContain("supports-backdrop-filter:backdrop-blur-xs");
  });

  it("sets the title in semibold with tight tracking", async () => {
    await renderOpen();
    const title = screen.getByText("Edit profile");
    expect(title.className).toContain("font-semibold");
    expect(title.className).toContain("tracking-[-0.01em]");
  });
});
