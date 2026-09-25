"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type DayStatus = "operational" | "degraded" | "outage";

type Day = {
  date: string;
  uptime: number;
  status: DayStatus;
  incident?: { title: string; duration: string };
};

// Days with incidents, keyed by their index in the 30-day window.
const incidents: Record<number, Omit<Day, "date">> = {
  6: {
    uptime: 99.42,
    status: "degraded",
    incident: {
      title: "Elevated latency on webhook delivery in eu-west",
      duration: "38 min",
    },
  },
  17: {
    uptime: 97.91,
    status: "outage",
    incident: {
      title: "API returned 503 errors after a failed database failover",
      duration: "1 hr 12 min",
    },
  },
  24: {
    uptime: 99.86,
    status: "degraded",
    incident: {
      title: "Dashboard charts loaded slowly for some workspaces",
      duration: "14 min",
    },
  },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const days: Day[] = Array.from({ length: 30 }, (_, index) => {
  // Aug 27 through Sep 25, 2026.
  const date = dateFormat.format(new Date(2026, 7, 27 + index));
  return incidents[index]
    ? { date, ...incidents[index] }
    : { date, uptime: 100, status: "operational" };
});

const statusMeta: Record<
  DayStatus,
  { label: string; bar: string; icon: typeof CircleCheckIcon; text: string }
> = {
  operational: {
    label: "No incidents",
    bar: "bg-success/70",
    icon: CircleCheckIcon,
    text: "text-success",
  },
  degraded: {
    label: "Degraded performance",
    bar: "bg-warning",
    icon: TriangleAlertIcon,
    text: "text-warning",
  },
  outage: {
    label: "Partial outage",
    bar: "bg-destructive",
    icon: CircleAlertIcon,
    text: "text-destructive",
  },
};

const average =
  days.reduce((sum, day) => sum + day.uptime, 0) / Math.max(days.length, 1);

export default function HoverCard07() {
  return (
    <section
      aria-labelledby="hover-card-07-title"
      className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 id="hover-card-07-title" className="text-sm font-medium">
          Public API
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {average.toFixed(2)}% uptime
        </span>
      </header>
      {/* One card serves all 30 bars: each trigger passes its day as payload. */}
      <HoverCard>
        {({ payload }) => {
          const day = typeof payload === "number" ? days[payload] : undefined;
          const meta = day ? statusMeta[day.status] : undefined;

          return (
            <>
              <ol
                aria-label="Daily uptime, last 30 days"
                className="mt-3 flex h-9 items-stretch gap-px sm:gap-0.5"
              >
                {days.map((item, index) => (
                  <li key={item.date} className="flex min-w-0 flex-1">
                    <HoverCardTrigger
                      payload={index}
                      delay={0}
                      closeDelay={100}
                      render={
                        <button
                          type="button"
                          aria-label={`${item.date}: ${statusMeta[item.status].label}, ${item.uptime}% uptime`}
                          className={`w-full rounded-[2px] outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card data-popup-open:opacity-70 ${statusMeta[item.status].bar}`}
                        />
                      }
                    />
                  </li>
                ))}
              </ol>
              <HoverCardContent side="top" className="w-64 p-3">
                {day && meta && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {day.uptime.toFixed(2)}%
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <meta.icon
                        aria-hidden="true"
                        className={`size-3.5 shrink-0 ${meta.text}`}
                      />
                      {meta.label}
                    </span>
                    {day.incident && (
                      <div className="flex flex-col gap-0.5 border-t pt-2">
                        <p className="leading-snug">{day.incident.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Resolved after {day.incident.duration}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </HoverCardContent>
            </>
          );
        }}
      </HoverCard>
      <div
        aria-hidden="true"
        className="mt-2 flex justify-between text-xs text-muted-foreground"
      >
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </section>
  );
}
