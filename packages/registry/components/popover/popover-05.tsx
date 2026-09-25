"use client";

import {
  ChevronsUpDownIcon,
  CloudIcon,
  FolderKanbanIcon,
  InboxIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const quota = 100;

const usage = [
  { label: "Design files", size: 38.2, color: "bg-chart-1" },
  { label: "Screen recordings", size: 17.9, color: "bg-chart-2" },
  { label: "Exports", size: 6.4, color: "bg-chart-3" },
];

const navigation = [
  { label: "Inbox", icon: InboxIcon },
  { label: "Projects", icon: FolderKanbanIcon },
  { label: "Members", icon: UsersIcon },
];

const used = usage.reduce((sum, item) => sum + item.size, 0);
const percent = Math.round((used / quota) * 100);

function formatSize(value: number) {
  return `${value.toFixed(1)} GB`;
}

export default function Popover05() {
  return (
    <nav
      aria-label="Workspace"
      className="flex w-full max-w-60 flex-col gap-6 rounded-lg border border-border bg-sidebar p-2 text-sidebar-foreground"
    >
      <ul className="flex flex-col gap-0.5">
        {navigation.map((item) => (
          <li key={item.label}>
            <a
              href={`#${item.label.toLowerCase()}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <item.icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="h-auto w-full flex-col items-stretch gap-2 px-2 py-2 font-normal hover:bg-sidebar-accent"
            />
          }
        >
          <span className="flex items-center gap-2 text-sm">
            <CloudIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="flex-1 text-left">Storage</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {percent}%
            </span>
            <ChevronsUpDownIcon
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
          <span
            className="block h-1.5 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </span>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="end"
          sideOffset={8}
          className="w-72 max-w-[calc(100vw-2rem)] gap-4 p-4"
        >
          <PopoverHeader>
            <PopoverTitle>
              {formatSize(used)} of {quota} GB used
            </PopoverTitle>
            <PopoverDescription>
              Shared by 12 members across the Lumen Studio workspace.
            </PopoverDescription>
          </PopoverHeader>
          <div
            role="img"
            aria-label={`${formatSize(used)} of ${quota} GB used`}
            className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
          >
            {usage.map((item) => (
              <span
                key={item.label}
                className={cn("h-full", item.color)}
                style={{ width: `${(item.size / quota) * 100}%` }}
              />
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {usage.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <span
                  className={cn("size-2 shrink-0 rounded-full", item.color)}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatSize(item.size)}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm">
              <span
                className="size-2 shrink-0 rounded-full bg-muted ring-1 ring-border"
                aria-hidden="true"
              />
              <span className="flex-1 text-muted-foreground">Available</span>
              <span className="text-muted-foreground tabular-nums">
                {formatSize(quota - used)}
              </span>
            </li>
          </ul>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Review large files
            </Button>
            <Button size="sm" className="flex-1">
              Upgrade to 1 TB
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  );
}
