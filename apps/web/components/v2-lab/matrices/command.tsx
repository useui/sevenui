"use client";

import { Fragment } from "react";
import { CalculatorIcon, CalendarIcon, CreditCardIcon, UserIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/base/ui/command";
import { LabSection } from "../lab-frame";

type Item = { value: string; label: string; icon: typeof UserIcon; shortcut?: string; disabled?: boolean };
type Group = { value: string; items: Item[] };

const GROUPS: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar", icon: CalendarIcon },
      { value: "calculator", label: "Calculator", icon: CalculatorIcon, disabled: true },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", icon: UserIcon, shortcut: "⌘P" },
      { value: "billing", label: "Billing", icon: CreditCardIcon, shortcut: "⌘B" },
    ],
  },
];

function Palette({ empty = false }: { empty?: boolean }) {
  return (
    <Command items={empty ? [] : GROUPS} className="w-72">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {(group: Group, index: number) => (
          <Fragment key={group.value}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group.value} items={group.items}>
              {(item: Item) => (
                <CommandItem key={item.value} value={item} disabled={item.disabled}>
                  <item.icon />
                  {item.label}
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              )}
            </CommandGroup>
          </Fragment>
        )}
      </CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
    </Command>
  );
}

export default function CommandMatrix() {
  return (
    <div>
      <p className="text-muted-foreground mb-4 text-xs">
        CommandDialog portals to the body (tray dialog content); the inline
        palette below is the same tray. First item is highlighted
        (autoHighlight); tab into the input for the offset ring.
      </p>
      <LabSection title="palette (groups, icons, shortcuts, separator, disabled)">
        <Palette />
      </LabSection>
      <LabSection title="empty">
        <Palette empty />
      </LabSection>
    </div>
  );
}
