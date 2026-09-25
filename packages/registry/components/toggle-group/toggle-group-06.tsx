"use client";

import * as React from "react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { cn } from "cn";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Separator } from "@/registry/base/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const marks = [
  { value: "bold", label: "Bold", key: "B", icon: BoldIcon },
  { value: "italic", label: "Italic", key: "I", icon: ItalicIcon },
  { value: "underline", label: "Underline", key: "U", icon: UnderlineIcon },
  {
    value: "strike",
    label: "Strikethrough",
    key: "X",
    shift: true,
    icon: StrikethroughIcon,
  },
];

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
];

const alignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function ToggleGroup06() {
  const [formats, setFormats] = React.useState<string[]>(["bold"]);
  const [align, setAlign] = React.useState("left");

  function toggleFormat(value: string) {
    setFormats((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const mark = marks.find(
      (item) =>
        item.key.toLowerCase() === event.key.toLowerCase() &&
        Boolean(item.shift) === event.shiftKey,
    );
    if (!mark) return;
    event.preventDefault();
    toggleFormat(mark.value);
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs">
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5"
        >
          <ToggleGroup
            aria-label="Text style"
            multiple
            size="sm"
            spacing={0.5}
            value={formats}
            onValueChange={setFormats}
          >
            {marks.map((mark) => (
              <Tooltip key={mark.value}>
                <TooltipTrigger
                  render={
                    <ToggleGroupItem
                      value={mark.value}
                      aria-label={mark.label}
                      className="max-sm:px-2"
                    >
                      <mark.icon aria-hidden="true" />
                    </ToggleGroupItem>
                  }
                />
                <TooltipContent>
                  {mark.label}{" "}
                  <KbdGroup>
                    <Kbd>Ctrl</Kbd>
                    {mark.shift && <Kbd>Shift</Kbd>}
                    <Kbd>{mark.key}</Kbd>
                  </KbdGroup>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
          <Separator orientation="vertical" className="mx-1 my-1" />
          <ToggleGroup
            aria-label="Text alignment"
            size="sm"
            spacing={0.5}
            value={[align]}
            onValueChange={(next) => {
              if (next.length > 0) setAlign(next[0]);
            }}
          >
            {alignments.map((item) => (
              <Tooltip key={item.value}>
                <TooltipTrigger
                  render={
                    <ToggleGroupItem
                      value={item.value}
                      aria-label={item.label}
                      className="max-sm:px-2"
                    >
                      <item.icon aria-hidden="true" />
                    </ToggleGroupItem>
                  }
                />
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </div>
        <label htmlFor="release-note" className="sr-only">
          Release note
        </label>
        <textarea
          id="release-note"
          rows={4}
          onKeyDown={handleKeyDown}
          defaultValue="Dark mode now follows your system setting. Toggle it anytime from Settings, then Appearance."
          className={cn(
            "block w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:bg-muted/20",
            alignClass[align],
            formats.includes("bold") && "font-semibold",
            formats.includes("italic") && "italic",
            formats.includes("underline") && "underline underline-offset-4",
            formats.includes("strike") && "line-through",
            formats.includes("underline") &&
              formats.includes("strike") &&
              "[text-decoration-line:underline_line-through]",
          )}
        />
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Press <Kbd>Ctrl</Kbd> + <Kbd>B</Kbd>, <Kbd>I</Kbd>, or <Kbd>U</Kbd>{" "}
          while typing to toggle styles.
        </p>
      </div>
    </TooltipProvider>
  );
}
