"use client";

import type { CSSProperties } from "react";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const campaigns = [
  { name: "Spring launch emails", sent: 8240, total: 12000 },
  { name: "Churn win-back", sent: 1830, total: 2400 },
  { name: "Beta invite wave 2", sent: 310, total: 1500 },
];

const numberFormat = new Intl.NumberFormat("en-US");

export default function Progress07() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {campaigns.map((campaign) => {
        const percent = Math.round((campaign.sent / campaign.total) * 100);
        const caption = `${numberFormat.format(campaign.sent)} of ${numberFormat.format(campaign.total)} sent`;

        return (
          <Progress
            key={campaign.name}
            value={campaign.sent}
            max={campaign.total}
            getAriaValueText={() => caption}
            className="relative [&>[data-slot=progress-track]]:h-8 [&>[data-slot=progress-track]]:rounded-md [&_[data-slot=progress-indicator]]:rounded-none"
          >
            <ProgressLabel className="sr-only">{campaign.name}</ProgressLabel>
            <ProgressValue className="sr-only" />
            {/*
              Two stacked copies of the same text: the top one is clipped to
              the filled width so it flips color exactly where the bar ends.
            */}
            <InsideLabel
              name={campaign.name}
              caption={`${percent}%`}
              className="text-foreground"
            />
            <InsideLabel
              name={campaign.name}
              caption={`${percent}%`}
              className="text-primary-foreground transition-[clip-path]"
              style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
            />
          </Progress>
        );
      })}
    </div>
  );
}

function InsideLabel({
  name,
  caption,
  className,
  style,
}: {
  name: string;
  caption: string;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-8 items-center justify-between gap-3 px-3 text-xs font-medium ${className}`}
    >
      <span className="truncate">{name}</span>
      <span className="tabular-nums">{caption}</span>
    </div>
  );
}
