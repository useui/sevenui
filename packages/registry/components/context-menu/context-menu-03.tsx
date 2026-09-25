"use client";

import { SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

const labels = [
  { value: "research", name: "Research", swatch: "bg-chart-1" },
  { value: "design", name: "Design", swatch: "bg-chart-2" },
  { value: "engineering", name: "Engineering", swatch: "bg-chart-3" },
  { value: "marketing", name: "Marketing", swatch: "bg-chart-4" },
  { value: "ops", name: "Operations", swatch: "bg-chart-5" },
];

const priorities = [
  { value: "high", name: "High", icon: SignalHigh },
  { value: "medium", name: "Medium", icon: SignalMedium },
  { value: "low", name: "Low", icon: SignalLow },
];

export default function ContextMenu03() {
  const [label, setLabel] = React.useState("design");
  const [priority, setPriority] = React.useState("medium");

  const currentLabel = labels.find((item) => item.value === label) ?? labels[0];
  const currentPriority =
    priorities.find((item) => item.value === priority) ?? priorities[1];
  const PriorityIcon = currentPriority.icon;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onKeyDown={openMenuWithShiftF10}
        tabIndex={0}
        aria-label="Task card. Right-click or press Shift+F10 to change label and priority."
        className="flex w-full max-w-xs flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-medium">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${currentLabel.swatch}`}
            />
            {currentLabel.name}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <PriorityIcon aria-hidden="true" className="size-3.5" />
            {currentPriority.name}
          </span>
        </div>
        <p className="text-sm leading-snug font-medium">
          Audit onboarding emails for the Q4 pricing change
        </p>
        <p className="text-xs text-muted-foreground">
          Right-click to relabel · Due Oct 14
        </p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuRadioGroup value={label} onValueChange={setLabel}>
          <ContextMenuLabel>Label</ContextMenuLabel>
          {labels.map((item) => (
            <ContextMenuRadioItem key={item.value} value={item.value}>
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full ring-2 ring-background ${item.swatch}`}
              />
              {item.name}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={priority} onValueChange={setPriority}>
          <ContextMenuLabel>Priority</ContextMenuLabel>
          {priorities.map(({ value, name, icon: Icon }) => (
            <ContextMenuRadioItem key={value} value={value}>
              <Icon aria-hidden="true" className="text-muted-foreground" />
              {name}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
