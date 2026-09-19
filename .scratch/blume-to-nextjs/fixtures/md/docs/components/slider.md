---
title: Slider
description: Displays a slider built on the Base UI Slider primitive.
---

```tsx
import { Slider } from "@/registry/base/ui/slider";

export default function SliderDemo() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-8">
      <Slider defaultValue={[40]} />
      <Slider defaultValue={[20, 60]} />
    </div>
  );
}
```

## Installation

<InstallCommand item="slider" />

## Usage

```tsx
import { Slider } from "@/components/ui/slider";

<Slider defaultValue={40} />;
```

## Range

Pass an array to `defaultValue` (or `value`) to render one thumb per value.
Each thumb is indexed automatically in the order its value appears in the
array.

```tsx
import { Slider } from "@/components/ui/slider";

<Slider defaultValue={[20, 60]} />;
```

## Examples

### Vertical

```tsx
import { Slider } from "@/registry/base/ui/slider";

export default function SliderVertical() {
  return (
    <div className="flex h-48 items-stretch gap-8">
      <Slider orientation="vertical" defaultValue={[60]} />
      <Slider orientation="vertical" defaultValue={[20, 80]} />
    </div>
  );
}
```

### Multiple thumbs

One thumb per array entry — three values give a three-thumb slider.

```tsx
import { Slider } from "@/registry/base/ui/slider";

export default function SliderMultiple() {
  return (
    <div className="w-96 max-w-full">
      <Slider defaultValue={[20, 50, 80]} />
    </div>
  );
}
```

### Disabled

```tsx
import { Slider } from "@/registry/base/ui/slider";

export default function SliderDisabled() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-8">
      <Slider defaultValue={[60]} disabled />
      <Slider defaultValue={[20, 60]} disabled />
    </div>
  );
}
```

## API reference

### Slider

Extends the
[Base UI Slider](https://base-ui.com/react/components/slider) Root —
all its props apply; the track, range indicator, and thumbs are built
in. **Pass `value`/`defaultValue` as an array**: one thumb renders per
entry, so `[40]` is a single-value slider and `[20, 60]` a range. With
no value at all, a full-range two-thumb slider is rendered.

| Prop           | Type                            | Default        |
| -------------- | ------------------------------- | -------------- |
| `value`        | `number[]`                      | —              |
| `defaultValue` | `number[]`                      | —              |
| `min` / `max`  | `number`                        | `0` / `100`    |
| `step`         | `number`                        | `1`            |
| `orientation`  | `"horizontal" \| "vertical"`    | `"horizontal"` |
