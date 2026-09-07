import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";

describe("Alert", () => {
  it("exposes role='alert' on the root", () => {
    render(<Alert>Heads up</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("data-slot")).toBe("alert");
    expect(alert.textContent).toBe("Heads up");
  });

  it("renders title and description as composed parts", () => {
    render(
      <Alert>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined.</AlertDescription>
      </Alert>,
    );
    const title = screen.getByText("Payment failed");
    const description = screen.getByText("Your card was declined.");
    expect(title.getAttribute("data-slot")).toBe("alert-title");
    expect(description.getAttribute("data-slot")).toBe("alert-description");
    const alert = screen.getByRole("alert");
    expect(alert.contains(title)).toBe(true);
    expect(alert.contains(description)).toBe(true);
  });

  it("uses the default variant tokens when no variant is given", () => {
    render(<Alert>Default</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.classList.contains("text-card-foreground")).toBe(true);
    expect(alert.classList.contains("text-destructive")).toBe(false);
  });

  it("applies destructive variant tokens", () => {
    render(<Alert variant="destructive">Danger</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.classList.contains("text-destructive")).toBe(true);
    expect(alert.classList.contains("text-card-foreground")).toBe(false);
  });

  it("renders the action slot inside the alert", () => {
    render(
      <Alert>
        <AlertTitle>Update available</AlertTitle>
        <AlertAction>
          <button type="button">Install</button>
        </AlertAction>
      </Alert>,
    );
    const action = screen.getByRole("button", { name: "Install" });
    expect(
      action.closest('[data-slot="alert-action"]'),
    ).not.toBeNull();
  });

  it("appends custom className on every part", () => {
    render(
      <Alert className="root-extra">
        <AlertTitle className="title-extra">T</AlertTitle>
        <AlertDescription className="desc-extra">D</AlertDescription>
        <AlertAction className="action-extra">A</AlertAction>
      </Alert>,
    );
    expect(
      screen.getByRole("alert").classList.contains("root-extra"),
    ).toBe(true);
    expect(screen.getByText("T").classList.contains("title-extra")).toBe(true);
    expect(screen.getByText("D").classList.contains("desc-extra")).toBe(true);
    expect(screen.getByText("A").classList.contains("action-extra")).toBe(true);
  });

  it("forwards arbitrary props to the root element", () => {
    render(<Alert id="billing-alert">X</Alert>);
    expect(screen.getByRole("alert").id).toBe("billing-alert");
  });
});
