"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  GitPullRequestIcon,
  RocketIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

type Update = {
  icon: LucideIcon;
  tone: string;
  title: string;
  detail: string;
  time: string;
};

const updates: Update[] = [
  {
    icon: RocketIcon,
    tone: "bg-primary/10 text-primary",
    title: "api-gateway deployed to production",
    detail: "v2.14.0 rolled out to all 6 regions.",
    time: "2m ago",
  },
  {
    icon: CircleAlertIcon,
    tone: "bg-warning/15 text-warning",
    title: "Elevated latency in eu-west-1",
    detail: "p95 rose to 840 ms. Auto-scaling added 3 nodes.",
    time: "18m ago",
  },
  {
    icon: GitPullRequestIcon,
    tone: "bg-muted text-muted-foreground",
    title: "Pull request 1284 merged into main",
    detail: "Rate limiter now reads limits per workspace.",
    time: "41m ago",
  },
  {
    icon: CircleCheckIcon,
    tone: "bg-success/15 text-success",
    title: "Nightly backup completed",
    detail: "412 GB snapshot verified in 6 min 12 s.",
    time: "3h ago",
  },
  {
    icon: RocketIcon,
    tone: "bg-primary/10 text-primary",
    title: "billing-worker deployed to staging",
    detail: "v1.9.3 awaiting QA sign-off.",
    time: "5h ago",
  },
];

export default function Carousel03() {
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground">
      <Carousel
        orientation="vertical"
        opts={{ align: "start" }}
        aria-label="Deployment activity"
      >
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Activity</h3>
          <div className="flex items-center gap-1">
            <CarouselPrevious
              variant="ghost"
              className="static translate-x-0 rounded-md"
            />
            <CarouselNext
              variant="ghost"
              className="static translate-x-0 rounded-md"
            />
          </div>
        </div>
        <CarouselContent className="mt-0 -mb-px h-44">
          {updates.map((update, index) => {
            const Icon = update.icon;
            return (
              <CarouselItem
                key={update.title}
                aria-label={`${index + 1} of ${updates.length}`}
                className="basis-1/2 pt-0"
              >
                <div className="flex h-full items-start gap-3 border-b px-4 py-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${update.tone}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {update.title}
                      </p>
                      <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {update.time}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {update.detail}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
