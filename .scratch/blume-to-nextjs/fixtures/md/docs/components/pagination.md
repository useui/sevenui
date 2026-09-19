---
title: Pagination
description: Displays navigation for multi-page content.
---

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/registry/base/ui/pagination";

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Installation

<InstallCommand item="pagination" />

## Usage

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>;
```

## Examples

### Simple

Previous/next only — for feeds and detail pages where numbered links
add noise.

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

export default function PaginationSimple() {
  return (
    <Pagination>
      <PaginationContent className="w-full max-w-xs justify-between">
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm text-muted-foreground">Page 2 of 10</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## API reference

### PaginationLink

An `a` element styled through [Button](/docs/components/button) —
`ghost` normally, `outline` when active.

| Prop       | Type          | Default  |
| ---------- | ------------- | -------- |
| `isActive` | `boolean`     | `false`  |
| `size`     | Button sizes  | `"icon"` |

### PaginationPrevious and PaginationNext

Extend `PaginationLink` with a chevron and a label.

| Prop   | Type     | Default                     |
| ------ | -------- | --------------------------- |
| `text` | `string` | `"Previous"` / `"Next"`     |

### Pagination, PaginationContent, PaginationItem, PaginationEllipsis

Semantic wrappers extending `nav` (labeled "pagination"), `ul`, `li`,
and `span`; the ellipsis is hidden from assistive tech.
