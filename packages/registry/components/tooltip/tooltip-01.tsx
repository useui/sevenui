"use client";

import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Separator } from "@/registry/base/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const groups = [
  [
    { icon: Bold, label: "Bold", keys: ["⌘", "B"] },
    { icon: Italic, label: "Italic", keys: ["⌘", "I"] },
    { icon: Strikethrough, label: "Strikethrough", keys: ["⌘", "⇧", "X"] },
    { icon: Code, label: "Inline code", keys: ["⌘", "E"] },
  ],
  [
    { icon: List, label: "Bulleted list", keys: ["⌘", "⇧", "8"] },
    { icon: ListOrdered, label: "Numbered list", keys: ["⌘", "⇧", "7"] },
    { icon: Link2, label: "Insert link", keys: ["⌘", "K"] },
  ],
];

export default function Tooltip01() {
  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex w-full max-w-fit flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-xs"
      >
        {groups.map((group, index) => (
          <div key={group[0].label} className="flex items-center gap-1">
            {index > 0 && (
              <Separator orientation="vertical" className="mx-0.5 h-5" />
            )}
            {group.map((action) => (
              <Tooltip key={action.label}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={action.label}
                    >
                      <action.icon aria-hidden="true" />
                    </Button>
                  }
                />
                <TooltipContent className="flex items-center gap-2 py-1 pr-1">
                  {action.label}
                  <KbdGroup>
                    {action.keys.map((key) => (
                      <Kbd
                        key={key}
                        className="bg-primary-foreground/15 text-primary-foreground"
                      >
                        {key}
                      </Kbd>
                    ))}
                  </KbdGroup>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
