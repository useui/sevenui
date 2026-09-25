"use client";

import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const regions = [
  {
    value: "iad",
    name: "Washington, D.C.",
    detail: "us-east-1 · Virginia",
    latency: "12 ms",
  },
  {
    value: "sfo",
    name: "San Francisco",
    detail: "us-west-1 · California",
    latency: "68 ms",
  },
  {
    value: "fra",
    name: "Frankfurt",
    detail: "eu-central-1 · Germany",
    latency: "91 ms",
    unavailable: "At capacity",
  },
  {
    value: "sin",
    name: "Singapore",
    detail: "ap-southeast-1 · Singapore",
    latency: "214 ms",
  },
];

export default function RadioGroup02() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p id="radio-group-02-label" className="text-sm font-medium">
        Database region
      </p>
      <RadioGroup
        defaultValue="iad"
        aria-labelledby="radio-group-02-label"
        className="gap-0 divide-y divide-border overflow-hidden rounded-lg border border-border"
      >
        {regions.map((region) => (
          <Label
            key={region.value}
            className="cursor-pointer items-start gap-3 px-4 py-3 transition-colors not-has-data-disabled:hover:bg-muted/50 has-data-checked:bg-muted/60 has-data-disabled:cursor-not-allowed"
          >
            <RadioGroupItem
              value={region.value}
              disabled={Boolean(region.unavailable)}
              className="mt-0.5"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                {region.name}
                {region.unavailable ? (
                  <Badge variant="outline">{region.unavailable}</Badge>
                ) : null}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {region.detail}
              </span>
            </span>
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              <span className="sr-only">Latency </span>
              {region.latency}
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        Latency is measured from your location. Frankfurt reopens for new
        databases once capacity is added, usually within a day.
      </p>
    </div>
  );
}
