"use client";

import { WrapTextIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Separator } from "@/registry/base/ui/separator";
import { Toggle } from "@/registry/base/ui/toggle";

type Level = "error" | "warn" | "info" | "debug";

const levels: { key: Level; label: string; dot: string; tone: string }[] = [
  { key: "error", label: "Errors", dot: "bg-destructive", tone: "text-destructive" },
  { key: "warn", label: "Warnings", dot: "bg-warning", tone: "text-foreground" },
  { key: "info", label: "Info", dot: "bg-chart-2", tone: "text-foreground" },
  { key: "debug", label: "Debug", dot: "bg-muted-foreground", tone: "text-muted-foreground" },
];

const logs: { time: string; level: Level; message: string }[] = [
  { time: "14:02:11", level: "info", message: "GET /api/invoices 200 in 84ms" },
  { time: "14:02:12", level: "debug", message: "cache hit invoices:acct_4821 (ttl 58s)" },
  { time: "14:02:15", level: "warn", message: "Slow query on payments.list took 1,240ms; consider an index on created_at" },
  { time: "14:02:17", level: "error", message: "POST /api/webhooks/stripe 500: signature verification failed for event evt_3Q9x" },
  { time: "14:02:18", level: "info", message: "Retry scheduled for webhook evt_3Q9x in 30s" },
  { time: "14:02:21", level: "debug", message: "worker-2 heartbeat ok (queue depth 3)" },
  { time: "14:02:24", level: "info", message: "Deployed build 8f3c1a2 to production" },
];

export default function Toggle13() {
  const [active, setActive] = React.useState<Set<Level>>(
    () => new Set<Level>(["error", "warn", "info"]),
  );
  const [wrap, setWrap] = React.useState(false);

  function setLevel(key: Level, pressed: boolean) {
    setActive((current) => {
      const next = new Set(current);
      if (pressed) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  const visible = logs.filter((log) => active.has(log.level));

  return (
    <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {levels.map((level) => {
          const count = logs.filter((log) => log.level === level.key).length;
          return (
            <Toggle
              key={level.key}
              size="sm"
              pressed={active.has(level.key)}
              onPressedChange={(pressed) => setLevel(level.key, pressed)}
              className="text-muted-foreground aria-pressed:text-foreground"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full opacity-40 group-aria-pressed/toggle:opacity-100",
                  level.dot,
                )}
              />
              {level.label}
              <span className="text-xs text-muted-foreground tabular-nums">
                {count}
              </span>
            </Toggle>
          );
        })}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Toggle
          size="sm"
          pressed={wrap}
          onPressedChange={setWrap}
          aria-label="Wrap long lines"
          className="ml-auto"
        >
          <WrapTextIcon aria-hidden="true" />
        </Toggle>
      </div>
      <div
        role="log"
        aria-label="Application logs"
        className="max-h-56 overflow-auto bg-muted/40 py-2 font-mono text-xs"
      >
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center font-sans text-sm text-muted-foreground">
            All levels are hidden. Turn one on to see logs.
          </p>
        ) : (
          visible.map((log) => {
            const tone = levels.find((l) => l.key === log.level)?.tone;
            return (
              <div
                key={`${log.time}-${log.message}`}
                className={cn(
                  "flex gap-3 px-3 py-0.5 hover:bg-muted",
                  wrap ? "items-start" : "items-baseline",
                )}
              >
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {log.time}
                </span>
                <span className={cn("w-10 shrink-0 uppercase", tone)}>
                  {log.level}
                </span>
                <span
                  className={cn(
                    "min-w-0",
                    wrap ? "break-words whitespace-pre-wrap" : "truncate",
                  )}
                >
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
