"use client";

import * as React from "react";

import { Separator } from "@/registry/base/ui/separator";

const stats = [
  { label: "Weekly downloads", value: "184,302", change: "+12.4%" },
  { label: "Open issues", value: "37", change: "-8 this week" },
  { label: "Median response", value: "4h 12m", change: "Down from 6h" },
];

export default function Separator03() {
  return (
    <div className="@container w-full max-w-2xl">
      <div className="flex flex-col rounded-xl border bg-card text-card-foreground @lg:flex-row">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && (
              <>
                {/* Stacked on narrow containers, side by side from @lg up. */}
                <Separator className="@lg:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden @lg:my-4 @lg:block"
                />
              </>
            )}
            <dl className="flex flex-1 flex-col gap-1 px-5 py-4">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </dd>
              <dd className="text-xs text-muted-foreground">{stat.change}</dd>
            </dl>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
