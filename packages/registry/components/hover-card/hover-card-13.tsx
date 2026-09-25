"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type PageStat = {
  path: string;
  title: string;
  views: number;
  change: number;
  daily: number[];
  avgTime: string;
  bounceRate: string;
  topReferrer: string;
};

const days = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];

const pages: PageStat[] = [
  {
    path: "/pricing",
    title: "Pricing — Plans for every team",
    views: 18420,
    change: 12.4,
    daily: [2310, 1540, 1380, 2890, 3240, 3610, 3450],
    avgTime: "1m 48s",
    bounceRate: "31%",
    topReferrer: "google.com",
  },
  {
    path: "/blog/usage-based-billing",
    title: "How we moved to usage-based billing",
    views: 11205,
    change: 64.1,
    daily: [620, 580, 710, 1240, 3980, 2410, 1665],
    avgTime: "4m 12s",
    bounceRate: "58%",
    topReferrer: "news.ycombinator.com",
  },
  {
    path: "/docs/quickstart",
    title: "Quickstart — Send your first event",
    views: 9876,
    change: -3.2,
    daily: [1510, 820, 760, 1620, 1740, 1730, 1696],
    avgTime: "3m 05s",
    bounceRate: "22%",
    topReferrer: "github.com",
  },
  {
    path: "/changelog",
    title: "Changelog",
    views: 4310,
    change: 8.9,
    daily: [540, 310, 290, 690, 820, 860, 800],
    avgTime: "0m 57s",
    bounceRate: "44%",
    topReferrer: "x.com",
  },
];

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function DailyBars({ page }: { page: PageStat }) {
  const max = Math.max(...page.daily);
  const peakIndex = page.daily.indexOf(max);

  return (
    <figure className="grid gap-1.5">
      <figcaption className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">Views, last 7 days</span>
        <span className="tabular-nums">
          Peak {numberFormat.format(max)} on {days[peakIndex]}
        </span>
      </figcaption>
      <ol className="flex h-16 items-end gap-1">
        {page.daily.map((value, index) => (
          <li
            key={days[index]}
            className="flex h-full flex-1 flex-col justify-end"
          >
            <span className="sr-only">
              {days[index]}: {numberFormat.format(value)} views
            </span>
            <span
              aria-hidden="true"
              className={
                index === peakIndex
                  ? "rounded-sm bg-chart-2"
                  : "rounded-sm bg-chart-2/35"
              }
              style={{ height: `${Math.max((value / max) * 100, 4)}%` }}
            />
          </li>
        ))}
      </ol>
      <div
        aria-hidden="true"
        className="flex gap-1 text-center text-[0.65rem] text-muted-foreground"
      >
        {days.map((day) => (
          <span key={day} className="flex-1">
            {day.charAt(0)}
          </span>
        ))}
      </div>
    </figure>
  );
}

export default function HoverCard13() {
  const total = pages.reduce((sum, page) => sum + page.views, 0);

  return (
    <section
      aria-labelledby="hover-card-13-title"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-2">
        <h3 id="hover-card-13-title" className="text-sm font-medium">
          Top pages
        </h3>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </header>
      <div className="mt-3 flex justify-between border-b pb-2 text-xs text-muted-foreground">
        <span>Page</span>
        <span>Views</span>
      </div>
      <ol className="mt-1 grid">
        {pages.map((page) => {
          const up = page.change >= 0;
          const TrendIcon = up ? ArrowUpRightIcon : ArrowDownRightIcon;
          const share = (page.views / total) * 100;

          return (
            <li key={page.path} className="relative py-1">
              <span
                aria-hidden="true"
                className="absolute inset-y-1 left-0 rounded-sm bg-muted"
                style={{ width: `${share}%` }}
              />
              <div className="relative flex items-center justify-between gap-3 px-2 py-1">
                <HoverCard>
                  <HoverCardTrigger
                    href={`#page${page.path}`}
                    delay={350}
                    className="min-w-0 truncate rounded-sm font-mono text-xs outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {page.path}
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="left"
                    align="start"
                    className="grid w-72 max-w-[calc(100vw-2rem)] gap-3 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {page.title}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        acme.dev{page.path}
                      </p>
                    </div>
                    <DailyBars page={page} />
                    <dl className="grid grid-cols-3 gap-2 border-t pt-2.5 text-xs">
                      <div className="grid gap-0.5">
                        <dt className="text-muted-foreground">Avg. time</dt>
                        <dd className="font-medium tabular-nums">
                          {page.avgTime}
                        </dd>
                      </div>
                      <div className="grid gap-0.5">
                        <dt className="text-muted-foreground">Bounce</dt>
                        <dd className="font-medium tabular-nums">
                          {page.bounceRate}
                        </dd>
                      </div>
                      <div className="grid min-w-0 gap-0.5">
                        <dt className="text-muted-foreground">Top source</dt>
                        <dd className="truncate font-medium">
                          {page.topReferrer}
                        </dd>
                      </div>
                    </dl>
                  </HoverCardContent>
                </HoverCard>
                <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
                  <span
                    className={`flex items-center ${up ? "text-success" : "text-destructive"}`}
                  >
                    <TrendIcon aria-hidden="true" className="size-3" />
                    <span className="sr-only">{up ? "Up" : "Down"}</span>
                    {Math.abs(page.change)}%
                  </span>
                  <span className="w-10 text-right font-medium">
                    {compactFormat.format(page.views)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
