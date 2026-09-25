"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  ClockIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  PinIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const details = [
  { icon: GitBranchIcon, label: "Branch", value: "feat/checkout-v2" },
  { icon: GitCommitHorizontalIcon, label: "Commit", value: "a41f9c2" },
  { icon: ClockIcon, label: "Build time", value: "1m 48s" },
];

export default function HoverCard06() {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const controlsRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <CircleCheckIcon
            className="size-4 shrink-0 text-success"
            aria-hidden="true"
          />
          <span className="min-w-0 text-muted-foreground">
            Preview deployed to{" "}
            <HoverCard
              open={open}
              onOpenChange={(next, event) => {
                // While pinned, pointer and focus movement can't close the
                // card. Escape and outside clicks still dismiss it.
                if (
                  !next &&
                  pinned &&
                  (event.reason === "trigger-hover" ||
                    event.reason === "trigger-focus")
                ) {
                  return;
                }
                // The pin switch and Close button below manage the card
                // themselves, so a press on them isn't an outside dismiss.
                if (
                  !next &&
                  event.reason === "outside-press" &&
                  event.event.target instanceof Node &&
                  controlsRef.current?.contains(event.event.target)
                ) {
                  return;
                }
                setOpen(next);
                if (!next) setPinned(false);
              }}
            >
              <HoverCardTrigger
                href="#deployment-dpl-7hq2"
                className="rounded-sm font-medium whitespace-nowrap text-foreground underline decoration-muted-foreground/60 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:decoration-foreground"
              >
                checkout-v2.acme.dev
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                className="flex w-72 flex-col gap-3 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">Deployment dpl_7Hq2</span>
                  {pinned && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <PinIcon className="size-3" aria-hidden="true" />
                      Pinned
                    </span>
                  )}
                </div>
                <dl className="flex flex-col gap-1.5">
                  {details.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <item.icon className="size-3.5" aria-hidden="true" />
                        {item.label}
                      </dt>
                      <dd className="truncate font-mono text-xs">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-muted-foreground">
                  Ready 4 minutes ago · triggered by Priya Raman
                </p>
              </HoverCardContent>
            </HoverCard>
          </span>
        </div>
      </div>
      <div
        ref={controlsRef}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Switch
            id="pin-deployment-preview"
            checked={pinned}
            onCheckedChange={(checked) => {
              setPinned(checked);
              setOpen(checked);
            }}
          />
          <Label htmlFor="pin-deployment-preview">Pin preview open</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!open}
          onClick={() => {
            setPinned(false);
            setOpen(false);
          }}
        >
          Close
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {open
          ? pinned
            ? "Preview is pinned. Press Escape or click outside to close it."
            : "Preview is open and follows the pointer."
          : "Preview is closed. Hover the link or pin it open."}
      </p>
    </div>
  );
}
