"use client";

import * as React from "react";
import { Check, Copy, Lock } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const workspaceUrl = "https://northwind.sevenui.app";

export default function Input06() {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(workspaceUrl);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the field stays selectable instead.
      document.getElementById("input-06-url")?.focus();
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="input-06-url">Workspace URL</Label>
        <div className="flex gap-2">
          <Input
            id="input-06-url"
            readOnly
            value={workspaceUrl}
            aria-describedby="input-06-url-hint"
            onFocus={(event) => event.currentTarget.select()}
            className="bg-muted/50 font-mono text-muted-foreground dark:bg-muted/50"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={copied ? "Copied" : "Copy workspace URL"}
            onClick={handleCopy}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </Button>
        </div>
        <p id="input-06-url-hint" className="text-xs text-muted-foreground">
          Teammates with an invite can sign in here. Contact support to change it.
        </p>
        <span className="sr-only" aria-live="polite">
          {copied ? "Workspace URL copied to clipboard" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="input-06-email">Billing email</Label>
        <div className="relative">
          <Input
            id="input-06-email"
            type="email"
            disabled
            defaultValue="finance@northwind.com"
            aria-describedby="input-06-email-hint"
            className="pr-8"
          />
          <Lock
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <p id="input-06-email-hint" className="text-xs text-muted-foreground">
          Managed by your company's single sign-on. Ask a workspace owner to change it.
        </p>
      </div>
    </div>
  );
}
