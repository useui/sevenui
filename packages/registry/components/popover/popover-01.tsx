"use client";

import { ArrowUpRightIcon, CircleHelpIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

export default function Popover01() {
  return (
    <div className="flex w-full max-w-xs items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Billable hours</span>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="How billable hours are counted"
                  className="text-muted-foreground"
                />
              }
            >
              <CircleHelpIcon aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent side="top" className="w-64">
              <PopoverHeader>
                <PopoverTitle>How billable hours are counted</PopoverTitle>
                <PopoverDescription>
                  Time entries tagged to a client project, rounded up to the
                  nearest 15 minutes. Internal meetings and time off are
                  excluded.
                </PopoverDescription>
              </PopoverHeader>
              <a
                href="#billable-hours"
                className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Read the timesheet guide
                <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
              </a>
            </PopoverContent>
          </Popover>
        </div>
        <span className="text-2xl font-semibold tabular-nums">128.5 h</span>
      </div>
      <span className="text-xs text-muted-foreground">September</span>
    </div>
  );
}
