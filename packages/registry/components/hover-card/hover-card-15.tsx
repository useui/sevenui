"use client";

import * as React from "react";
import {
  ArrowRightIcon,
  CircleCheckIcon,
  PackageIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type Bump = "patch" | "minor" | "major";

type Dependency = {
  name: string;
  current: string;
  latest: string;
  bump: Bump;
  description: string;
  license: string;
  weeklyDownloads: string;
  size: string;
  published: string;
  changes: { text: string; breaking?: boolean }[];
};

const dependencies: Dependency[] = [
  {
    name: "zod",
    current: "4.1.8",
    latest: "4.1.12",
    bump: "patch",
    description: "TypeScript-first schema validation with static type inference.",
    license: "MIT",
    weeklyDownloads: "48.2M",
    size: "4.1 MB",
    published: "3 days ago",
    changes: [
      { text: "Fix discriminated unions with optional keys" },
      { text: "Faster error formatting for deep objects" },
    ],
  },
  {
    name: "date-fns",
    current: "4.0.0",
    latest: "4.3.0",
    bump: "minor",
    description: "Modern JavaScript date utility library.",
    license: "MIT",
    weeklyDownloads: "31.7M",
    size: "21.9 MB",
    published: "2 weeks ago",
    changes: [
      { text: "Add intervalToDuration rounding option" },
      { text: "New locales: Kazakh, Uzbek (Cyrillic)" },
    ],
  },
  {
    name: "stripe",
    current: "17.7.0",
    latest: "19.1.0",
    bump: "major",
    description: "Stripe API wrapper for Node.js.",
    license: "MIT",
    weeklyDownloads: "4.6M",
    size: "8.3 MB",
    published: "6 days ago",
    changes: [
      { text: "Pins API version 2026-08-27", breaking: true },
      { text: "Drops Node.js 18 support", breaking: true },
      { text: "Typed webhook event payloads" },
    ],
  },
];

const bumpVariant: Record<Bump, "outline" | "secondary" | "destructive"> = {
  patch: "outline",
  minor: "secondary",
  major: "destructive",
};

function PackageDetails({
  dependency,
  updated,
}: {
  dependency: Dependency;
  updated: boolean;
}) {
  const breaking = dependency.changes.filter((change) => change.breaking);

  return (
    <HoverCard>
      <HoverCardTrigger
        href={`https://www.npmjs.com/package/${dependency.name}`}
        target="_blank"
        rel="noreferrer"
        delay={300}
        className="truncate rounded-sm font-mono text-sm font-medium outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {dependency.name}
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="grid gap-1 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-medium">{dependency.name}</p>
            <Badge variant="outline">{dependency.license}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {dependency.description}
          </p>
        </div>
        <dl className="grid grid-cols-3 border-y text-xs">
          <div className="grid gap-0.5 px-3 py-2">
            <dt className="text-muted-foreground">Weekly</dt>
            <dd className="font-medium tabular-nums">
              {dependency.weeklyDownloads}
            </dd>
          </div>
          <div className="grid gap-0.5 border-x px-3 py-2">
            <dt className="text-muted-foreground">Unpacked</dt>
            <dd className="font-medium tabular-nums">{dependency.size}</dd>
          </div>
          <div className="grid gap-0.5 px-3 py-2">
            <dt className="text-muted-foreground">Published</dt>
            <dd className="font-medium">{dependency.published}</dd>
          </div>
        </dl>
        <div className="grid gap-2 p-3">
          <p className="text-xs font-medium">
            What changed in{" "}
            <span className="font-mono">{dependency.latest}</span>
          </p>
          <ul className="grid gap-1.5 text-xs">
            {dependency.changes.map((change) => (
              <li key={change.text} className="flex items-start gap-2">
                {change.breaking ? (
                  <TriangleAlertIcon
                    aria-hidden="true"
                    className="mt-px size-3.5 shrink-0 text-destructive"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                  />
                )}
                <span
                  className={change.breaking ? "text-foreground" : "text-muted-foreground"}
                >
                  {change.breaking && <span className="sr-only">Breaking: </span>}
                  {change.text}
                </span>
              </li>
            ))}
          </ul>
          <p
            className={`mt-1 rounded-md px-2 py-1.5 text-xs ${
              updated
                ? "bg-success/10 text-foreground"
                : breaking.length > 0
                  ? "bg-destructive/10 text-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {updated
              ? `Installed ${dependency.latest}. Run your test suite before merging.`
              : breaking.length > 0
                ? `${breaking.length} breaking changes. Review the migration guide before updating.`
                : "Safe to update: no breaking changes reported."}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard15() {
  const [updated, setUpdated] = React.useState<Set<string>>(() => new Set());

  const pending = dependencies.filter((dep) => !updated.has(dep.name));
  const safe = pending.filter((dep) => dep.bump !== "major");

  function update(names: string[]) {
    setUpdated((previous) => new Set([...previous, ...names]));
  }

  return (
    <section
      aria-labelledby="hover-card-15-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <PackageIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <div className="min-w-0">
            <h3 id="hover-card-15-title" className="text-sm font-medium">
              Dependency updates
            </h3>
            <p
              className="text-xs text-muted-foreground"
              aria-live="polite"
            >
              {pending.length === 0
                ? "All packages are up to date"
                : `${pending.length} of ${dependencies.length} packages outdated`}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={safe.length === 0}
          onClick={() => update(safe.map((dep) => dep.name))}
        >
          {safe.length > 0 ? `Update ${safe.length} safe` : "Safe updates done"}
        </Button>
      </header>
      <ul className="divide-y">
        {dependencies.map((dependency) => {
          const isUpdated = updated.has(dependency.name);

          return (
            <li
              key={dependency.name}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
            >
              <div className="grid min-w-0 flex-1 gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <PackageDetails dependency={dependency} updated={isUpdated} />
                  {!isUpdated && (
                    <Badge variant={bumpVariant[dependency.bump]}>
                      {dependency.bump}
                    </Badge>
                  )}
                </div>
                <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
                  {isUpdated ? (
                    <span>{dependency.latest}</span>
                  ) : (
                    <>
                      <span>{dependency.current}</span>
                      <ArrowRightIcon aria-hidden="true" className="size-3" />
                      <span className="sr-only">to</span>
                      <span className="text-foreground">
                        {dependency.latest}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {isUpdated ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleCheckIcon
                    aria-hidden="true"
                    className="size-4 text-success"
                  />
                  Up to date
                </span>
              ) : (
                <Button
                  size="sm"
                  variant={
                    dependency.bump === "major" ? "outline" : "secondary"
                  }
                  onClick={() => update([dependency.name])}
                >
                  Update
                  <span className="sr-only">
                    {dependency.name} to {dependency.latest}
                  </span>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
