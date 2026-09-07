import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "@/registry/base/ui/calendar";

// react-day-picker's initial month is month || defaultMonth || today (never
// derived from `selected`), so every test pins defaultMonth for determinism.
const june2026 = new Date(2026, 5, 12);

function dayButton(name: string) {
  return screen.getByRole("button", { name });
}

describe("Calendar", () => {
  it("renders the month grid for the pinned defaultMonth", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={june2026} />,
    );
    expect(container.querySelector("[data-slot=calendar]")).not.toBeNull();
    expect(screen.getByRole("grid", { name: "June 2026" })).toBeDefined();
    expect(screen.getByText("June 2026")).toBeDefined();
    // 7 weekday column headers
    expect(screen.getAllByRole("columnheader", { hidden: true }).length).toBe(
      7,
    );
    expect(dayButton("Monday, June 1st, 2026")).toBeDefined();
    expect(dayButton("Tuesday, June 30th, 2026")).toBeDefined();
  });

  it("shows outside days by default and hides them with showOutsideDays={false}", () => {
    const first = render(<Calendar mode="single" defaultMonth={june2026} />);
    expect(
      first.container.querySelector("td[data-day='2026-05-31']"),
    ).not.toBeNull();
    first.unmount();

    const second = render(
      <Calendar
        mode="single"
        defaultMonth={june2026}
        showOutsideDays={false}
      />,
    );
    const outside = second.container.querySelector("td[data-day='2026-05-31']");
    expect(outside?.textContent ?? "").toBe("");
  });

  it("fires onSelect with the clicked date in single mode", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar mode="single" defaultMonth={june2026} onSelect={onSelect} />,
    );
    await user.click(dayButton("Friday, June 12th, 2026"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const selected = onSelect.mock.calls[0][0] as Date;
    expect(selected.getFullYear()).toBe(2026);
    expect(selected.getMonth()).toBe(5);
    expect(selected.getDate()).toBe(12);
  });

  it("marks the selected day with aria-selected and data-selected-single", () => {
    const { container } = render(
      <Calendar mode="single" selected={june2026} defaultMonth={june2026} />,
    );
    const cell = container.querySelector("td[data-day='2026-06-12']");
    expect(cell?.getAttribute("aria-selected")).toBe("true");
    expect(cell?.getAttribute("data-selected")).toBe("true");
    const button = cell?.querySelector("button");
    expect(button?.getAttribute("data-selected-single")).toBe("true");
    // unselected day carries neither marker
    const other = container.querySelector("td[data-day='2026-06-13']");
    expect(other?.getAttribute("aria-selected")).toBeNull();
    expect(
      other?.querySelector("button")?.getAttribute("data-selected-single"),
    ).not.toBe("true");
  });

  it("navigates months with the previous/next buttons", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={june2026} />);
    await user.click(screen.getByRole("button", { name: "Go to the Next Month" }));
    expect(screen.getByRole("grid", { name: "July 2026" })).toBeDefined();
    await user.click(
      screen.getByRole("button", { name: "Go to the Previous Month" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Go to the Previous Month" }),
    );
    expect(screen.getByRole("grid", { name: "May 2026" })).toBeDefined();
  });

  it("does not select disabled days", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={june2026}
        disabled={[new Date(2026, 5, 15)]}
        onSelect={onSelect}
      />,
    );
    const disabledDay = dayButton("Monday, June 15th, 2026");
    expect(disabledDay.hasAttribute("disabled")).toBe(true);
    await user.click(disabledDay);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects a range across two clicks and marks start/middle/end", async () => {
    const user = userEvent.setup();
    function ControlledRange() {
      const [range, setRange] = React.useState<DateRange | undefined>();
      return (
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={june2026}
        />
      );
    }
    const { container } = render(<ControlledRange />);
    await user.click(dayButton("Monday, June 8th, 2026"));
    await user.click(dayButton("Wednesday, June 17th, 2026"));

    const start = container
      .querySelector("td[data-day='2026-06-08']")
      ?.querySelector("button");
    const middle = container
      .querySelector("td[data-day='2026-06-12']")
      ?.querySelector("button");
    const end = container
      .querySelector("td[data-day='2026-06-17']")
      ?.querySelector("button");
    expect(start?.getAttribute("data-range-start")).toBe("true");
    expect(middle?.getAttribute("data-range-middle")).toBe("true");
    expect(end?.getAttribute("data-range-end")).toBe("true");
  });

  it("extends the nearer endpoint when clicking outside an existing range", async () => {
    const user = userEvent.setup();
    function ControlledRange() {
      const [range, setRange] = React.useState<DateRange | undefined>({
        from: new Date(2026, 5, 8),
        to: new Date(2026, 5, 17),
      });
      return (
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={june2026}
        />
      );
    }
    const { container } = render(<ControlledRange />);
    // June 20 is nearer to the end (17) than the start (8): the end extends.
    await user.click(dayButton("Saturday, June 20th, 2026"));
    const start = container
      .querySelector("td[data-day='2026-06-08']")
      ?.querySelector("button");
    const end = container
      .querySelector("td[data-day='2026-06-20']")
      ?.querySelector("button");
    expect(start?.getAttribute("data-range-start")).toBe("true");
    expect(end?.getAttribute("data-range-end")).toBe("true");
  });

  it("renders month and year dropdowns with captionLayout='dropdown'", async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        mode="single"
        captionLayout="dropdown"
        defaultMonth={june2026}
      />,
    );
    const monthSelect = screen.getByRole("combobox", {
      name: "Choose the Month",
    }) as HTMLSelectElement;
    const yearSelect = screen.getByRole("combobox", {
      name: "Choose the Year",
    }) as HTMLSelectElement;
    expect(monthSelect.value).toBe("5");
    expect(yearSelect.value).toBe("2026");
    // the wrapper's formatMonthDropdown renders short month names
    expect(
      Array.from(monthSelect.options).map((option) => option.text),
    ).toContain("Jun");

    await user.selectOptions(monthSelect, "6");
    expect(screen.getByRole("grid", { name: "July 2026" })).toBeDefined();
  });
});
