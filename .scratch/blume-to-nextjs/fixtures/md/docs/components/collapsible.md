---
title: Collapsible
description: An interactive primitive which expands/collapses a panel, built on the Base UI Collapsible.
---

```tsx
"use client";

import * as React from "react";

import { ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

export default function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex w-full max-w-sm flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="text-sm font-semibold">
          @owuzan starred 3 repositories
        </h4>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="icon" className="size-8" />}
        >
          <ChevronsUpDownIcon className="size-4" />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">
        shadcn-ui/ui
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          mui/base-ui
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          useui/sevenui
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Installation

<InstallCommand item="collapsible" />

## Usage

```tsx
"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function CollapsibleDemo() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
      <CollapsibleContent>
        Yes. Free to use for personal and commercial projects.
      </CollapsibleContent>
    </Collapsible>
  );
}
```

## Examples

### File tree

Nested collapsibles with the open state styled through
`data-panel-open` on the trigger (the rotating chevron).

```tsx
"use client";

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

type TreeNode = { name: string; children?: TreeNode[] };

const tree: TreeNode[] = [
  {
    name: "src",
    children: [
      {
        name: "components",
        children: [{ name: "button.tsx" }, { name: "card.tsx" }],
      },
      { name: "lib", children: [{ name: "utils.ts" }] },
      { name: "index.ts" },
    ],
  },
  { name: "package.json" },
  { name: "README.md" },
];

function TreeItem({ node }: { node: TreeNode }) {
  if (!node.children) {
    return (
      <div className="flex items-center gap-2 rounded-md px-2 py-1 text-sm">
        <FileIcon className="size-4 text-muted-foreground" />
        {node.name}
      </div>
    );
  }

  return (
    <Collapsible defaultOpen={node.name === "src"}>
      <CollapsibleTrigger className="group/tree flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-data-panel-open/tree:rotate-90" />
        <FolderIcon className="size-4 text-muted-foreground" />
        {node.name}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-5">
        {node.children.map((child) => (
          <TreeItem key={child.name} node={child} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CollapsibleFileTree() {
  return (
    <div className="w-full max-w-xs rounded-lg border p-2">
      {tree.map((node) => (
        <TreeItem key={node.name} node={node} />
      ))}
    </div>
  );
}
```

## API reference

### Collapsible

Extends the
[Base UI Collapsible](https://base-ui.com/react/components/collapsible)
Root (a `<div>`).

| Prop                   | Type                      | Default |
| ---------------------- | ------------------------- | ------- |
| `open` / `defaultOpen` | `boolean`                 | `false` |
| `onOpenChange`         | `(open: boolean) => void` | —       |
| `disabled`             | `boolean`                 | `false` |

### CollapsibleTrigger

Open state styles via `data-panel-open` (presence). A disabled trigger
stays focusable with `aria-disabled="true"` — style it with
`data-disabled:`, not `disabled:`.

### CollapsibleContent

Closed content unmounts by default. `keepMounted` and `hiddenUntilFound`
are **Panel** props here (unlike Accordion, where they live on the
Root) — pass them through this primitive. Open/close animates via the
`animate-collapsible-down` / `animate-collapsible-up` utilities, whose
keyframes (driven by the Base UI-set `--collapsible-panel-height`
variable) ship in this primitive's registry item — the CLI merges them
into your CSS, same as the accordion's.

| Prop               | Type      | Default |
| ------------------ | --------- | ------- |
| `keepMounted`      | `boolean` | `false` |
| `hiddenUntilFound` | `boolean` | `false` |
