---
title: Scroll Area
description: Augments native scroll functionality for custom, cross-browser styling, built on the Base UI Scroll Area primitive.
---

```tsx
import * as React from "react";

import { ScrollArea } from "@/registry/base/ui/scroll-area";
import { Separator } from "@/registry/base/ui/separator";

const tags = Array.from({ length: 50 }, (_, i) => `v1.2.0-beta.${50 - i}`);

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
```

## Installation

<InstallCommand item="scroll-area" />

## Usage

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">Content</div>
</ScrollArea>;
```

## Examples

### Horizontal

Content wider than the container (`w-max`) scrolls on the x-axis with
`orientation="horizontal"`.

```tsx
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const artworks = [
  "Sunrise over the bay",
  "Concrete and glass",
  "Field studies",
  "Night traffic",
  "Quiet interiors",
  "Coastal walk",
];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea
      orientation="horizontal"
      className="w-full max-w-sm rounded-lg border"
    >
      <div className="flex w-max gap-3 p-3">
        {artworks.map((title) => (
          <figure key={title} className="w-36 shrink-0">
            <img
              src="/placeholder.svg"
              alt=""
              className="aspect-square rounded-md object-cover"
            />
            <figcaption className="mt-1.5 truncate text-xs text-muted-foreground">
              {title}
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea>
  );
}
```

## API reference

### ScrollArea

Extends the
[Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
Root — all its props apply. Children render inside the Viewport; the
matching scrollbar(s) and the Corner are included automatically, so
scrollbars are never passed as children. The Viewport becomes
keyboard-focusable automatically whenever its content overflows.

| Prop          | Type                                       | Default      |
| ------------- | ------------------------------------------ | ------------ |
| `orientation` | `"vertical" \| "horizontal" \| "both"`     | `"vertical"` |

### ScrollBar

Extends the Base UI Scrollbar part (thumb included).

| Prop          | Type                             | Default      |
| ------------- | -------------------------------- | ------------ |
| `orientation` | `"vertical" \| "horizontal"`     | `"vertical"` |

Scrollbars are overlay-style: invisible until hover or scroll (via the
`data-hovering` / `data-scrolling` attributes). The thumb sizes itself
through Base UI's `--scroll-area-thumb-height` / `-width` variables —
don't set its dimensions manually. The Viewport also exposes
`--scroll-area-overflow-{x,y}-{start,end}` variables for scroll-fade
masks.
