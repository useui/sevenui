"use client";

import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";

const densities = [
  { size: "sm", label: "Compact", hint: "28px, dense tables and sidebars" },
  { size: "default", label: "Default", hint: "32px, most toolbars" },
  { size: "lg", label: "Comfortable", hint: "36px, touch and primary editors" },
] as const;

const marks = [
  { value: "bold", label: "Bold", icon: BoldIcon },
  { value: "italic", label: "Italic", icon: ItalicIcon },
  { value: "underline", label: "Underline", icon: UnderlineIcon },
  { value: "strike", label: "Strikethrough", icon: StrikethroughIcon },
];

export default function Toggle01() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y rounded-xl border">
      {densities.map((density) => (
        <div
          key={density.size}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{density.label}</p>
            <p className="text-xs text-muted-foreground">
              {density.hint}
            </p>
          </div>
          <div
            role="toolbar"
            aria-label={`${density.label} text formatting`}
            className="flex shrink-0 items-center gap-0.5"
          >
            {marks.map((mark, index) => (
              <Toggle
                key={mark.value}
                size={density.size}
                aria-label={mark.label}
                defaultPressed={index === 0}
              >
                <mark.icon aria-hidden="true" />
              </Toggle>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
