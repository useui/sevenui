"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  GitCommitHorizontalIcon,
  GitMergeIcon,
  GitPullRequestArrowIcon,
  MessageSquareDotIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const commits = [
  { sha: "a41c9e2", message: "Add token bucket to export endpoint" },
  { sha: "7d03b18", message: "Return Retry-After header on 429" },
];

export default function Marker12() {
  const [resolved, setResolved] = React.useState(false);
  const [merged, setMerged] = React.useState(false);

  return (
    <section
      aria-labelledby="marker-12-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {merged ? (
            <Badge>
              <GitMergeIcon aria-hidden="true" />
              Merged
            </Badge>
          ) : (
            <Badge variant="outline">
              <GitPullRequestArrowIcon aria-hidden="true" />
              Open
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">PR 1289</span>
        </div>
        <h3 id="marker-12-title" className="text-sm font-medium">
          Rate limit the CSV export endpoint
        </h3>
      </header>

      <ol aria-label="Pull request activity" className="flex flex-col gap-3">
        <li className="flex flex-col gap-1.5">
          <Marker className="text-xs">
            <MarkerIcon>
              <GitCommitHorizontalIcon />
            </MarkerIcon>
            <MarkerContent>
              <span className="font-medium text-foreground">nadia-k</span>{" "}
              pushed 2 commits
            </MarkerContent>
          </Marker>
          <ul className="ml-6 flex flex-col gap-1">
            {commits.map((commit) => (
              <li
                key={commit.sha}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="truncate">{commit.message}</span>
                <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  {commit.sha}
                </code>
              </li>
            ))}
          </ul>
        </li>

        <li
          className={
            resolved
              ? "flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3"
              : "flex flex-col gap-2 rounded-lg border border-border p-3"
          }
        >
          <Marker variant="border" className="text-xs">
            <MarkerIcon>
              <MessageSquareDotIcon />
            </MarkerIcon>
            <MarkerContent className="font-mono">
              src/routes/export.ts · line 42
            </MarkerContent>
          </Marker>
          <div className="flex gap-2.5">
            <Avatar className="size-6">
              <AvatarFallback className="text-[0.65rem]">RB</AvatarFallback>
            </Avatar>
            <p className="text-sm">
              <span className="font-medium">Ravi Bose</span> — Should the bucket
              be per API key instead of per IP? Shared office networks will hit
              this fast.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Marker
              role="status"
              className="w-auto text-xs data-[resolved=true]:text-foreground"
              data-resolved={resolved}
            >
              {resolved && (
                <MarkerIcon>
                  <CircleCheckIcon />
                </MarkerIcon>
              )}
              <MarkerContent>
                {resolved ? "Resolved by you" : "1 unresolved thread"}
              </MarkerContent>
            </Marker>
            {merged ? null : (
              <Button
                variant="outline"
                size="xs"
                onClick={() => setResolved((value) => !value)}
              >
                {resolved ? "Unresolve" : "Resolve conversation"}
              </Button>
            )}
          </div>
        </li>

        <li>
          <Marker className="text-xs">
            <MarkerIcon>
              <CircleCheckIcon />
            </MarkerIcon>
            <MarkerContent>
              All checks passed on 7d03b18 · <a href="#pr-1289-checks">Details</a>
            </MarkerContent>
          </Marker>
        </li>

        {merged && (
          <li>
            <Marker className="text-xs text-foreground">
              <MarkerIcon>
                <GitMergeIcon />
              </MarkerIcon>
              <MarkerContent>
                <span className="font-medium">You</span> squashed and merged
                into main
              </MarkerContent>
            </Marker>
          </li>
        )}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p role="status" className="text-xs text-muted-foreground">
          {merged
            ? "Merged just now."
            : resolved
              ? "Ready to merge."
              : "Resolve open threads before merging."}
        </p>
        {merged ? (
          <Button size="sm" variant="outline" onClick={() => setMerged(false)}>
            Undo merge
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={!resolved}
            onClick={() => setMerged(true)}
          >
            Squash and merge
          </Button>
        )}
      </div>
    </section>
  );
}
