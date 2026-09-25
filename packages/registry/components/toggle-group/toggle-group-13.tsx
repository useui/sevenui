"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Manager = "pnpm" | "npm" | "yarn" | "bun";

const commands: Record<Manager, string> = {
  pnpm: "pnpm dlx shadcn@latest add @sevenui/toggle-group",
  npm: "npx shadcn@latest add @sevenui/toggle-group",
  yarn: "yarn dlx shadcn@latest add @sevenui/toggle-group",
  bun: "bunx --bun shadcn@latest add @sevenui/toggle-group",
};

export default function ToggleGroup13() {
  const [manager, setManager] = React.useState<Manager>("pnpm");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands[manager]);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-2 py-1.5">
        <ToggleGroup
          aria-label="Package manager"
          size="sm"
          spacing={0}
          value={[manager]}
          onValueChange={(next) => {
            if (next[0]) {
              setManager(next[0] as Manager);
              setCopied(false);
            }
          }}
        >
          {(Object.keys(commands) as Manager[]).map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="rounded-md! px-2 font-mono text-xs text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
            >
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy command"}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </Button>
      </div>
      <div className="flex items-start gap-2 overflow-x-auto px-4 py-3.5">
        <Terminal
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <code className="font-mono text-sm whitespace-nowrap">
          {commands[manager]}
        </code>
      </div>
      <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        Adds the component source to <code className="font-mono">components/ui</code>.
      </figcaption>
      <span aria-live="polite" className="sr-only">
        {copied ? "Command copied to clipboard" : ""}
      </span>
    </figure>
  );
}
