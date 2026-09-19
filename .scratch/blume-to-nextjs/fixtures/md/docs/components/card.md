---
title: Card
description: Displays a container with optional header, content, and footer sections.
---

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Button } from "@/registry/base/ui/button";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>Manage how this project behaves.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Changes apply to every member of the project.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

## Installation

<InstallCommand item="card" />

## Usage

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>Card content goes here.</CardContent>
  <CardFooter>Card footer goes here.</CardFooter>
</Card>;
```

## Examples

### Login form

`CardAction` places the "Sign up" button in the header's top-right
corner.

```tsx
"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function CardLogin() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-login-email">Email</Label>
            <Input
              id="card-login-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="card-login-password">Password</Label>
              <a href="#forgot" className="text-xs underline underline-offset-3">
                Forgot your password?
              </a>
            </div>
            <Input id="card-login-password" type="password" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Login</Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Stats

Compact metric cards using `size="sm"` with trend badges as header
actions.

```tsx
"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const stats = [
  {
    label: "Total revenue",
    value: "$1,250.00",
    trend: "+12.5%",
    up: true,
    note: "Trending up this month",
  },
  {
    label: "New customers",
    value: "1,234",
    trend: "-20%",
    up: false,
    note: "Down from last period",
  },
];

export default function CardStats() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {stat.up ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {stat.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            {stat.note}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### With image

A first-child image renders edge-to-edge with rounded top corners.

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

export default function CardImage() {
  return (
    <Card className="w-full max-w-sm">
      <img src="/placeholder.svg" alt="" className="aspect-video object-cover" />
      <CardHeader>
        <CardTitle>Designing with constraints</CardTitle>
        <CardDescription>
          Why limitations make interfaces better, not worse.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Grids, type scales, and spacing tokens do the heavy lifting so every
        screen feels like part of the same product.
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Read article
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Settings

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const settings = [
  {
    id: "card-notify-comments",
    label: "Comments",
    description: "When someone replies to your thread",
    defaultChecked: true,
  },
  {
    id: "card-notify-mentions",
    label: "Mentions",
    description: "When someone mentions you",
    defaultChecked: true,
  },
  {
    id: "card-notify-digest",
    label: "Weekly digest",
    description: "Summary of activity every Monday",
    defaultChecked: false,
  },
];

export default function CardNotifications() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={setting.id}>{setting.label}</Label>
              <span className="text-xs text-muted-foreground">
                {setting.description}
              </span>
            </div>
            <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Project

```tsx
"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

export default function CardProject() {
  return (
    <Card size="sm" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Design system refresh</CardTitle>
        <CardDescription>Due Friday · 8 tasks left</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Project options">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {["EC", "JL", "SR"].map((initials) => (
            <Avatar key={initials} className="size-6 ring-2 ring-card">
              <AvatarFallback className="text-[0.6rem]">
                {initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Badge variant="secondary">In progress</Badge>
      </CardContent>
    </Card>
  );
}
```

## API reference

### Card

Extends `div`. The container also handles edge-to-edge images: an `img`
as first or last child gets rounded corners and no padding.

| Prop   | Type                  | Default     |
| ------ | --------------------- | ----------- |
| `size` | `"default" \| "sm"`   | `"default"` |

`sm` tightens the internal spacing for compact cards.

### CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter

Structural wrappers extending `div`. `CardHeader` switches to a
two-column grid when a `CardAction` is present, placing the action in
the top-right corner.
