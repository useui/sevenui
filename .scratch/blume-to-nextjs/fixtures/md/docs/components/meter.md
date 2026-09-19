---
title: Meter
description: Displays a value within a known range, built on the Base UI Meter primitive.
---

```tsx
"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

export default function MeterDemo() {
  return (
    <Meter value={65} className="max-w-sm grid-cols-2">
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue className="text-right" />
    </Meter>
  );
}
```

## Installation

<InstallCommand item="meter" />

## Usage

```tsx
import { Meter, MeterLabel, MeterValue } from "@/components/ui/meter";

<Meter value={65} className="max-w-sm grid-cols-2">
  <MeterLabel>Storage used</MeterLabel>
  <MeterValue className="text-right" />
</Meter>;
```

## Examples

### Custom format

`format` takes `Intl.NumberFormatOptions` — here a raw gigabyte value
with `max={256}` instead of the default percentage.

```tsx
"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

export default function MeterFormat() {
  return (
    <Meter
      value={192}
      max={256}
      format={{ style: "unit", unit: "gigabyte" }}
      className="max-w-sm grid-cols-2"
    >
      <MeterLabel>Disk space</MeterLabel>
      <MeterValue className="text-right" />
    </Meter>
  );
}
```

### System resources

```tsx
"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const resources = [
  { label: "CPU", value: 42 },
  { label: "Memory", value: 78 },
  { label: "Bandwidth", value: 23 },
];

export default function MeterResources() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {resources.map((resource) => (
        <Meter
          key={resource.label}
          value={resource.value}
          className="grid-cols-2"
        >
          <MeterLabel>{resource.label}</MeterLabel>
          <MeterValue className="text-right" />
        </Meter>
      ))}
    </div>
  );
}
```

## API reference

Meter is a Base UI bonus primitive absent from shadcn/ui, like Number
Field and Toolbar.

### Meter

Extends the [Base UI Meter](https://base-ui.com/react/components/meter)
Root — all its props (`value`, `min`, `max`, `format`, …) apply, and the
track and indicator are rendered automatically. `role="meter"` semantics
for a value within a known range — use
[Progress](/docs/components/progress) for task completion instead.
`value` is required and non-nullable; there is no indeterminate state.
The default display is a percentage; pass `format`
(`Intl.NumberFormatOptions`, e.g. `{ style: "unit", unit: "gigabyte" }`)
to change it.

### MeterLabel and MeterValue

Extend the Base UI Label and Value parts. The label wires
`aria-labelledby` on the root automatically; the value renders the
formatted current value.
