---
title: Empty
description: Displays an empty state with media, title, description, and actions.
---

```tsx
"use client";

import { FolderOpenIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function EmptyDemo() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects. Start by creating your first
          one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button size="sm">Create project</Button>
          <Button size="sm" variant="outline">
            Import
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
```

## Installation

<InstallCommand item="empty" />

## Usage

```tsx
import { FolderOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NoProjects() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create your first project to begin.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Create project</Button>
      </EmptyContent>
    </Empty>
  );
}
```

The component is pure composition: `EmptyHeader` holds media, title, and
description; `EmptyContent` holds actions such as buttons, links, or an
input group. Add `border` or background utilities on `Empty` to frame it.

## Examples

### With avatar

`EmptyMedia` with the default variant renders arbitrary media — here an
avatar for a person-centric empty state.

```tsx
"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function EmptyAvatar() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Avatar className="size-10">
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>Emma is offline</EmptyTitle>
        <EmptyDescription>
          Messages you send will be delivered when they come back online.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Leave a note
        </Button>
      </EmptyContent>
    </Empty>
  );
}
```

## API reference

### EmptyMedia

Extends `div`.

| Prop      | Type                    | Default     |
| --------- | ----------------------- | ----------- |
| `variant` | `"default" \| "icon"`   | `"default"` |

The `icon` variant renders a muted square tile sized for a single icon;
`default` leaves the media unstyled for avatars and images.

### Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent

Structural wrappers extending `div` — they accept standard div props and
`className` for layout tweaks.
