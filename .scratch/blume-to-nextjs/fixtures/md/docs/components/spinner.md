---
title: Spinner
description: Displays a loading indicator.
---

```tsx
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Button disabled>
        <Spinner />
        Loading…
      </Button>
    </div>
  );
}
```

## Installation

<InstallCommand item="spinner" />

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner />;
```

## API reference

### Spinner

Renders the `lucide-react` `Loader2` icon with a spin animation —
accepts all `svg` props. Size it with `className` (defaults to the
surrounding icon size).
