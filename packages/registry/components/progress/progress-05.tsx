"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const meters = [
  {
    label: "Training distance this month",
    value: 128.4,
    min: 0,
    max: 200,
    format: {
      style: "unit",
      unit: "kilometer",
      maximumFractionDigits: 1,
    } satisfies Intl.NumberFormatOptions,
    suffix: "of 200 km",
  },
  {
    label: "Support tickets closed",
    value: 38,
    min: 0,
    max: 120,
    format: { maximumFractionDigits: 0 } satisfies Intl.NumberFormatOptions,
    suffix: "of 120",
  },
  {
    label: "Fundraising goal",
    value: 12650,
    min: 0,
    max: 20000,
    format: {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    } satisfies Intl.NumberFormatOptions,
    suffix: "of $20,000",
  },
];

export default function Progress05() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {meters.map((meter) => (
        <Progress
          key={meter.label}
          value={meter.value}
          min={meter.min}
          max={meter.max}
          format={meter.format}
          locale="en-US"
          getAriaValueText={(formatted) => `${formatted} ${meter.suffix}`}
          className="gap-2 [&>[data-slot=progress-track]]:h-1.5"
        >
          <ProgressLabel className="w-full text-xs font-normal text-muted-foreground">
            {meter.label}
          </ProgressLabel>
          <ProgressValue className="ml-0 text-base font-semibold text-foreground">
            {(formatted) => (
              <>
                {formatted}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {meter.suffix}
                </span>
              </>
            )}
          </ProgressValue>
        </Progress>
      ))}
    </div>
  );
}
