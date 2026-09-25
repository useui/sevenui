"use client";

import { FileCode2, GitCommitHorizontal } from "lucide-react";

import { cn } from "cn";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const commits = {
  a3f9c21: {
    author: "Maya Chen",
    initials: "MC",
    message: "Move rate limiter to Upstash Redis",
    when: "3 weeks ago",
    recent: false,
  },
  "7d12e0b": {
    author: "Daniel Okafor",
    initials: "DO",
    message: "Tighten the window to one minute for public keys",
    when: "2 days ago",
    recent: false,
  },
  e5b8f44: {
    author: "Lena Fischer",
    initials: "LF",
    message: "Fix limiter never resetting after the first burst",
    when: "5 hours ago",
    recent: true,
  },
};

type Hash = keyof typeof commits;

const source: { code: string; hash: Hash }[] = [
  { code: "const redis = Redis.fromEnv();", hash: "a3f9c21" },
  { code: "", hash: "a3f9c21" },
  { code: "const WINDOW_MS = 60_000;", hash: "7d12e0b" },
  { code: "const MAX_REQUESTS = 120;", hash: "7d12e0b" },
  { code: "", hash: "a3f9c21" },
  { code: "export async function limit(key: string) {", hash: "a3f9c21" },
  { code: "  const count = await redis.incr(key);", hash: "a3f9c21" },
  {
    code: "  if (count === 1) await redis.pexpire(key, WINDOW_MS);",
    hash: "e5b8f44",
  },
  { code: "  return count <= MAX_REQUESTS;", hash: "a3f9c21" },
  { code: "}", hash: "a3f9c21" },
];

const lines = source.map((line, index) => ({ ...line, number: index + 1 }));

// Light, raised surface for multi-line content; the arrow follows it.
const richContent =
  "grid max-w-64 gap-1.5 rounded-lg border border-border bg-popover p-3 text-left text-popover-foreground shadow-lg [&>[data-side]]:border-r [&>[data-side]]:border-b [&>[data-side]]:border-border [&>[data-side]]:bg-popover";

export default function Tooltip11() {
  return (
    <TooltipProvider delay={250}>
      <figure className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
        <figcaption className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm">
          <FileCode2
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <span className="truncate font-medium">src/lib/rate-limit.ts</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            Blame
          </span>
        </figcaption>
        <div className="overflow-x-auto py-2">
          <ol className="min-w-max font-mono text-xs leading-6">
            {lines.map((line, index) => {
              const commit = commits[line.hash];
              const startsRun =
                index === 0 || lines[index - 1].hash !== line.hash;
              return (
                <li key={line.number} className="flex">
                  <div className="sticky left-0 flex w-28 shrink-0 items-center gap-2 bg-card pr-2 pl-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-full w-0.5 shrink-0",
                        commit.recent ? "bg-primary" : "bg-border",
                      )}
                    />
                    {startsRun ? (
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={`Commit ${line.hash} by ${commit.author}, ${commit.when}: ${commit.message}`}
                          className="truncate rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {line.hash.slice(0, 7)} {commit.initials}
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          className={richContent}
                        >
                          <span className="font-sans text-sm font-medium text-balance">
                            {commit.message}
                          </span>
                          <span className="flex items-center gap-1.5 font-sans text-muted-foreground">
                            <GitCommitHorizontal
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            <span className="font-mono">{line.hash}</span>
                            <span aria-hidden="true">·</span>
                            {commit.author}
                          </span>
                          <span className="font-sans text-muted-foreground">
                            Committed {commit.when}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                  <span className="w-7 shrink-0 pr-3 text-right text-muted-foreground/70 tabular-nums select-none">
                    {line.number}
                  </span>
                  <code className="pr-4 whitespace-pre">
                    {line.code || " "}
                  </code>
                </li>
              );
            })}
          </ol>
        </div>
      </figure>
    </TooltipProvider>
  );
}
