"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from "lucide-react";

import { cn } from "cn";

import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const marks = [
  { value: "bold", label: "Bold", icon: Bold, className: "font-semibold" },
  { value: "italic", label: "Italic", icon: Italic, className: "italic" },
  {
    value: "underline",
    label: "Underline",
    icon: Underline,
    className: "underline underline-offset-4",
  },
  {
    value: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    className: "line-through",
  },
];

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeft, className: "text-left" },
  {
    value: "center",
    label: "Align center",
    icon: AlignCenter,
    className: "text-center",
  },
  {
    value: "right",
    label: "Align right",
    icon: AlignRight,
    className: "text-right",
  },
];

export default function Toolbar05() {
  const [active, setActive] = React.useState<string[]>(["bold"]);
  const [align, setAlign] = React.useState("left");

  const isDefault = active.length === 0 && align === "left";
  const alignment =
    alignments.find((item) => item.value === align) ?? alignments[0];
  const summary = [
    ...marks.filter((mark) => active.includes(mark.value)).map((m) => m.label),
    alignment.label.replace("Align ", "Aligned "),
  ].join(" · ");

  return (
    <div className="w-full max-w-md overflow-hidden rounded-lg border bg-card">
      <Toolbar
        aria-label="Text formatting"
        className="w-full flex-wrap rounded-none border-0 border-b bg-muted/40 shadow-none max-sm:gap-0.5"
      >
        <ToggleGroup
          multiple
          spacing={0.5}
          value={active}
          onValueChange={setActive}
          aria-label="Text style"
        >
          {marks.map((mark) => (
            <ToolbarButton
              key={mark.value}
              render={<Toggle />}
              value={mark.value}
              aria-label={mark.label}
              className="max-sm:h-7 max-sm:min-w-7 max-sm:px-1.5"
            >
              <mark.icon aria-hidden="true" />
            </ToolbarButton>
          ))}
        </ToggleGroup>
        <ToolbarSeparator />
        <ToggleGroup
          spacing={0.5}
          value={[align]}
          onValueChange={(next) => {
            if (next.length > 0) setAlign(next[next.length - 1]);
          }}
          aria-label="Alignment"
        >
          {alignments.map((item) => (
            <ToolbarButton
              key={item.value}
              render={<Toggle />}
              value={item.value}
              aria-label={item.label}
              className="max-sm:h-7 max-sm:min-w-7 max-sm:px-1.5"
            >
              <item.icon aria-hidden="true" />
            </ToolbarButton>
          ))}
        </ToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton
          aria-label="Clear formatting"
          className="max-sm:h-7 max-sm:min-w-7 max-sm:px-1.5"
          disabled={isDefault}
          onClick={() => {
            setActive([]);
            setAlign("left");
          }}
        >
          <RemoveFormatting aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
      <div className="flex flex-col gap-3 p-4">
        <p
          className={cn(
            "text-sm leading-relaxed",
            marks
              .filter((mark) => active.includes(mark.value))
              .map((mark) => mark.className),
            alignment.className,
          )}
        >
          Quarterly revenue grew 18% on the back of the new annual plans.
        </p>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {summary}
        </p>
      </div>
    </div>
  );
}
