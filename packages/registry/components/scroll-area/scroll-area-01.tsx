"use client";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const groups = [
  {
    name: "Navigation",
    shortcuts: [
      { action: "Open command menu", keys: ["⌘", "K"] },
      { action: "Go to inbox", keys: ["G", "I"] },
      { action: "Go to projects", keys: ["G", "P"] },
      { action: "Search in current view", keys: ["/"] },
    ],
  },
  {
    name: "Issues",
    shortcuts: [
      { action: "Create issue", keys: ["C"] },
      { action: "Assign to me", keys: ["I"] },
      { action: "Change status", keys: ["S"] },
      { action: "Set priority", keys: ["P"] },
      { action: "Add label", keys: ["L"] },
    ],
  },
  {
    name: "Editing",
    shortcuts: [
      { action: "Bold", keys: ["⌘", "B"] },
      { action: "Insert link", keys: ["⌘", "K"] },
      { action: "Code block", keys: ["⌘", "⇧", "C"] },
      { action: "Submit comment", keys: ["⌘", "Enter"] },
    ],
  },
  {
    name: "View",
    shortcuts: [
      { action: "Toggle sidebar", keys: ["["] },
      { action: "Toggle dark mode", keys: ["⌘", "⇧", "L"] },
      { action: "Show this sheet", keys: ["?"] },
    ],
  },
];

export default function ScrollArea01() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 id="scroll-area-01-title" className="text-sm font-medium">
          Keyboard shortcuts
        </h3>
        <p className="text-sm text-muted-foreground">
          Press <Kbd>?</Kbd> anywhere to open this sheet.
        </p>
      </div>
      <ScrollArea
        role="region"
        aria-labelledby="scroll-area-01-title"
        className="h-72 rounded-lg border bg-background"
      >
        <div className="flex flex-col gap-5 p-4 pr-5">
          {groups.map((group) => (
            <section
              key={group.name}
              aria-labelledby={`scroll-area-01-${group.name.toLowerCase()}`}
              className="flex flex-col gap-2"
            >
              <h4
                id={`scroll-area-01-${group.name.toLowerCase()}`}
                className="text-xs font-medium text-muted-foreground"
              >
                {group.name}
              </h4>
              <dl className="flex flex-col gap-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <dt className="min-w-0 truncate">{shortcut.action}</dt>
                    <dd className="shrink-0">
                      <KbdGroup>
                        {shortcut.keys.map((key) => (
                          <Kbd key={key}>{key}</Kbd>
                        ))}
                      </KbdGroup>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
