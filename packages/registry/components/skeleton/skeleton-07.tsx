"use client";

import * as React from "react";
import { cn } from "cn";
import { MapPinIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { Switch } from "@/registry/base/ui/switch";

const stats = [
  { label: "Reviews", value: "128" },
  { label: "Merged", value: "342" },
  { label: "Streak", value: "19d" },
];

// Skeleton and content share one grid cell, so swapping them crossfades
// in place and the card never changes size.
const layer =
  "col-start-1 row-start-1 transition-[opacity,filter] duration-300 ease-out motion-reduce:transition-none";

export default function Skeleton07() {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="skeleton-07-loaded">Content loaded</Label>
          <span className="text-xs text-muted-foreground">
            Toggle to compare the placeholder with the real profile.
          </span>
        </div>
        <Switch
          id="skeleton-07-loaded"
          checked={loaded}
          onCheckedChange={setLoaded}
        />
      </div>

      <p role="status" className="sr-only">
        {loaded ? "Profile loaded" : "Loading profile"}
      </p>

      <div
        aria-busy={!loaded}
        className="grid rounded-xl border border-border bg-card p-5"
      >
        <div
          aria-hidden="true"
          className={cn(
            layer,
            "flex flex-col gap-4",
            loaded && "pointer-events-none opacity-0 blur-sm",
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5 py-0.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-2.5"
              >
                <Skeleton className="h-4 w-8 bg-background" />
                <Skeleton className="h-3 w-12 bg-background" />
              </div>
            ))}
          </div>
        </div>

        <div
          aria-hidden={!loaded}
          className={cn(
            layer,
            "flex flex-col gap-4",
            !loaded && "pointer-events-none opacity-0 blur-sm",
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback>MA</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">Mira Alvarez</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon aria-hidden="true" className="size-3" />
                Lisbon
              </span>
            </div>
            <Badge variant="secondary">Maintainer</Badge>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse gap-0.5 rounded-lg bg-muted/40 p-2.5"
              >
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
