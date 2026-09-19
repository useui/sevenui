---
title: Avatar
description: An image element with a fallback for representing the user.
---

```tsx
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>EC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/logomark.svg" alt="SevenUI" />
        <AvatarFallback>7U</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>JL</AvatarFallback>
        <AvatarBadge aria-label="Online" className="bg-green-500" />
      </Avatar>
    </div>
  );
}
```

## Installation

<InstallCommand item="avatar" />

## Usage

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>;
```

## Examples

### Group

`AvatarGroup` stacks avatars with overlap and background rings;
`AvatarGroupCount` renders the overflow counter. Sizes inside the group
follow the avatars' `size`.

```tsx
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";

export default function AvatarGroupDemo() {
  return (
    <AvatarGroup>
      {["EC", "JL", "SR"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  );
}
```

## API reference

### Avatar

Extends the
[Base UI Avatar](https://base-ui.com/react/components/avatar) Root —
all its props apply.

| Prop   | Type                          | Default     |
| ------ | ----------------------------- | ----------- |
| `size` | `"default" \| "sm" \| "lg"`   | `"default"` |

### AvatarImage and AvatarFallback

Extend the Base UI Image and Fallback parts. The image swaps to the
fallback on load failure; `AvatarFallback` accepts a `delay` prop (ms)
to avoid flashing it while the image loads.

### AvatarBadge

Extends `span`. A status dot pinned to the bottom-right corner, sized
automatically per avatar `size` (fits a small icon on `default`/`lg`).
Color it with `className` and label it with `aria-label`.

### AvatarGroup and AvatarGroupCount

Structural wrappers extending `div` — the group overlaps its avatars,
the count renders a same-sized circle for the "+N" overflow.
