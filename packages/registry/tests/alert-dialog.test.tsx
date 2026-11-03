import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";

function ExampleAlertDialog({
  onAction = () => {},
  ...props
}: React.ComponentProps<typeof AlertDialog> & { onAction?: () => void }) {
  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger>Delete account</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("opens with role alertdialog when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleAlertDialog />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    await user.click(screen.getByText("Delete account"));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.getAttribute("data-slot")).toBe("alert-dialog-content");
  });

  it("wires the title and description via aria attributes", async () => {
    const user = userEvent.setup();
    render(<ExampleAlertDialog />);
    await user.click(screen.getByText("Delete account"));
    const dialog = await screen.findByRole("alertdialog");
    const title = screen.getByText("Are you absolutely sure?");
    const description = screen.getByText("This action cannot be undone.");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("stays open when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleAlertDialog />);
    await user.click(screen.getByText("Delete account"));
    await screen.findByRole("alertdialog");
    const overlay = document.querySelector('[data-slot="alert-dialog-overlay"]');
    expect(overlay).toBeTruthy();
    await user.click(overlay as HTMLElement);
    // Base UI alert dialogs are not dismissible via outside press.
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("closes via the cancel button", async () => {
    const user = userEvent.setup();
    render(<ExampleAlertDialog />);
    await user.click(screen.getByText("Delete account"));
    await screen.findByRole("alertdialog");
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });

  it("invokes the action handler and closes the dialog", async () => {
    // AlertDialogAction is a Close part (Radix parity): clicking it fires
    // onClick and dismisses the dialog.
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ExampleAlertDialog onAction={onAction} />);
    await user.click(screen.getByText("Delete account"));
    await screen.findByRole("alertdialog");
    await user.click(screen.getByText("Continue"));
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });

  it("reports open state changes through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleAlertDialog onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Delete account"));
    await screen.findByRole("alertdialog");
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    });
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleAlertDialog open />);
    await screen.findByRole("alertdialog");
    rerender(<ExampleAlertDialog open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });

  it("applies the size data attribute on the content", async () => {
    render(
      <AlertDialog open>
        <AlertDialogContent size="sm">
          <AlertDialogTitle>Compact</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.getAttribute("data-size")).toBe("sm");
  });
});

describe("AlertDialog v2 styles", () => {
  async function renderOpen() {
    render(<ExampleAlertDialog open />);
    return screen.findByRole("alertdialog");
  }

  it("paints the popup as the panel and draws the tray around it", async () => {
    const popup = await renderOpen();
    expect(popup.className).toContain("bg-surface-panel");
    expect(popup.className).toContain("p-[var(--panel-pad,1.125rem)]");
    expect(popup.className).toContain("grid");
    expect(popup.className).toContain(
      "0_0_0_4px_var(--surface-tray,var(--muted))",
    );
    expect(popup.className).toContain("var(--elevation-overlay,");
    expect(popup.className).not.toContain("ring-3");
  });

  it("parents the consumer's children directly, with no wrapper", async () => {
    const popup = await renderOpen();
    const header = popup.querySelector('[data-slot="alert-dialog-header"]');
    const footer = popup.querySelector('[data-slot="alert-dialog-footer"]');
    expect(header?.parentElement).toBe(popup);
    expect(footer?.parentElement).toBe(popup);
    expect(popup.querySelector('[data-slot="alert-dialog-panel"]')).toBeNull();
  });

  it("puts consumer layout classes on the element that parents the children", async () => {
    render(
      <AlertDialog open>
        <AlertDialogContent className="gap-0 p-0">
          <AlertDialogTitle>Layout</AlertDialogTitle>
          <p>Body</p>
          <AlertDialogFooter className="m-0">Footer</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const popup = await screen.findByRole("alertdialog");
    expect(screen.getByText("Body").parentElement).toBe(popup);
    expect(popup.className.split(" ")).toContain("p-0");
    expect(popup.className.split(" ")).toContain("gap-0");
    expect(popup.className).not.toContain("p-[var(--panel-pad,1.125rem)]");
    const footer = screen.getByText("Footer");
    expect(footer.className.split(" ")).toContain("m-0");
    expect(footer.className).not.toContain("-mx-[");
  });

  it("renders the footer as a tray bar bleeding to the panel edges", async () => {
    const popup = await renderOpen();
    const footer = popup.querySelector('[data-slot="alert-dialog-footer"]');
    for (const cls of [
      "-mx-[var(--panel-pad,1.125rem)]",
      "-mb-[var(--panel-pad,1.125rem)]",
      "bg-surface-tray",
      "border-t",
      "border-hairline",
      "rounded-b-xl",
    ]) {
      expect(footer?.className.split(" ")).toContain(cls);
    }
  });

  it("scales in with a reduced-motion fallback", async () => {
    const popup = await renderOpen();
    expect(popup.className).toContain("data-starting-style:scale-[0.98]");
    expect(popup.className).toContain("ease-snappy");
    expect(popup.className).toContain("motion-reduce:scale-100!");
  });

  it("uses a plain dimmed backdrop without blur", async () => {
    await renderOpen();
    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]',
    );
    expect(overlay?.className).toContain("bg-black/40");
    expect(overlay?.className).toContain("dark:bg-black/60");
    expect(overlay?.className).not.toContain("backdrop-blur");
  });

  it("sets the title in semibold with tight tracking", async () => {
    await renderOpen();
    const title = screen.getByText("Are you absolutely sure?");
    expect(title.className).toContain("font-semibold");
    expect(title.className).toContain("tracking-[-0.01em]");
  });
});
