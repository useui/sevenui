---
title: Alert
description: Displays a message with optional title and description for the user.
---

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the shadcn CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Your session has expired.</AlertDescription>
      </Alert>
    </div>
  );
}
```

## Installation

<InstallCommand item="alert" />

## Usage

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the shadcn CLI.</AlertDescription>
</Alert>;
```

## Examples

### With action

`AlertAction` pins a control — a dismiss button, an undo — to the
alert's top-right corner.

```tsx
"use client";

import { CheckCircle2Icon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";

export default function AlertActionDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Backup completed</AlertTitle>
        <AlertDescription>
          Snapshot stored two minutes ago.
        </AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
            <XIcon />
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Conversation deleted</AlertTitle>
        <AlertDescription>This action can be reverted.</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="xs">
            Undo
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
```

## API reference

### Alert

Extends `div` with `role="alert"`. A direct `svg` child becomes the
leading icon spanning both text rows.

| Prop      | Type                            | Default     |
| --------- | ------------------------------- | ----------- |
| `variant` | `"default" \| "destructive"`    | `"default"` |

### AlertTitle, AlertDescription, AlertAction

Structural wrappers extending `div`. `AlertAction` pins its content
(typically a small button) to the alert's top-right corner.
