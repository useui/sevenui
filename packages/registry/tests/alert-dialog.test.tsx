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
