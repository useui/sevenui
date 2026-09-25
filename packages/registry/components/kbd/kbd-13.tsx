"use client";

import { Keyboard, Search } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Platform = "mac" | "windows";
// "mod" resolves to ⌘ on macOS and Ctrl elsewhere.
type Shortcut = { label: string; keys: string[] };

const groups: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: "General",
    shortcuts: [
      { label: "Quick open", keys: ["mod", "P"] },
      { label: "Show keyboard shortcuts", keys: ["?"] },
      { label: "Open settings", keys: ["mod", ","] },
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      { label: "Bold", keys: ["mod", "B"] },
      { label: "Insert link", keys: ["mod", "K"] },
      { label: "Strikethrough", keys: ["mod", "shift", "X"] },
      { label: "Undo", keys: ["mod", "Z"] },
      { label: "Redo", keys: ["mod", "shift", "Z"] },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { label: "Go to inbox", keys: ["G", "I"] },
      { label: "Go to projects", keys: ["G", "P"] },
      { label: "Toggle sidebar", keys: ["mod", "\\"] },
      { label: "Previous page", keys: ["alt", "←"] },
    ],
  },
];

const symbols: Record<Platform, Record<string, string>> = {
  mac: { mod: "⌘", shift: "⇧", alt: "⌥" },
  windows: { mod: "Ctrl", shift: "Shift", alt: "Alt" },
};

const spoken: Record<string, string> = {
  mod: "Command",
  shift: "Shift",
  alt: "Option",
};

const isSequence = (keys: string[]) =>
  keys.length === 2 && keys.every((k) => /^[A-Z]$/.test(k));

function ShortcutKeys({
  keys,
  platform,
}: {
  keys: string[];
  platform: Platform;
}) {
  const labels = keys.map((k) => symbols[platform][k] ?? k);
  const readable = keys
    .map((k) =>
      platform === "mac" ? (spoken[k] ?? k) : (symbols.windows[k] ?? k),
    )
    .join(isSequence(keys) ? " then " : " plus ");
  return (
    <span className="shrink-0">
      <span className="sr-only">{readable}</span>
      <KbdGroup aria-hidden="true">
        {labels.map((label, i) => (
          <React.Fragment key={label}>
            {isSequence(keys) && i > 0 && (
              <span
                aria-hidden="true"
                className="text-xs text-muted-foreground"
              >
                then
              </span>
            )}
            <Kbd>{label}</Kbd>
          </React.Fragment>
        ))}
      </KbdGroup>
    </span>
  );
}

export default function Kbd13() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform>("windows");

  React.useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setPlatform("mac");
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter(
        (s) =>
          !q ||
          s.label.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.shortcuts.length > 0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <div className="w-full max-w-md">
      {/* The editor surface listens for "?" the way most apps do. */}
      <section
        aria-label="Document editor. Press question mark for keyboard shortcuts."
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the editor region owns its "?" shortcut
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "?") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="rounded-xl border bg-card text-card-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="space-y-2 px-5 pt-5 pb-6">
          <p className="text-lg font-semibold">Launch checklist</p>
          <p className="text-sm text-muted-foreground">
            Final QA pass on the pricing page, then hand off the release notes
            to support before Thursday.
          </p>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t px-3 py-2">
          <span className="truncate pl-2 text-xs text-muted-foreground">
            Saved · 2 min ago
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            aria-keyshortcuts="?"
          >
            <Keyboard aria-hidden="true" data-icon="inline-start" />
            Shortcuts
            <Kbd>?</Kbd>
          </Button>
        </footer>
      </section>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[min(36rem,85vh)] flex-col gap-0 p-0 sm:max-w-md">
          <DialogHeader className="gap-1 px-5 pt-5 pb-3">
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Work faster without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 border-b px-5 pb-3">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search shortcuts"
                placeholder="Search shortcuts"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              aria-label="Keyboard layout"
              value={[platform]}
              onValueChange={(value) => {
                if (value[0]) setPlatform(value[0] as Platform);
              }}
            >
              <ToggleGroupItem value="mac" aria-label="macOS keys">
                Mac
              </ToggleGroupItem>
              <ToggleGroupItem value="windows" aria-label="Windows keys">
                Win
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium">No shortcuts found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nothing matches “{query}”. Try “bold” or “go to”.
                </p>
              </div>
            ) : (
              filtered.map((group) => (
                <section
                  key={group.title}
                  aria-labelledby={`kbd-13-${group.title}`}
                  className="py-2"
                >
                  <h4
                    id={`kbd-13-${group.title}`}
                    className="pb-1 text-xs font-medium text-muted-foreground"
                  >
                    {group.title}
                  </h4>
                  <ul className="divide-y">
                    {group.shortcuts.map((shortcut) => (
                      <li
                        key={shortcut.label}
                        className="flex items-center justify-between gap-4 py-2 text-sm"
                      >
                        <span className="min-w-0">{shortcut.label}</span>
                        <ShortcutKeys
                          keys={shortcut.keys}
                          platform={platform}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>

          <p className="border-t bg-muted/40 px-5 py-2.5 text-xs text-muted-foreground">
            Press <Kbd>Esc</Kbd> to close
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
