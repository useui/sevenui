---
title: Command
description: A fast, composable command palette built on the Base UI Autocomplete primitive.
---

```tsx
"use client";

import * as React from "react";

import {
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  LogOutIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/base/ui/command";

type Item = {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortcut?: string;
};

type Group = { value: string; items: Item[] };

const commandGroups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar", icon: CalendarIcon },
      { value: "search-emoji", label: "Search Emoji", icon: SmileIcon },
      { value: "calculator", label: "Calculator", icon: CalculatorIcon },
      { value: "new-document", label: "New Document", icon: FileTextIcon },
      { value: "recent-files", label: "Recent Files", icon: ClockIcon },
    ],
  },
  {
    value: "Settings",
    items: [
      {
        value: "profile",
        label: "Profile",
        icon: UserIcon,
        shortcut: "⇧⌘P",
      },
      {
        value: "billing",
        label: "Billing",
        icon: CreditCardIcon,
        shortcut: "⌘B",
      },
      {
        value: "settings",
        label: "Settings",
        icon: SettingsIcon,
        shortcut: "⌘S",
      },
      {
        value: "log-out",
        label: "Log out",
        icon: LogOutIcon,
        shortcut: "⇧⌘Q",
      },
    ],
  },
];

export default function CommandDemo() {
  return (
    <Command items={commandGroups} className="max-w-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {(group: Group) => (
          <CommandGroup key={group.value} heading={group.value} items={group.items}>
            {(item: Item) => (
              <CommandItem key={item.value} value={item}>
                <item.icon />
                {item.label}
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
    </Command>
  );
}
```

## Installation

<InstallCommand item="command" />

## Usage

```tsx
"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
];

export default function CommandDemo() {
  return (
    <Command items={fruits}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {(item: (typeof fruits)[number]) => (
          <CommandItem key={item.value} value={item}>
            {item.label}
          </CommandItem>
        )}
      </CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
    </Command>
  );
}
```

## Dialog

`CommandDialog` wraps `Command` in a Base UI Dialog so the palette can be
toggled with a keyboard shortcut and rendered as a modal overlay. Because the
dialog unmounts its content on close, filter and highlight state reset for
free every time it reopens.

```tsx
"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/base/ui/command";

type Item = { value: string; label: string; shortcut?: string };
type Group = { value: string; items: Item[] };

const commandGroups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar" },
      { value: "search-emoji", label: "Search Emoji" },
      { value: "calculator", label: "Calculator" },
      { value: "new-document", label: "New Document" },
      { value: "recent-files", label: "Recent Files" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", shortcut: "⇧⌘P" },
      { value: "billing", label: "Billing", shortcut: "⌘B" },
      { value: "settings", label: "Settings", shortcut: "⌘S" },
      { value: "log-out", label: "Log out", shortcut: "⇧⌘Q" },
    ],
  },
];

export default function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Press ⌘K or click below
      </p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command items={commandGroups} className="rounded-lg border-none">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            {(group: Group) => (
              <CommandGroup
                key={group.value}
                heading={group.value}
                items={group.items}
              >
                {(item: Item) => (
                  <CommandItem
                    key={item.value}
                    value={item}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                    {item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </Command>
      </CommandDialog>
    </div>
  );
}
```

## API reference

Built from scratch on the [Base UI
Autocomplete](https://base-ui.com/react/components/autocomplete) primitive in
`inline` mode — this is SevenUI's Radix-free replacement for `cmdk`.

### Command

Extends the Autocomplete Root (locked to
`inline open autoHighlight="always" keepHighlight`).

| Prop            | Type                                      | Default            |
| --------------- | ----------------------------------------- | ------------------ |
| `items`         | grouped item data passed to render props  | —                  |
| `filter`        | custom match function (`null` disables)   | substring on label |
| `filteredItems` | externally computed results               | —                  |

### CommandDialog

Wraps `Command` in the [Dialog](/docs/components/dialog) component with
sr-only title and description.

| Prop              | Type              | Default                          |
| ----------------- | ----------------- | -------------------------------- |
| `title`           | `string`          | `"Command Palette"`              |
| `description`     | `string`          | `"Search for a command to run..."` |
| `showCloseButton` | `boolean`         | `false`                          |
| `className`       | `string` — on the DialogContent | —                  |

**Data-driven filtering (intentional divergence from cmdk).** cmdk filters by
reading each item's rendered DOM text. `Command` instead filters the `items`
array you pass to the root — `CommandList` and `CommandGroup` take a
**function child** (`(item) => ReactElement`) that Base UI calls once per
item currently matching the input value, rather than a plain node. Items use
the `{ value, label }` shape; the default filter is a locale-aware substring
match against `.label`. Pass a custom `filter` function for fuzzy matching,
or `filter={null}` together with a `filteredItems` prop to drive results from
an async search yourself.

**Keyboard model.** Virtual focus never leaves the input — the highlighted
item is tracked via `aria-activedescendant`, not real DOM focus. Arrow keys
move the highlight, Enter activates the highlighted item's `onClick`, and
inside `CommandDialog`, Escape closes the dialog (inline Autocomplete mode
disables Base UI's own dismissal so the keypress bubbles up to the Dialog
root).

The component ships with unit tests covering rendering, filtering, the empty
state, and keyboard activation — see `packages/registry/tests/command.test.tsx`.

| Component         | Renders                                                        |
| ------------------ | --------------------------------------------------------------- |
| `Command`          | `Autocomplete.Root` (`inline open autoHighlight="always" keepHighlight`) plus a styled container |
| `CommandInput`      | `Autocomplete.Input` inside an [Input Group](/docs/components/input-group) with a trailing search-icon addon |
| `CommandList`       | `Autocomplete.List` — takes a function child, one call per group/item |
| `CommandGroup`      | `Autocomplete.Group` + `Autocomplete.GroupLabel` (`heading` prop) + `Autocomplete.Collection` |
| `CommandItem`       | `Autocomplete.Item` — highlighted state via `data-highlighted`  |
| `CommandEmpty`      | `Autocomplete.Empty` — always mounted as a `role="status"` live region |
| `CommandShortcut`   | A styled `<span>` for trailing keybinding hints                 |
| `CommandSeparator`  | `Autocomplete.Separator`                                        |
| `CommandDialog`     | The [Dialog](/docs/components/dialog) component wrapping `Command`, with `title` / `description` rendered as sr-only text |
