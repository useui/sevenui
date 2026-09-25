"use client";

import {
  AtSignIcon,
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
} from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Textarea } from "@/registry/base/ui/textarea";

const tools = [
  { key: "bold", label: "Bold", icon: BoldIcon },
  { key: "italic", label: "Italic", icon: ItalicIcon },
  { key: "link", label: "Insert link", icon: LinkIcon },
  { key: "list", label: "Bulleted list", icon: ListIcon },
  { key: "mention", label: "Mention a teammate", icon: AtSignIcon },
] as const;

type ToolKey = (typeof tools)[number]["key"];

// Markdown each tool writes around (or in place of) the current selection.
function format(tool: ToolKey, selected: string) {
  switch (tool) {
    case "bold":
      return { before: "**", text: selected || "bold text", after: "**" };
    case "italic":
      return { before: "_", text: selected || "italic text", after: "_" };
    case "link":
      return { before: "[", text: selected || "link text", after: "](https://)" };
    case "list":
      return { before: "- ", text: selected || "list item", after: "" };
    case "mention":
      return { before: "@", text: selected || "priya", after: " " };
  }
}

export default function Textarea08() {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const expanded = focused || value.length > 0;

  function applyTool(tool: ToolKey) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const { before, text, after } = format(tool, value.slice(start, end));
    // Lists start on their own line.
    const prefix =
      tool === "list" && start > 0 && value[start - 1] !== "\n" ? "\n" : "";
    const inserted = prefix + before + text + after;
    setValue(value.slice(0, start) + inserted + value.slice(end));
    const selectionStart = start + prefix.length + before.length;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(selectionStart, selectionStart + text.length);
    });
  }

  function saveNote() {
    const note = value.trim();
    if (!note) return;
    setNotes((current) => [note, ...current]);
    setValue("");
    textareaRef.current?.focus();
  }

  return (
    <div className="flex w-full min-w-0 max-w-md flex-col gap-3">
      <fieldset
        aria-label="Deal note composer"
        data-expanded={expanded || undefined}
        className="group/composer w-full min-w-0 max-w-md rounded-xl border border-input bg-card shadow-xs transition-[border-color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-expanded:shadow-md"
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
          }
        }}
      >
        <label htmlFor={`${id}-note`} className="sr-only">
          Add a note to this deal
        </label>
        <Textarea
          ref={textareaRef}
          id={`${id}-note`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add a note to Acme Corp renewal..."
          className="min-h-10 resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 shadow-none transition-[min-height] duration-300 ease-out group-data-expanded/composer:min-h-28 focus-visible:ring-0 motion-reduce:transition-none dark:bg-transparent"
        />
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-data-expanded/composer:grid-rows-[1fr] motion-reduce:transition-none">
          <div className="overflow-hidden">
            <div
              inert={!expanded}
              className="flex items-center justify-between gap-2 border-t border-border px-2 py-2 opacity-0 transition-opacity duration-200 group-data-expanded/composer:opacity-100"
            >
              <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5">
                {tools.map((tool) => (
                  <Button
                    key={tool.key}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tool.label}
                    onClick={() => applyTool(tool.key)}
                    className="text-muted-foreground"
                  >
                    <tool.icon aria-hidden="true" />
                  </Button>
                ))}
              </div>
              <Button size="sm" disabled={!value.trim()} onClick={saveNote}>
                Save note
              </Button>
            </div>
          </div>
        </div>
      </fieldset>
      {notes.length > 0 ? (
        <ul aria-label="Saved notes" aria-live="polite" className="flex flex-col gap-2">
          {notes.map((note, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: notes are append-only
              key={notes.length - index}
              className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm break-words whitespace-pre-wrap"
            >
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
