---
title: Progress
description: Displays an indicator showing the completion progress of a task.
---

```tsx
"use client";

import * as React from "react";

import { Progress } from "@/registry/base/ui/progress";

export default function ProgressDemo() {
  const [value, setValue] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setValue(80), 600);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={value} className="w-72 max-w-full" />;
}
```

## Installation

<InstallCommand item="progress" />

## Usage

```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={33} />;
```

## Examples

### With label and value

Children render above the built-in bar — compose `ProgressLabel` and
`ProgressValue` into a row.

```tsx
"use client";

import * as React from "react";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

export default function ProgressLabelDemo() {
  const [value, setValue] = React.useState(20);

  React.useEffect(() => {
    const timer = setTimeout(() => setValue(65), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Progress value={value} className="w-72 max-w-full">
      <div className="flex w-full items-center justify-between">
        <ProgressLabel>Uploading assets</ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  );
}
```

## API reference

### Progress

Extends the
[Base UI Progress](https://base-ui.com/react/components/progress) Root —
all its props (`value`, `min`, `max`, `format`, …) apply. Pass
`value={null}` for an indeterminate state. The track and indicator are
rendered automatically; children appear above them.

### ProgressLabel and ProgressValue

Extend the Base UI Label and Value parts. The label wires
`aria-labelledby` on the root; the value renders the formatted current
value (percentage by default).

### ProgressTrack and ProgressIndicator

Styled Base UI parts, exported for fully custom compositions — the
default `Progress` already includes one of each.
