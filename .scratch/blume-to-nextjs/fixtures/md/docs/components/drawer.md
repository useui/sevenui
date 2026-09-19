---
title: Drawer
description: A panel that slides in from an edge of the screen and can be dismissed with a swipe gesture, built on the Base UI Drawer primitive.
---

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col items-center justify-center gap-1 p-4">
            <div className="text-6xl font-bold tracking-tighter">350</div>
            <div className="text-sm text-muted-foreground">
              calories/day
            </div>
          </div>
          <DrawerFooter>
            <Button type="submit">Submit</Button>
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

## Installation

<InstallCommand item="drawer" />

## Usage

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col items-center justify-center gap-1 p-4">
            <div className="text-6xl font-bold tracking-tighter">350</div>
            <div className="text-sm text-muted-foreground">
              calories/day
            </div>
          </div>
          <DrawerFooter>
            <Button type="submit">Submit</Button>
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

## Examples

### Snap points

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";

const steps = [
  "Pick a base color for your theme.",
  "Adjust the radius and contrast to taste.",
  "Export the generated CSS variables.",
];

export default function DrawerSnapPoints() {
  return (
    <Drawer snapPoints={[0.5, 1]} showSwipeHandle>
      <DrawerTrigger
        render={<Button variant="outline">Open with snap points</Button>}
      />
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Theme setup</DrawerTitle>
            <DrawerDescription>
              Drag the handle — the drawer rests at half height, then full.
            </DrawerDescription>
          </DrawerHeader>
          <ol className="flex flex-col gap-3 p-4 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-medium text-foreground">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

## API reference

### Drawer

Extends the [Base UI Drawer](https://base-ui.com/react/components/drawer)
Root — a real, standalone Base UI component (no
[vaul](https://vaul.emilkowal.ski)); the Radix-free replacement for the
classic shadcn/vaul drawer. All Dialog-style root props apply, plus the
drawer-specific ones:

| Prop                      | Type                                    | Default  |
| ------------------------- | --------------------------------------- | -------- |
| `open` / `defaultOpen`    | `boolean`                               | `false`  |
| `onOpenChange`            | `(open: boolean) => void`               | —        |
| `swipeDirection`          | `"down" \| "up" \| "left" \| "right"`   | `"down"` |
| `snapPoints`              | `number[]` — resting heights (0–1)      | —        |
| `showSwipeHandle`         | `boolean` — grab handle in the content  | `false`  |
| `modal`                   | `true \| false \| "trap-focus"`         | `true`   |
| `disablePointerDismissal` | `boolean`                               | `false`  |

### DrawerContent

Includes the mandatory `Drawer.Viewport` internally — it owns the
swipe-gesture engine (without it, swipe-to-dismiss silently does
nothing). Add `data-base-ui-swipe-ignore` to an element inside to opt it
out of swipe handling; interactive elements (buttons, inputs, links) are
ignored automatically.

### DrawerSwipeHandle

The grab handle bar — rendered automatically when `showSwipeHandle` is
set on the root, or compose it manually.

### DrawerTrigger, DrawerClose, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerOverlay, DrawerPortal

Styled parts; trigger and close accept the `render` prop. Advanced
primitive features (`snapPoint`/`onSnapPointChange` control,
`Drawer.SwipeArea` swipe-to-open, the nested-drawer
`Drawer.Indent` effect) remain available by composing
`@base-ui/react/drawer` directly.
