"use client";

import { Check, Copy, Link2 } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const installCommand = "npx shadcn add @sevenui/button";
const shareLink = "https://northwind.studio/r/q3-roadmap";

function useCopy(resetAfter = 2000) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = React.useCallback(
    (text: string) => {
      navigator.clipboard?.writeText(text).catch(() => {});
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
    },
    [resetAfter],
  );

  return { copied, copy };
}

function MorphIcon({ copied, idle }: { copied: boolean; idle: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="relative inline-flex size-4">
      <span
        className={cn(
          "absolute inset-0 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none",
          copied ? "scale-50 opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0",
        )}
      >
        {idle}
      </span>
      <span
        className={cn(
          "absolute inset-0 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none",
          copied ? "scale-100 opacity-100 blur-0" : "scale-50 opacity-0 blur-[2px]",
        )}
      >
        <Check className="size-4" />
      </span>
    </span>
  );
}

export default function Button08() {
  const command = useCopy();
  const link = useCopy();

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 py-1 pr-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-xs">{installCommand}</code>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={command.copied ? "Copied" : "Copy install command"}
                onClick={() => command.copy(installCommand)}
              />
            }
          >
            <MorphIcon copied={command.copied} idle={<Copy className="size-4" />} />
          </TooltipTrigger>
          <TooltipContent>{command.copied ? "Copied" : "Copy to clipboard"}</TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => link.copy(shareLink)}
      >
        <MorphIcon copied={link.copied} idle={<Link2 className="size-4" />} />
        <span className="grid">
          <span
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-200",
              link.copied && "opacity-0",
            )}
          >
            Copy share link
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-200",
              !link.copied && "opacity-0",
            )}
          >
            Link copied
          </span>
        </span>
      </Button>
      <p aria-live="polite" className="sr-only">
        {command.copied ? "Install command copied to clipboard." : ""}
        {link.copied ? "Share link copied to clipboard." : ""}
      </p>
    </div>
  );
}
