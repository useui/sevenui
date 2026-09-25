"use client";

import type * as React from "react";

import {
  CodeIcon,
  Heading2Icon,
  ImageIcon,
  ListChecksIcon,
  QuoteIcon,
  TableIcon,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Block = {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Group = { value: string; items: Block[] };

const groups: Group[] = [
  {
    value: "Text",
    items: [
      {
        value: "heading",
        label: "Heading",
        description: "Section title for longer pages.",
        icon: Heading2Icon,
      },
      {
        value: "checklist",
        label: "Checklist",
        description: "Track tasks with checkboxes.",
        icon: ListChecksIcon,
      },
      {
        value: "quote",
        label: "Quote",
        description: "Call out a customer or source.",
        icon: QuoteIcon,
      },
    ],
  },
  {
    value: "Media & data",
    items: [
      {
        value: "image",
        label: "Image",
        description: "Upload or embed a picture.",
        icon: ImageIcon,
      },
      {
        value: "table",
        label: "Table",
        description: "Rows and columns of structured data.",
        icon: TableIcon,
      },
      {
        value: "code",
        label: "Code block",
        description: "Syntax-highlighted snippet.",
        icon: CodeIcon,
      },
    ],
  },
];

export default function Command02() {
  return (
    <Command
      items={groups}
      className="w-full max-w-sm border border-border shadow-md"
    >
      <CommandInput placeholder="Insert a block..." aria-label="Search blocks" />
      <CommandList className="max-h-80">
        {(group: Group) => (
          <CommandGroup key={group.value} heading={group.value} items={group.items}>
            {(block: Block) => (
              <CommandItem key={block.value} value={block} className="gap-3 py-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground group-data-highlighted/command-item:text-foreground">
                  <block.icon aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">{block.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {block.description}
                  </span>
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty>No block type matches your search.</CommandEmpty>
    </Command>
  );
}
