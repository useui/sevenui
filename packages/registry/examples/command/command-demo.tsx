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
