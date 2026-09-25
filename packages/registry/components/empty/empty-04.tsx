"use client";

import { ChartColumnIcon, ChartPieIcon, LayoutDashboardIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty04() {
  return (
    <Empty className="w-full max-w-md bg-muted/60 p-8 md:p-12">
      <EmptyHeader>
        <EmptyMedia className="mb-4">
          <div
            aria-hidden="true"
            className="relative flex h-14 w-24 items-end justify-center"
          >
            <div className="absolute bottom-1 left-1 flex size-10 -rotate-12 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm">
              <ChartColumnIcon className="size-4" />
            </div>
            <div className="absolute right-1 bottom-1 flex size-10 rotate-12 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm">
              <ChartPieIcon className="size-4" />
            </div>
            <div className="relative flex size-12 items-center justify-center rounded-xl border bg-card text-foreground shadow-md">
              <LayoutDashboardIcon className="size-5" />
            </div>
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-base">Build your first dashboard</EmptyTitle>
        <EmptyDescription>
          Pin charts from any report to track signups, revenue, and churn on
          one screen your whole team can open.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button>Create dashboard</Button>
          <Button variant="ghost">Start from a template</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
