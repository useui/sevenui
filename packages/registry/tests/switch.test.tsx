import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "@/registry/base/ui/switch";

describe("Switch", () => {
  it("renders a switch role, unchecked by default", () => {
    render(<Switch aria-label="Airplane mode" />);
    const control = screen.getByRole("switch", { name: "Airplane mode" });
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.getAttribute("data-slot")).toBe("switch");
  });

  it("toggles on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Airplane mode" />);
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    await user.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles with the Space key", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Airplane mode" />);
    const control = screen.getByRole("switch");
    control.focus();
    await user.keyboard("[Space]");
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles with the Enter key", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Airplane mode" />);
    const control = screen.getByRole("switch");
    control.focus();
    await user.keyboard("{Enter}");
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("starts on with defaultChecked", () => {
    render(<Switch aria-label="Airplane mode" defaultChecked />);
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("stays at the controlled value and reports changes via onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch
        aria-label="Airplane mode"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("updates when the controlled value changes", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return (
        <Switch
          aria-label="Airplane mode"
          checked={checked}
          onCheckedChange={setChecked}
        />
      );
    }
    render(<Controlled />);
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch
        aria-label="Airplane mode"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("exposes the SevenUI size prop as data-size", () => {
    render(<Switch aria-label="Airplane mode" size="sm" />);
    expect(screen.getByRole("switch").getAttribute("data-size")).toBe("sm");
  });

  it("defaults data-size to default", () => {
    render(<Switch aria-label="Airplane mode" />);
    expect(screen.getByRole("switch").getAttribute("data-size")).toBe(
      "default",
    );
  });
});
