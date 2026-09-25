"use client";

import * as React from "react";
import { RocketIcon, RotateCcwIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/registry/base/ui/message-scroller";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";

type LogLevel = "info" | "warn" | "done";
type LogLine = { level: LogLevel; text: string };

const buildLog: LogLine[] = [
  { level: "info", text: "Cloning github.com/northwind/storefront (branch: main)" },
  { level: "info", text: "Cloning completed: 1.84s" },
  { level: "info", text: "Restored build cache from previous deployment" },
  { level: "info", text: "Running \"pnpm install --frozen-lockfile\"" },
  { level: "info", text: "Packages: +1,284 resolved, 0 downloaded" },
  { level: "info", text: "Done in 6.2s" },
  { level: "info", text: "Running \"pnpm run build\"" },
  { level: "info", text: "▲ Next.js 16.0.3 — Creating an optimized production build" },
  { level: "warn", text: "Warning: 2 images are missing width/height (app/page.tsx)" },
  { level: "info", text: "✓ Compiled successfully in 21.4s" },
  { level: "info", text: "✓ Linting and checking validity of types" },
  { level: "info", text: "✓ Collecting page data" },
  { level: "info", text: "✓ Generating static pages (48/48)" },
  { level: "info", text: "Route (app)               Size    First Load JS" },
  { level: "info", text: "○ /                       5.2 kB  118 kB" },
  { level: "info", text: "● /products/[slug]        3.9 kB  121 kB" },
  { level: "info", text: "Uploading build outputs (312 files)" },
  { level: "info", text: "Assigning domains: storefront.northwind.dev" },
  { level: "done", text: "Deployment ready in 48s" },
];

type Status = "idle" | "building" | "ready";

const levelClass: Record<LogLevel, string> = {
  info: "text-foreground/80",
  warn: "text-warning",
  done: "font-medium text-success",
};

// Keeps the scroller's follow state in step with the switch. Turning follow
// on jumps to the latest line. Turning it off while pinned to the bottom
// re-anchors at the end so "Jump to latest" appears as new output arrives.
function FollowSync({
  follow,
  viewportRef,
}: {
  follow: boolean;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { scrollToEnd } = useMessageScroller();
  const previous = React.useRef(follow);

  React.useEffect(() => {
    if (previous.current === follow) return;
    previous.current = follow;
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (follow) {
      scrollToEnd({ behavior: "smooth" });
      return;
    }
    const distance =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;
    if (distance <= 1) scrollToEnd();
  }, [follow, scrollToEnd, viewportRef]);

  return null;
}

export default function MessageScroller09() {
  const [count, setCount] = React.useState(0);
  const [status, setStatus] = React.useState<Status>("idle");
  const [follow, setFollow] = React.useState(true);
  const followId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (status !== "building") return;
    const timer = window.setInterval(() => {
      setCount((current) => Math.min(current + 1, buildLog.length));
    }, 450);
    return () => window.clearInterval(timer);
  }, [status]);

  React.useEffect(() => {
    if (status === "building" && count === buildLog.length) {
      setStatus("ready");
    }
  }, [status, count]);

  function deploy() {
    setCount(0);
    setStatus("building");
  }

  const lines = buildLog.slice(0, count);

  return (
    <section
      aria-labelledby="deploy-log-title"
      className="flex h-[26rem] w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 id="deploy-log-title" className="text-sm font-medium">
            Production deployment
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            storefront · commit 8f3a2c1 “Fix cart badge overflow”
          </p>
        </div>
        <Badge
          variant={status === "ready" ? "default" : "secondary"}
          aria-live="polite"
        >
          {status === "building" ? <Spinner /> : null}
          {status === "idle"
            ? "Queued"
            : status === "building"
              ? "Building"
              : "Ready"}
        </Badge>
      </header>
      <MessageScrollerProvider autoScroll={follow}>
        <FollowSync follow={follow} viewportRef={viewportRef} />
        <MessageScroller className="flex-1 bg-muted/40">
          <MessageScrollerViewport
            ref={viewportRef}
            className="px-4 py-3"
            aria-label="Build output"
          >
            <MessageScrollerContent className="gap-0 font-mono text-xs leading-6">
              {lines.map((line, index) => (
                <MessageScrollerItem
                  key={line.text}
                  messageId={`line-${index}`}
                  className="grid grid-cols-[2.5rem_1fr] [contain-intrinsic-size:auto_1.5rem]"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground tabular-nums select-none"
                  >
                    {String(index + 1).padStart(3, "0")}
                  </span>
                  <span className={`break-words ${levelClass[line.level]}`}>
                    {line.text}
                  </span>
                </MessageScrollerItem>
              ))}
              {status === "idle" ? (
                <MessageScrollerItem className="text-muted-foreground">
                  Waiting for a build runner. Start the build to stream its
                  output here.
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton size="sm" className="font-sans">
            Jump to latest
          </MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            id={followId}
            checked={follow}
            onCheckedChange={setFollow}
            size="sm"
          />
          <Label htmlFor={followId} className="text-xs">
            Follow output
          </Label>
        </div>
        <Button
          size="sm"
          onClick={deploy}
          disabled={status === "building"}
        >
          {status === "ready" ? (
            <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <RocketIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {status === "ready" ? "Redeploy" : "Start build"}
        </Button>
      </footer>
    </section>
  );
}
