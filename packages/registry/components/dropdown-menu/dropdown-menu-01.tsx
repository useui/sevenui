"use client";

import { CreditCard, Keyboard, LifeBuoy, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const ACCOUNT_ITEMS = [
  { label: "Profile", icon: User, shortcut: "⇧⌘P" },
  { label: "Billing", icon: CreditCard, shortcut: "⌘B" },
  { label: "Settings", icon: Settings, shortcut: "⌘," },
  { label: "Keyboard shortcuts", icon: Keyboard, shortcut: "⌘/" },
];

export default function DropdownMenu01() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu for Maya Chen"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Avatar>
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-medium text-foreground">
              Maya Chen
            </span>
            <span className="truncate font-normal">maya@northwind.dev</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {ACCOUNT_ITEMS.map(({ label, icon: Icon, shortcut }) => (
            <DropdownMenuItem key={label}>
              <Icon aria-hidden="true" />
              {label}
              <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LifeBuoy aria-hidden="true" />
          Help and support
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <LogOut aria-hidden="true" />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
