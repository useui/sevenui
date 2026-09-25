"use client";

import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  GitBranchIcon,
  RocketIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const environments = [
  { value: "preview", label: "Preview" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

const branches = [
  { value: "main", label: "main", commit: "a41f9c2", age: "12 min ago" },
  { value: "release/2.4", label: "release/2.4", commit: "7be03d1", age: "2 h ago" },
  { value: "fix/webhook-retries", label: "fix/webhook-retries", commit: "e19c8a0", age: "yesterday" },
];

const regionGroups = [
  {
    label: "Europe",
    regions: [
      { value: "fra1", label: "Frankfurt", code: "fra1", latency: 18 },
      { value: "lhr1", label: "London", code: "lhr1", latency: 24 },
    ],
  },
  {
    label: "Americas",
    regions: [
      { value: "iad1", label: "Washington, D.C.", code: "iad1", latency: 92 },
      { value: "sfo1", label: "San Francisco", code: "sfo1", latency: 148 },
    ],
  },
];

const regions = regionGroups.flatMap((group) => group.regions);

export default function Select12() {
  const [environment, setEnvironment] = useState<string | null>("preview");
  const [branch, setBranch] = useState<string | null>("main");
  const [region, setRegion] = useState<string | null>("fra1");
  const [copied, setCopied] = useState(false);
  const [queued, setQueued] = useState<string | null>(null);

  const isProduction = environment === "production";
  const command = `seven deploy --env ${environment} --branch ${branch} --region ${region}`;

  const resetFeedback = () => {
    setCopied(false);
    setQueued(null);
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <form
      aria-labelledby="select-12-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        const current = branches.find((item) => item.value === branch);
        setQueued(
          `Deploy of ${branch}@${current?.commit} to ${environment} queued`,
        );
      }}
    >
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h3 id="select-12-title" className="font-medium">
          New deployment
        </h3>
        <p className="text-sm text-muted-foreground">acme-web · Next.js</p>
      </header>

      <div className="grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="select-12-env">Environment</Label>
            <Select
              items={environments}
              value={environment}
              onValueChange={(next) => {
                setEnvironment(next);
                resetFeedback();
              }}
            >
              <SelectTrigger id="select-12-env" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {environments.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${
                        item.value === "production"
                          ? "bg-warning"
                          : "bg-muted-foreground/60"
                      }`}
                    />
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="select-12-region">Region</Label>
            <Select
              items={regions}
              value={region}
              onValueChange={(next) => {
                setRegion(next);
                resetFeedback();
              }}
            >
              <SelectTrigger id="select-12-region" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-56">
                {regionGroups.map((group, index) => (
                  <SelectGroup key={group.label}>
                    {index > 0 ? <SelectSeparator /> : null}
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.regions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        <span className="flex-1">{item.label}</span>
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {item.latency} ms
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="select-12-branch">Branch</Label>
          <Select
            items={branches}
            value={branch}
            onValueChange={(next) => {
              setBranch(next);
              resetFeedback();
            }}
          >
            <SelectTrigger id="select-12-branch" className="w-full">
              <SelectValue>
                {(value: string | null) => {
                  const current = branches.find((item) => item.value === value);
                  if (!current) return "Choose a branch";
                  return (
                    <span className="flex min-w-0 items-center gap-2">
                      <GitBranchIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      <span className="truncate font-mono text-[13px]">
                        {current.label}
                      </span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {current.commit}
                      </span>
                    </span>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {branches.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-mono text-[13px]">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.commit} · {item.age}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isProduction ? (
          <Alert>
            <TriangleAlertIcon aria-hidden="true" className="text-warning" />
            <AlertTitle>Requires approval</AlertTitle>
            <AlertDescription>
              Production deploys wait for a second maintainer before traffic
              shifts.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center gap-2 rounded-lg bg-muted py-1 pr-1 pl-3">
          <code className="min-w-0 flex-1 truncate font-mono text-xs">
            <span aria-hidden="true" className="text-muted-foreground select-none">
              ${" "}
            </span>
            {command}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? "Command copied" : "Copy CLI command"}
            onClick={copyCommand}
          >
            {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {queued ?? "Builds start within a few seconds."}
        </p>
        <Button type="submit">
          <RocketIcon aria-hidden="true" data-icon="inline-start" />
          {isProduction ? "Request deploy" : "Deploy"}
        </Button>
      </footer>
    </form>
  );
}
