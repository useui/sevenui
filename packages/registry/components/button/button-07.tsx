"use client";

import { Bell, BellOff, Check, Plus, Star } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";

const baseStars = 1284;

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function Button07() {
  const [following, setFollowing] = React.useState(true);
  const [starred, setStarred] = React.useState(false);
  const [watching, setWatching] = React.useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">northwind/design-tokens</p>
          <p className="text-xs text-muted-foreground">
            Maintained by Maya Chen · updated 2 hours ago
          </p>
        </div>
        <Button
          size="sm"
          variant={following ? "outline" : "default"}
          aria-pressed={following}
          aria-label="Follow Maya Chen"
          className="group/follow min-w-24"
          onClick={() => setFollowing((value) => !value)}
        >
          {following ? (
            <>
              <Check aria-hidden="true" className="group-hover/follow:hidden" />
              <span className="group-hover/follow:hidden">Following</span>
              <span className="hidden text-destructive group-hover/follow:inline">
                Unfollow
              </span>
            </>
          ) : (
            <>
              <Plus aria-hidden="true" />
              Follow
            </>
          )}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          aria-pressed={starred}
          aria-label={`Star repository, ${formatCount(baseStars + (starred ? 1 : 0))} stars`}
          className="aria-pressed:border-warning/40 aria-pressed:bg-warning/10"
          onClick={() => setStarred((value) => !value)}
        >
          <Star
            aria-hidden="true"
            className={starred ? "fill-warning text-warning" : "text-muted-foreground"}
          />
          {starred ? "Starred" : "Star"}
          <span className="ml-1 border-l pl-2 text-muted-foreground tabular-nums">
            {formatCount(baseStars + (starred ? 1 : 0))}
          </span>
        </Button>
        <Button
          variant="ghost"
          aria-pressed={watching}
          className="aria-pressed:bg-muted"
          onClick={() => setWatching((value) => !value)}
        >
          {watching ? (
            <Bell aria-hidden="true" className="fill-current" />
          ) : (
            <BellOff aria-hidden="true" />
          )}
          {watching ? "Watching releases" : "Watch releases"}
        </Button>
      </div>
    </div>
  );
}
