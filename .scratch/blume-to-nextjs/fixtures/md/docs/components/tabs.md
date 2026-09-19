---
title: Tabs
description: A set of layered sections of content — known as tab panels — that display one panel at a time, built on the Base UI Tabs primitive.
---

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList className="w-full">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re
              done.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tabs-demo-name">Name</Label>
              <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tabs-demo-username">Username</Label>
              <Input id="tabs-demo-username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tabs-demo-current">Current password</Label>
              <Input id="tabs-demo-current" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tabs-demo-new">New password</Label>
              <Input id="tabs-demo-new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

## Installation

<InstallCommand item="tabs" />

## Usage

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList className="w-full">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account content</TabsContent>
      <TabsContent value="password">Password content</TabsContent>
    </Tabs>
  );
}
```

## Examples

### Line variant

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

export default function TabsLine() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground">
        A quick summary of your workspace activity.
      </TabsContent>
      <TabsContent value="analytics" className="text-sm text-muted-foreground">
        Traffic and engagement over time.
      </TabsContent>
      <TabsContent value="reports" className="text-sm text-muted-foreground">
        Exportable monthly reports.
      </TabsContent>
    </Tabs>
  );
}
```

### With animated indicator

```tsx
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const tabClassName = "!bg-transparent !shadow-none";

export default function TabsIndicatorDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList className="relative isolate w-full">
        <TabsPrimitive.Indicator className="absolute inset-y-0.5 left-0 z-[-1] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-background shadow-sm transition-[translate,width] duration-200 ease-in-out" />
        <TabsTrigger value="overview" className={tabClassName}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="reports" className={tabClassName}>
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings" className={tabClassName}>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          The indicator slides between tabs using the --active-tab-* variables.
          (Overview)
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground">
          The indicator slides between tabs using the --active-tab-* variables.
          (Reports)
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">
          The indicator slides between tabs using the --active-tab-* variables.
          (Settings)
        </p>
      </TabsContent>
    </Tabs>
  );
}
```

Composes `Tabs.Indicator` directly from `@base-ui/react/tabs`, tracking the
active tab via the `--active-tab-left`/`--active-tab-width` CSS variables.

## API reference

### Tabs

Extends the [Base UI Tabs](https://base-ui.com/react/components/tabs)
Root — all its props apply. Selected-tab styling hooks on `data-active`
(presence); Base UI 1.7 Tabs has no `data-selected` and no `data-state`.

| Prop                     | Type                            | Default        |
| ------------------------ | ------------------------------- | -------------- |
| `value` / `defaultValue` | tab value (`null` deselects all) | `0` (first tab) |
| `onValueChange`          | `(value, eventDetails) => void` | —              |
| `orientation`            | `"horizontal" \| "vertical"`    | `"horizontal"` |

### TabsList

| Prop              | Type                                    | Default     |
| ----------------- | --------------------------------------- | ----------- |
| `variant`         | `"default" \| "line"` — pill or underline style | `"default"` |
| `activateOnFocus` | `boolean` — activate on arrow-key focus | `false`     |
| `loopFocus`       | `boolean` — arrow keys wrap             | `true`      |

With the default `activateOnFocus: false`, arrow keys move focus and
Enter/Space activates.

### TabsTrigger

Renders a native `<button>`, but a disabled trigger stays focusable and
receives `aria-disabled="true"` instead of the native `disabled`
attribute — style disabled state with `data-disabled:`, not the
`disabled:` Tailwind variant.

| Prop           | Type                                                     | Default |
| -------------- | -------------------------------------------------------- | ------- |
| `value`        | tab value (required)                                     | —       |
| `disabled`     | `boolean`                                                | `false` |
| `render`       | `React.ReactElement` — e.g. `render={<a href="/account" />}` | `button` |
| `nativeButton` | `boolean` — set `false` when `render` isn't a button     | `true`  |

### TabsContent

The panel for one tab `value`; unselected panels are hidden.

| Prop          | Type                                              | Default |
| ------------- | ------------------------------------------------- | ------- |
| `value`       | tab value (required)                              | —       |
| `keepMounted` | `boolean` — keep inactive panel markup in the DOM | `false` |

The primitive's animated `Tabs.Indicator` (tracking the active tab via
`--active-tab-left`/`--active-tab-width` CSS variables) is not wrapped —
the "animated indicator" example above composes
`@base-ui/react/tabs` directly inside `TabsList`.
