"use client";

import * as React from "react";

import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  LockIcon,
  PencilIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
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

type Action = {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortcut?: string;
  locked?: boolean;
  destructive?: boolean;
};

type Group = { value: string; items: Action[] };

const groups: Group[] = [
  {
    value: "Project",
    items: [
      { value: "rename", label: "Rename project", icon: PencilIcon, shortcut: "F2" },
      { value: "duplicate", label: "Duplicate", icon: CopyIcon, shortcut: "⌘D" },
      { value: "export", label: "Export as CSV", icon: DownloadIcon },
    ],
  },
  {
    value: "Team plan",
    items: [
      { value: "guests", label: "Invite guests", icon: UsersIcon, locked: true },
      { value: "sso", label: "Enforce SSO", icon: ShieldCheckIcon, locked: true },
    ],
  },
  {
    value: "Danger zone",
    items: [
      { value: "archive", label: "Archive project", icon: ArchiveIcon },
      {
        value: "delete",
        label: "Delete project",
        icon: Trash2Icon,
        shortcut: "⌘⌫",
        destructive: true,
      },
    ],
  },
];

export default function Command03() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Command items={groups} className="border border-border shadow-md">
        <CommandInput
          placeholder="Search project actions..."
          aria-label="Search project actions"
        />
        <CommandList className="max-h-96">
          {(group: Group, index: number) => (
            <React.Fragment key={group.value}>
              {index > 0 && <CommandSeparator className="my-1" />}
              <CommandGroup heading={group.value} items={group.items}>
                {(action: Action) => (
                  <CommandItem
                    key={action.value}
                    value={action}
                    disabled={action.locked}
                    onClick={() => setLastAction(action.label)}
                    className={
                      action.destructive
                        ? "text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-highlighted:*:[svg]:text-destructive"
                        : undefined
                    }
                  >
                    <action.icon aria-hidden="true" />
                    {action.label}
                    {action.locked ? (
                      <Badge variant="outline" className="ml-auto gap-1">
                        <LockIcon aria-hidden="true" />
                        Team
                      </Badge>
                    ) : (
                      action.shortcut && (
                        <CommandShortcut
                          className={
                            action.destructive
                              ? "text-destructive/70 group-data-highlighted/command-item:text-destructive"
                              : undefined
                          }
                        >
                          {action.shortcut}
                        </CommandShortcut>
                      )
                    )}
                  </CommandItem>
                )}
              </CommandGroup>
            </React.Fragment>
          )}
        </CommandList>
        <CommandEmpty>No action matches your search.</CommandEmpty>
      </Command>
      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        {lastAction
          ? `Ran “${lastAction}”.`
          : "Locked actions need the Team plan."}
      </p>
    </div>
  );
}
