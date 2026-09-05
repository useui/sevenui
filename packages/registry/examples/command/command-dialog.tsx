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
