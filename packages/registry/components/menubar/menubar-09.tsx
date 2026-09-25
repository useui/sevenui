"use client";

import * as React from "react";
import { CircleCheck, CircleDot } from "lucide-react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";
import { Textarea } from "@/registry/base/ui/textarea";

const initialNotes = `## v2.4.0

- Faster CSV exports for workspaces over 10,000 rows.
- Fixed a timezone bug in scheduled reports.`;

const snippets = [
  { label: "Version heading", text: "\n\n## v2.4.1\n" },
  { label: "Fixed entry", text: "\n- Fixed " },
  { label: "Breaking change", text: "\n\n> Breaking: " },
];

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

export default function Menubar09() {
  const [notes, setNotes] = React.useState(initialNotes);
  const [savedNotes, setSavedNotes] = React.useState(initialNotes);
  const [wrap, setWrap] = React.useState(true);
  const [showCount, setShowCount] = React.useState(true);

  const dirty = notes !== savedNotes;
  const words = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2 py-1.5">
        <Menubar
          aria-label="Release notes editor"
          className="border-none bg-transparent p-0"
        >
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                disabled={!dirty}
                onClick={() => setSavedNotes(notes)}
              >
                Save draft
                <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                disabled={!dirty}
                onClick={() => setNotes(savedNotes)}
              >
                Revert to saved
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                variant="destructive"
                onClick={() => setNotes("")}
              >
                Clear all notes
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Insert</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>Snippets</MenubarLabel>
                {snippets.map((snippet) => (
                  <MenubarItem
                    key={snippet.label}
                    onClick={() => setNotes((value) => value + snippet.text)}
                  >
                    {snippet.label}
                  </MenubarItem>
                ))}
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem
                checked={wrap}
                onCheckedChange={(checked) => setWrap(checked)}
              >
                Wrap long lines
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={showCount}
                onCheckedChange={(checked) => setShowCount(checked)}
              >
                Word count
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <span className="truncate text-xs text-muted-foreground">
          release-notes.md
        </span>
      </div>
      <label htmlFor="menubar-09-notes" className="sr-only">
        Release notes
      </label>
      <Textarea
        id="menubar-09-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        wrap={wrap ? "soft" : "off"}
        className="min-h-44 resize-none rounded-none border-0 font-mono text-[13px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="flex items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5" aria-live="polite">
          {dirty ? (
            <>
              <CircleDot className="size-3.5 text-warning" aria-hidden="true" />
              Unsaved changes
            </>
          ) : (
            <>
              <CircleCheck
                className="size-3.5 text-success"
                aria-hidden="true"
              />
              Draft saved
            </>
          )}
        </span>
        {showCount ? (
          <span className="tabular-nums">
            {words} {words === 1 ? "word" : "words"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
