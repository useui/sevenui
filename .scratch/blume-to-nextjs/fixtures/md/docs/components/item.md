---
title: Item
description: A flexible list item with media, content, and actions.
---

```tsx
"use client";

import { BadgeCheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

export default function ItemDemo() {
  return (
    <Item variant="outline" className="max-w-md">
      <ItemMedia variant="icon">
        <BadgeCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Your profile is verified</ItemTitle>
        <ItemDescription>
          Verification adds a badge next to your name on your public profile.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          View
        </Button>
      </ItemActions>
    </Item>
  );
}
```

## Installation

<InstallCommand item="item" />

## Usage

```tsx
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function Notification() {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">{/* icon */}</ItemMedia>
      <ItemContent>
        <ItemTitle>Title</ItemTitle>
        <ItemDescription>Description</ItemDescription>
      </ItemContent>
      <ItemActions>{/* buttons */}</ItemActions>
    </Item>
  );
}
```

Item is a general-purpose content row — for form inputs use
[Field](/docs/components/field) instead. `ItemHeader` and `ItemFooter`
span the full width above and below the media/content row.

## Examples

### Variants

```tsx
"use client";

import { BellIcon } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const variants = ["default", "outline", "muted"] as const;

export default function ItemVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {variants.map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemMedia variant="icon">
            <BellIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="capitalize">{variant}</ItemTitle>
            <ItemDescription>
              The {variant} variant of the item component.
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}
```

### Group

`ItemGroup` renders a `role="list"` stack; `ItemSeparator` divides rows.
An item becomes a link through the `render` prop.

```tsx
"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";

const members = [
  { name: "Emma Clark", role: "Design engineer", initials: "EC" },
  { name: "Jordan Lee", role: "Frontend developer", initials: "JL" },
  { name: "Sam Rivera", role: "Product manager", initials: "SR" },
];

export default function ItemGroupDemo() {
  return (
    <ItemGroup className="max-w-md gap-0 overflow-hidden rounded-lg border">
      {members.map((member, index) => (
        <React.Fragment key={member.name}>
          {index > 0 && <ItemSeparator className="my-0" />}
          <Item
            size="sm"
            className="rounded-none"
            render={<a href="#members" aria-label={member.name} />}
          >
            <ItemMedia>
              <Avatar className="size-8">
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{member.name}</ItemTitle>
              <ItemDescription>{member.role}</ItemDescription>
            </ItemContent>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  );
}
```

## API reference

### Item

Renders a `div` by default; swap the element with the Base UI `render`
prop (for example `render={<a href="…" />}` for link rows).

| Prop      | Type                                  | Default     |
| --------- | ------------------------------------- | ----------- |
| `variant` | `"default" \| "outline" \| "muted"`   | `"default"` |
| `size`    | `"default" \| "sm" \| "xs"`           | `"default"` |
| `render`  | `React.ReactElement`                  | `div`       |

### ItemMedia

Extends `div`. Aligns itself to the first line when a description is
present.

| Prop      | Type                                | Default     |
| --------- | ----------------------------------- | ----------- |
| `variant` | `"default" \| "icon" \| "image"`    | `"default"` |

`icon` sizes a single icon; `image` renders a rounded, size-aware
thumbnail; `default` leaves media (avatars etc.) unstyled.

### ItemSeparator

Extends [Separator](/docs/components/separator), fixed to horizontal.

### ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter

Structural wrappers extending `div` (description renders a `p`). They
accept standard element props and `className`.
