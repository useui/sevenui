import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "@/registry/base/ui/switch";
import { byFlavour } from "./helpers/flavour";
import { must } from "./helpers/must";

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
    // UI SDK follows the native checkbox: Enter submits the form and never
    // toggles a switch; only Space does.
    expect(control.getAttribute("aria-checked")).toBe(
      byFlavour({ base: "true", "ui-sdk": "false" }),
    );
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

describe("Switch styles", () => {
  function parts(props: React.ComponentProps<typeof Switch> = {}) {
    const { container } = render(<Switch aria-label="Wi-Fi" {...props} />);
    return {
      root: screen.getByRole("switch"),
      thumb: must(container.querySelector("[data-slot=switch-thumb]")),
    };
  }

  it("uses the ring-3 focus halo, not the offset focus ring", () => {
    const { root } = parts();
    const cls = root.className;
    expect(cls).toContain("focus-visible:border-ring");
    expect(cls).toContain("focus-visible:ring-3");
    expect(cls).toContain("focus-visible:ring-ring/50");
    expect(cls).not.toMatch(/:focus-ring(\s|$)/);
    expect(cls).not.toContain("--focus-color");
    expect(cls).toContain("aria-invalid:ring-destructive/20");
  });

  it("sizes the track from --switch-* variables with a compact override", () => {
    const { root } = parts();
    expect(root.className).toContain("[--switch-h:19px]");
    expect(root.className).toContain("[--switch-w:2rem]");
    expect(root.className).toContain(
      "[[data-density=compact]_&]:[--switch-h:1rem]",
    );
    expect(root.className).toContain(
      "[[data-density=compact]_&]:[--switch-w:1.75rem]",
    );
    expect(root.className).toContain("h-(--switch-h)");
    expect(root.className).toContain("w-(--switch-w)");
  });

  it("uses the input colour off and primary on", () => {
    const { root } = parts();
    expect(root.className).toContain("data-unchecked:bg-input");
    expect(root.className).not.toContain("hairline");
    expect(root.className).toContain("data-checked:bg-primary");
    expect(root.className).not.toContain("brand");
  });

  it("gives the thumb a white raised surface and a spring with a reduced-motion counterpart", () => {
    const { thumb } = parts();
    expect(thumb.className).toContain("bg-white");
    expect(thumb.className).toContain("shadow-raised");
    expect(thumb.className).toContain("transition-transform");
    expect(thumb.className).toContain("duration-200");
    expect(thumb.className).toContain("ease-spring");
    expect(thumb.className).toContain("motion-reduce:transition-none");
  });
});
