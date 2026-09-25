"use client";

import { CheckIcon, SendIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

export default function Kbd07() {
  const [done, setDone] = React.useState<"saved" | "sent" | null>(null);

  // Clear the confirmation shortly after each click.
  React.useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setDone(null), 1600);
    return () => window.clearTimeout(id);
  }, [done]);

  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex flex-col gap-3 rounded-xl border bg-background p-4">
        <span className="text-xs font-medium text-muted-foreground">
          On background
        </span>
        <p className="text-sm">
          Press{" "}
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>{" "}
          to send the reply.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
        <span className="text-xs font-medium text-muted-foreground">
          On muted
        </span>
        <p className="text-sm">
          Press{" "}
          <KbdGroup>
            <Kbd className="bg-background shadow-xs">⌘</Kbd>
            <Kbd className="bg-background shadow-xs">Enter</Kbd>
          </KbdGroup>{" "}
          to send the reply.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
        <span className="text-xs font-medium text-primary-foreground/80">
          On primary
        </span>
        <p className="text-sm">
          Press{" "}
          <KbdGroup>
            <Kbd className="bg-primary-foreground/15 text-primary-foreground">
              ⌘
            </Kbd>
            <Kbd className="bg-primary-foreground/15 text-primary-foreground">
              Enter
            </Kbd>
          </KbdGroup>{" "}
          to send the reply.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <p aria-live="polite" className="sr-only">
          {done === "saved" ? "Draft saved" : done === "sent" ? "Reply sent" : ""}
        </p>
        <Button variant="outline" onClick={() => setDone("saved")}>
          {done === "saved" ? (
            <CheckIcon aria-hidden="true" data-icon="inline-start" />
          ) : null}
          {done === "saved" ? "Saved" : "Save draft"}
          <Kbd>⌘ S</Kbd>
        </Button>
        <Button onClick={() => setDone("sent")}>
          {done === "sent" ? (
            <CheckIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <SendIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {done === "sent" ? "Sent" : "Send reply"}
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">
            ⌘ ⏎
          </Kbd>
        </Button>
      </div>
    </div>
  );
}
