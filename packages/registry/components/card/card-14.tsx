"use client";

import * as React from "react";
import {
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  RotateCw,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Spinner } from "@/registry/base/ui/spinner";

const domain = "storefront-web.acme.app";

const buildSteps = [
  { label: "Install", duration: "12s" },
  { label: "Build", duration: "31s" },
  { label: "Deploy", duration: "5s" },
];

type Status = "ready" | "building";

export default function Card14() {
  const [status, setStatus] = React.useState<Status>("ready");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (status !== "building") return;
    const timer = window.setTimeout(() => setStatus("ready"), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyDomain = () => {
    navigator.clipboard?.writeText(`https://${domain}`).catch(() => {});
    setCopied(true);
  };

  const building = status === "building";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>storefront-web</CardTitle>
        <CardDescription>Production deployment</CardDescription>
        <CardAction>
          <Badge variant="outline" aria-live="polite">
            <span
              aria-hidden="true"
              className={
                building
                  ? "size-1.5 animate-pulse rounded-full bg-warning"
                  : "size-1.5 rounded-full bg-success"
              }
            />
            {building ? "Building" : "Ready"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 py-1 pr-1 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs">
            {domain}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? "Copied" : "Copy deployment URL"}
            onClick={copyDomain}
          >
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
          </Button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Source</dt>
          <dd className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <GitBranch
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
              />
              <span className="font-mono text-xs">main</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <GitCommitHorizontal
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                a3f9c21
              </span>
              <span className="truncate text-xs">
                Fix cart total rounding for tiered discounts
              </span>
            </span>
          </dd>
          <dt className="text-muted-foreground">Created</dt>
          <dd>
            {building ? "Just now" : "14m ago"} by{" "}
            <span className="font-medium">Sofia Reyes</span>
          </dd>
          <dt className="text-muted-foreground">Duration</dt>
          <dd>
            <ol
              aria-label="Build steps"
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
            >
              {buildSteps.map((step) => (
                <li key={step.label} className="flex items-center gap-1">
                  {building ? (
                    <Spinner
                      aria-hidden="true"
                      className="size-3 text-muted-foreground"
                    />
                  ) : (
                    <Check aria-hidden="true" className="size-3 text-success" />
                  )}
                  {step.label}
                  <span className="text-muted-foreground tabular-nums">
                    {building ? "…" : step.duration}
                  </span>
                </li>
              ))}
            </ol>
          </dd>
        </dl>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={building}
          onClick={() => setStatus("building")}
        >
          {building ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RotateCw data-icon="inline-start" aria-hidden="true" />
          )}
          {building ? "Redeploying" : "Redeploy"}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <a href={`#${domain}`} />
          }
        >
          Visit
          <ExternalLink data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}
