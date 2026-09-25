"use client";

import { Info, KeyRound } from "lucide-react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

export default function Label02() {
  return (
    <TooltipProvider>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="label-02-key">
            <KeyRound
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            API secret key
          </Label>
          <Tooltip>
            <TooltipTrigger
              aria-label="Where to find your secret key"
              className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Info aria-hidden="true" className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top">
              Settings → Developers → API keys. Secret keys start with sk_live.
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="label-02-key"
          type="password"
          autoComplete="off"
          placeholder="sk_live_…"
          className="font-mono"
          aria-describedby="label-02-key-hint"
        />
        <p id="label-02-key-hint" className="text-xs text-muted-foreground">
          Stored encrypted. We only show the last four characters after saving.
        </p>
      </div>
    </TooltipProvider>
  );
}
