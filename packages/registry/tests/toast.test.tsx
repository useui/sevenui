import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Toaster,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

function getToasts() {
  return document.querySelectorAll('[data-slot="toast"]');
}

describe("Toaster", () => {
  it("renders no toasts initially", () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    expect(getToasts().length).toBe(0);
  });

  it("shows a toast with title and description when added imperatively", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    act(() => {
      manager.add({ title: "Saved", description: "Your changes have been saved." });
    });
    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeTruthy();
    });
    expect(screen.getByText("Your changes have been saved.")).toBeTruthy();
    expect(getToasts().length).toBe(1);
  });

  it("renders the type icon for typed toasts", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    act(() => {
      manager.add({ title: "Done", type: "success" });
    });
    await waitFor(() => {
      expect(screen.getByText("Done")).toBeTruthy();
    });
    expect(document.querySelector('[data-slot="toast-icon"]')).toBeTruthy();
  });

  it("dismisses a toast via its close button", async () => {
    const user = userEvent.setup();
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    act(() => {
      manager.add({ title: "Dismiss me" });
    });
    const close = await screen.findByLabelText("Close toast");
    await user.click(close);
    await waitFor(() => {
      expect(screen.queryByText("Dismiss me")).toBeNull();
    });
    expect(getToasts().length).toBe(0);
  });

  it("dismisses a toast via the manager close API", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    let id = "";
    act(() => {
      id = manager.add({ title: "Programmatic" });
    });
    await screen.findByText("Programmatic");
    act(() => {
      manager.close(id);
    });
    await waitFor(() => {
      expect(screen.queryByText("Programmatic")).toBeNull();
    });
  });

  it("stacks multiple toasts", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    act(() => {
      manager.add({ title: "First toast" });
      manager.add({ title: "Second toast" });
      manager.add({ title: "Third toast" });
    });
    await waitFor(() => {
      expect(getToasts().length).toBe(3);
    });
    expect(screen.getByText("First toast")).toBeTruthy();
    expect(screen.getByText("Second toast")).toBeTruthy();
    expect(screen.getByText("Third toast")).toBeTruthy();
  });

  it("supports triggering toasts from components via useToastManager", async () => {
    function NotifyButton() {
      const toastManager = useToastManager();
      return (
        <button
          onClick={() => toastManager.add({ title: "Hook toast", description: "From the hook" })}
        >
          Notify
        </button>
      );
    }

    const user = userEvent.setup();
    const manager = createToastManager();
    render(
      <Toaster toastManager={manager}>
        <NotifyButton />
      </Toaster>,
    );
    await user.click(screen.getByText("Notify"));
    await waitFor(() => {
      expect(screen.getByText("Hook toast")).toBeTruthy();
    });
    expect(screen.getByText("From the hook")).toBeTruthy();
  });

  it("updates an existing toast through the manager", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} />);
    let id = "";
    act(() => {
      id = manager.add({ title: "Uploading" });
    });
    await screen.findByText("Uploading");
    act(() => {
      manager.update(id, { title: "Upload complete" });
    });
    await waitFor(() => {
      expect(screen.getByText("Upload complete")).toBeTruthy();
    });
    expect(screen.queryByText("Uploading")).toBeNull();
    expect(getToasts().length).toBe(1);
  });
});
