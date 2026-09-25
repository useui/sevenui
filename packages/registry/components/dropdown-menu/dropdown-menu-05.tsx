"use client";

import { FileText, Kanban, Plus, Presentation, Table2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const TEMPLATES = [
  {
    title: "Document",
    description: "Specs, briefs and meeting notes",
    icon: FileText,
  },
  {
    title: "Spreadsheet",
    description: "Budgets, trackers and raw data",
    icon: Table2,
  },
  {
    title: "Presentation",
    description: "Reviews and all-hands decks",
    icon: Presentation,
  },
  {
    title: "Project board",
    description: "Plan work across columns",
    icon: Kanban,
  },
];

export default function DropdownMenu05() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <Plus aria-hidden="true" data-icon="inline-start" />
            New file
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-72 max-w-[calc(100vw-2rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Start from a blank</DropdownMenuLabel>
          {TEMPLATES.map(({ title, description, icon: Icon }) => (
            <DropdownMenuItem key={title} label={title} className="items-start gap-3 py-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground group-focus/dropdown-menu-item:border-transparent group-focus/dropdown-menu-item:bg-background">
                <Icon aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium">{title}</span>
                <span className="truncate text-xs text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground/80">
                  {description}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground">
          Browse 48 team templates
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
