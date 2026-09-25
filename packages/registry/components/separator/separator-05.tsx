"use client";

import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";
import { Toggle } from "@/registry/base/ui/toggle";

const marks = [
  { value: "bold", label: "Bold", icon: Bold },
  { value: "italic", label: "Italic", icon: Italic },
  { value: "underline", label: "Underline", icon: Underline },
];

const lists = [
  { value: "bullets", label: "Bulleted list", icon: List },
  { value: "numbers", label: "Numbered list", icon: ListOrdered },
];

export default function Separator05() {
  // Every formatting change is a history entry, so Undo and Redo walk it.
  const [history, setHistory] = React.useState({
    entries: [["bold"]] as string[][],
    index: 0,
  });
  const active = history.entries[history.index];
  const canUndo = history.index > 0;
  const canRedo = history.index < history.entries.length - 1;

  const toggle = (value: string, pressed: boolean) =>
    setHistory(({ entries, index }) => {
      const current = entries[index];
      const next = pressed
        ? [...current, value]
        : current.filter((item) => item !== value);
      return { entries: [...entries.slice(0, index + 1), next], index: index + 1 };
    });

  const step = (delta: number) =>
    setHistory(({ entries, index }) => ({
      entries,
      index: Math.min(Math.max(index + delta, 0), entries.length - 1),
    }));

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <fieldset
        aria-label="Formatting"
        className="m-0 flex h-11 min-w-0 items-center gap-0.5 border-0 px-1.5"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => step(-1)}
        >
          <Undo2 aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => step(1)}
        >
          <Redo2 aria-hidden="true" />
        </Button>
        {/* Inset vertical separators: shorter than the bar, centered. */}
        <Separator
          orientation="vertical"
          className="mx-1 h-5 data-[orientation=vertical]:self-center"
        />
        {marks.map((mark) => (
          <Toggle
            key={mark.value}
            size="sm"
            className="px-1.5"
            aria-label={mark.label}
            pressed={active.includes(mark.value)}
            onPressedChange={(pressed) => toggle(mark.value, pressed)}
          >
            <mark.icon aria-hidden="true" />
          </Toggle>
        ))}
        <Separator
          orientation="vertical"
          className="mx-1 h-5 data-[orientation=vertical]:self-center"
        />
        {lists.map((list) => (
          <Toggle
            key={list.value}
            size="sm"
            className="px-1.5"
            aria-label={list.label}
            pressed={active.includes(list.value)}
            onPressedChange={(pressed) => toggle(list.value, pressed)}
          >
            <list.icon aria-hidden="true" />
          </Toggle>
        ))}
        {/* Full-height separator: splits the bar into two regions. */}
        <Separator
          orientation="vertical"
          className="mx-1 ml-auto h-11 data-[orientation=vertical]:self-center"
        />
        <Button variant="ghost" size="icon-sm" aria-label="Insert link">
          <Link2 aria-hidden="true" />
        </Button>
      </fieldset>
      <Separator />
      <p
        className={[
          "px-4 py-3 text-sm leading-relaxed text-muted-foreground",
          active.includes("bold") && "font-semibold",
          active.includes("italic") && "italic",
          active.includes("underline") && "underline underline-offset-4",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Release notes for 3.2 ship Thursday. Call out the new export presets and
        the faster sync on large workspaces.
      </p>
    </div>
  );
}
