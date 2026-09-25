"use client";

import { FileSearch } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

type Action = "search" | "save" | "publish";

const messages: Record<Action, string> = {
  search: "Opened the file switcher.",
  save: "Draft saved to your workspace.",
  publish: "Release notes published to the changelog.",
};

export default function Button04() {
  const [last, setLast] = React.useState<Action | null>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      const action: Action | null =
        key === "p" ? "search" : key === "s" ? "save" : key === "enter" ? "publish" : null;
      if (!action) return;
      event.preventDefault();
      setLast(action);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Button
        variant="outline"
        size="lg"
        className="w-full justify-between font-normal text-muted-foreground"
        aria-keyshortcuts="Meta+P Control+P"
        onClick={() => setLast("search")}
      >
        <span className="flex items-center gap-2">
          <FileSearch aria-hidden="true" />
          Go to file
        </span>
        <KbdGroup aria-hidden="true">
          <Kbd>⌘</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </Button>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="secondary"
          aria-keyshortcuts="Meta+S Control+S"
          onClick={() => setLast("save")}
        >
          Save draft
          <KbdGroup aria-hidden="true">
            <Kbd className="bg-background/70">⌘</Kbd>
            <Kbd className="bg-background/70">S</Kbd>
          </KbdGroup>
        </Button>
        <Button
          aria-keyshortcuts="Meta+Enter Control+Enter"
          onClick={() => setLast("publish")}
        >
          Publish
          <KbdGroup aria-hidden="true">
            <Kbd className="bg-primary-foreground/15 text-primary-foreground">⌘</Kbd>
            <Kbd className="bg-primary-foreground/15 text-primary-foreground">↵</Kbd>
          </KbdGroup>
        </Button>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
        {last ? messages[last] : "Try the shortcuts, or click a button."}
      </p>
    </div>
  );
}
