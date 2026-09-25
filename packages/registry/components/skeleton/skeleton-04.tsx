"use client";

import { cn } from "cn";
import { CreditCardIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";

// Inline skeletons stand in for single values inside otherwise-ready copy.
// Widths are in `ch` so each bone matches the length of the value it replaces.
function Value({
  width,
  label,
  className,
}: {
  width: string;
  label: string;
  className?: string;
}) {
  return (
    <Skeleton
      role="img"
      aria-label={label}
      className={cn(
        "inline-block h-[1em] translate-y-[0.15em] rounded-sm align-baseline",
        className,
      )}
      style={{ width }}
    />
  );
}

export default function Skeleton04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Team plan</h3>
          <div className="text-sm text-muted-foreground">
            <span className="whitespace-nowrap">
              Renews on <Value width="9ch" label="Loading renewal date" />
            </span>{" "}
            <span className="whitespace-nowrap">
              for <Value width="6ch" label="Loading renewal amount" />
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Skeleton aria-hidden="true" className="h-2 w-2 rounded-full" />
          <Skeleton
            role="img"
            aria-label="Loading seat count"
            className="h-2 w-10 rounded-full"
          />
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Seats used</dt>
          <dd className="font-medium tabular-nums">
            <Value width="5ch" label="Loading seats used" />
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Storage</dt>
          <dd className="font-medium tabular-nums">
            <Value width="8ch" label="Loading storage usage" />
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCardIcon aria-hidden="true" className="size-4 shrink-0" />
        <span>
          Visa ending in <Value width="4ch" label="Loading card digits" />
        </span>
      </div>

      <Button disabled className="w-full">
        Pay{" "}
        <Value
          width="6ch"
          label="Loading amount due"
          className="translate-y-0 bg-primary-foreground/25"
        />{" "}
        now
      </Button>
    </div>
  );
}
