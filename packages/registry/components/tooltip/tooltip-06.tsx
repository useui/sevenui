"use client";

import * as React from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const apiKey = "ak_live_51Hq8v2LmT9xQpR4wZ7nB3cK";

function maskKey(key: string) {
  return `${key.slice(0, 8)}${"•".repeat(12)}${key.slice(-4)}`;
}

export default function Tooltip06() {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(apiKey);
    } catch {
      // Clipboard can be blocked in sandboxed previews; still confirm the intent.
    }
    setCopied(true);
    setOpen(true);
    if (resetRef.current) clearTimeout(resetRef.current);
    resetRef.current = setTimeout(() => {
      setOpen(false);
      setCopied(false);
    }, 1600);
  }

  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-2">
        <p className="text-sm font-medium" id="tooltip-06-label">
          Production secret key
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 py-1 pr-1 pl-3">
          <code className="min-w-0 flex-1 truncate font-mono text-xs tabular-nums">
            {revealed ? apiKey : maskKey(apiKey)}
          </code>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={revealed ? "Hide key" : "Reveal key"}
                  onClick={() => setRevealed((value) => !value)}
                >
                  {revealed ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </Button>
              }
            />
            <TooltipContent>
              {revealed ? "Hide key" : "Reveal key"}
            </TooltipContent>
          </Tooltip>

          {/* Controlled: the tooltip stays open after a click to confirm the
              copy, even though clicking would normally dismiss it. */}
          <Tooltip
            open={open}
            onOpenChange={(next) => {
              if (!copied) setOpen(next);
            }}
          >
            <TooltipTrigger
              closeOnClick={false}
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy key"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check aria-hidden="true" className="text-success" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                </Button>
              }
            />
            <TooltipContent className="flex items-center gap-1.5">
              {copied ? (
                <>
                  <Check aria-hidden="true" className="size-3.5" />
                  Copied to clipboard
                </>
              ) : (
                "Copy key"
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {copied
            ? "Key copied. Store it somewhere safe."
            : "Rotate this key if it was ever shared in plain text."}
        </p>
      </div>
    </TooltipProvider>
  );
}
