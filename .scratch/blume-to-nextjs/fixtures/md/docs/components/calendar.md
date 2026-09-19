---
title: Calendar
description: A date field primitive that lets users select dates or ranges.
---

```tsx
"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 12),
  );

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={date}
      className="rounded-lg border shadow-sm"
    />
  );
}
```

## Installation

<InstallCommand item="calendar" />

## Usage

```tsx
import { Calendar } from "@/components/ui/calendar";

<Calendar mode="single" selected={date} onSelect={setDate} />;
```

## Examples

### Range selection

```tsx
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/registry/base/ui/calendar";

export default function CalendarRange() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 5, 8),
    to: new Date(2026, 5, 17),
  });

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      showOutsideDays={false}
      selected={range}
      onSelect={setRange}
      defaultMonth={range?.from}
      className="rounded-lg border shadow-sm"
    />
  );
}
```

## API reference

### Calendar

A thin styling wrapper over [react-day-picker](https://daypicker.dev)
(pinned to `^10.0.1`) — all `DayPicker` props apply. v10 is the
legacy-name release of `@daypicker/react` and ships the v9-shaped API;
guides written for v8 do not apply here (`fromDate`/`toDate` are gone).

| Prop                      | Type                                                    | Default   |
| ------------------------- | ------------------------------------------------------- | --------- |
| `mode`                    | `"single" \| "multiple" \| "range"` — no default; undefined renders non-interactive | — |
| `selected` / `onSelect`   | selection value/callback per mode                       | —         |
| `buttonVariant`           | [Button](/docs/components/button) variant for the nav buttons — SevenUI-only addition | `"ghost"` |
| `startMonth` / `endMonth` | `Date` — navigation bounds                              | —         |
| `captionLayout`           | `"label" \| "dropdown" \| "dropdown-years"` (dropdowns auto-range 100 years back without `startMonth`) | `"label"` |
| `numberOfMonths`          | `number`                                                | `1`       |
| `locale`                  | from `react-day-picker/locale`                          | —         |
| `timeZone`                | `string` — pairs with the re-exported `TZDate` class    | —         |

Day cell state is styled through data attributes — `data-selected`,
`data-today`, `data-outside`, `data-disabled` — and range state through
the `range_start` / `range_middle` / `range_end` `classNames` keys.

### CalendarDayButton

The styled day cell button, exported for use in a custom `components`
override.
