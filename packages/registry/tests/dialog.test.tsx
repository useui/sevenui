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

  it("renders the popup as a tray with an overlay shadow", async () => {
    const popup = await renderOpen();
    expect(popup.className).toContain("bg-surface-tray");
    expect(popup.className).toContain("p-1");
    expect(popup.className).toContain("shadow-overlay");
    expect(popup.className).not.toContain("ring-3");
  });

  it("holds a padded panel for everything but the footer", async () => {
    const popup = await renderOpen();
    const panel = popup.querySelector('[data-slot="dialog-panel"]');
    expect(panel?.className).toContain("bg-surface-panel");
    expect(panel?.className).toContain("p-[var(--panel-pad,1.125rem)]");
    expect(panel?.querySelector('[data-slot="dialog-header"]')).toBeTruthy();
    const footer = popup.querySelector('[data-slot="dialog-footer"]');
    expect(footer?.parentElement).toBe(popup);
  });

  it("keeps the panel radius valid when the theme radius is 0", async () => {
    const popup = await renderOpen();
    const panel = popup.querySelector('[data-slot="dialog-panel"]');
    expect(panel?.className).toContain(
      "rounded-[max(0px,calc(--theme(--radius-xl)_-_4px))]",
    );
  });

  it("scales in with a reduced-motion fallback", async () => {
    const popup = await renderOpen();
    expect(popup.className).toContain("data-starting-style:scale-[0.98]");
    expect(popup.className).toContain("duration-150");
    expect(popup.className).toContain("ease-snappy");
    expect(popup.className).toContain("motion-reduce:scale-100!");
  });

  it("uses a plain dimmed backdrop without blur", async () => {
    await renderOpen();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay?.className).toContain("bg-black/40");
    expect(overlay?.className).toContain("dark:bg-black/60");
    expect(overlay?.className).not.toContain("backdrop-blur");
  });

  it("sets the title in semibold with tight tracking", async () => {
    await renderOpen();
    const title = screen.getByText("Edit profile");
    expect(title.className).toContain("font-semibold");
    expect(title.className).toContain("tracking-[-0.01em]");
  });
});
