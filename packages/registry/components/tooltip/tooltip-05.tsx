"use client";

import { CircleAlert, Lock } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const missing = ["Add a cover image", "Write a meta description"];

export default function Tooltip05() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-5 rounded-xl border border-border bg-card p-5 text-card-foreground">
        <div className="grid gap-2">
          <Label htmlFor="tooltip-05-url">Workspace URL</Label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>sevenui.app/</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="tooltip-05-url"
              defaultValue="northwind"
              readOnly
              aria-describedby="tooltip-05-url-hint"
              className="text-muted-foreground"
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger
                  aria-label="Why is this locked?"
                  className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Lock aria-hidden="true" className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent side="top" align="end">
                  Only workspace owners can change the URL.
                </TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          <p id="tooltip-05-url-hint" className="sr-only">
            Read-only. Only workspace owners can change the URL.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Draft saved · 2 checks left
          </p>
          <Tooltip>
            {/* focusableWhenDisabled keeps hover and focus events alive, so
                the tooltip can explain why the action is unavailable. */}
            <TooltipTrigger
              render={
                <Button
                  disabled
                  focusableWhenDisabled
                  aria-describedby="tooltip-05-publish-hint"
                  className="data-disabled:cursor-not-allowed data-disabled:opacity-50"
                >
                  Publish post
                </Button>
              }
            />
            <TooltipContent
              side="top"
              align="end"
              className="grid gap-1.5 px-3 py-2 text-left"
            >
              <span className="font-medium">
                Finish these before publishing
              </span>
              <ul className="grid gap-1">
                {missing.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CircleAlert
                      aria-hidden="true"
                      className="size-3 shrink-0 opacity-70"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
          <p id="tooltip-05-publish-hint" className="sr-only">
            Unavailable. {missing.join(". ")}.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
