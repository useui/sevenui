"use client";

import * as React from "react";
import { ArrowDownToLine, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

type Level = "info" | "warn" | "error" | "success";

type LogLine = { time: string; level: Level; text: string };

const script: LogLine[] = [
  { time: "14:02:11", level: "info", text: "Cloning github.com/northwind/storefront (branch: main, commit 8f3c2a1)" },
  { time: "14:02:13", level: "info", text: "Restored build cache from 2026-09-24T18:40:02Z (412 MB)" },
  { time: "14:02:14", level: "info", text: "Detected pnpm@10.4.1 from packageManager field" },
  { time: "14:02:19", level: "info", text: "Lockfile is up to date, resolution step is skipped" },
  { time: "14:02:31", level: "info", text: "Packages: +1,284 · Progress: resolved 1284, reused 1270, downloaded 14, added 1284" },
  { time: "14:02:32", level: "warn", text: "Peer dependency warning: @storybook/react@9.1.0 expects react@^18 but found react@19.2.8" },
  { time: "14:02:33", level: "info", text: "> storefront@2.14.0 build" },
  { time: "14:02:33", level: "info", text: "> next build --turbopack" },
  { time: "14:02:41", level: "info", text: "Creating an optimized production build ..." },
  { time: "14:03:02", level: "info", text: "Compiled successfully in 21.4s" },
  { time: "14:03:03", level: "info", text: "Linting and checking validity of types ..." },
  { time: "14:03:15", level: "warn", text: "app/(shop)/product/[slug]/page.tsx:48:7 — 'relatedProducts' is assigned a value but never used" },
  { time: "14:03:18", level: "info", text: "Collecting page data using 8 workers ..." },
  { time: "14:03:26", level: "info", text: "Generating static pages (0/214) ..." },
  { time: "14:03:39", level: "info", text: "Generating static pages (214/214)" },
  { time: "14:03:41", level: "info", text: "Finalizing page optimization and collecting build traces ..." },
  { time: "14:03:47", level: "info", text: "Route (app)                     Size     First Load JS" },
  { time: "14:03:47", level: "info", text: "┌ ○ /                            6.2 kB          148 kB" },
  { time: "14:03:47", level: "info", text: "├ ● /product/[slug]              11.8 kB         164 kB" },
  { time: "14:03:47", level: "info", text: "└ ƒ /api/checkout                0 B             0 B" },
  { time: "14:03:52", level: "info", text: "Uploading build outputs to edge network (1,027 files)" },
  { time: "14:04:05", level: "success", text: "Deployment ready at storefront-8f3c2a1.northwind.app in 1m 54s" },
];

const levelClass: Record<Level, string> = {
  info: "text-foreground/80",
  warn: "text-warning",
  error: "text-destructive",
  success: "text-success",
};

export default function ScrollArea10() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [count, setCount] = React.useState(6);
  const [running, setRunning] = React.useState(true);
  const [follow, setFollow] = React.useState(true);

  const done = count >= script.length;
  const lines = script.slice(0, count);
  const warnings = lines.filter((l) => l.level === "warn").length;

  // Stream one line at a time while running; cleaned up on pause/unmount.
  React.useEffect(() => {
    if (!running || done) return;
    const id = window.setInterval(() => {
      setCount((c) => Math.min(c + 1, script.length));
    }, 700);
    return () => window.clearInterval(id);
  }, [running, done]);

  // Keep the viewport pinned to the newest line while following.
  React.useEffect(() => {
    if (!follow || count === 0) return;
    const viewport = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [count, follow]);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const atBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 4;
    setFollow(atBottom);
  }

  function restart() {
    setCount(1);
    setFollow(true);
    setRunning(true);
  }

  return (
    <div className="@container w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 id="scroll-area-10-title" className="truncate text-sm font-semibold">
            Build log · storefront
          </h3>
          <Badge variant={done ? "secondary" : "outline"}>
            {done ? "Ready" : running ? "Building" : "Paused"}
          </Badge>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {done ? (
            <Button variant="ghost" size="sm" onClick={restart}>
              <RotateCcw aria-hidden="true" />
              <span className="@max-sm:sr-only">Replay</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
              <span className="@max-sm:sr-only">
                {running ? "Pause" : "Resume"}
              </span>
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <ScrollArea
          ref={rootRef}
          orientation="both"
          role="log"
          aria-labelledby="scroll-area-10-title"
          onScrollCapture={handleScroll}
          className="h-64 bg-muted/40"
        >
          <ol className="w-max min-w-full py-2 font-mono text-xs leading-6">
            {lines.map((line, index) => (
              <li
                key={`${line.time}-${line.text}`}
                className={cn(
                  "flex gap-4 pr-6 pl-3 whitespace-pre",
                  line.level === "warn" && "bg-warning/10",
                  line.level === "success" && "bg-success/10",
                )}
              >
                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 text-right text-muted-foreground/70 tabular-nums select-none"
                >
                  {index + 1}
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {line.time}
                </span>
                <span className={levelClass[line.level]}>{line.text}</span>
              </li>
            ))}
          </ol>
        </ScrollArea>
        {!follow ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFollow(true)}
            className="absolute right-4 bottom-4 shadow-md"
          >
            <ArrowDownToLine aria-hidden="true" />
            Jump to latest
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-4 py-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {lines.length} of {script.length} lines
        </span>
        <span className="tabular-nums">
          {warnings} {warnings === 1 ? "warning" : "warnings"} · 0 errors
        </span>
      </div>
    </div>
  );
}
