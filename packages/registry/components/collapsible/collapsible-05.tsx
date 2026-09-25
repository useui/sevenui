"use client";

import * as React from "react";

import {
  ChevronDownIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

const environments = [
  {
    id: "production",
    name: "Production",
    vars: [
      { key: "DATABASE_URL", value: "postgres://prod-db.internal:5432/app" },
      { key: "STRIPE_MODE", value: "live" },
      { key: "LOG_LEVEL", value: "warn" },
    ],
  },
  {
    id: "preview",
    name: "Preview",
    vars: [
      { key: "DATABASE_URL", value: "postgres://preview-db.internal:5432/app" },
      { key: "STRIPE_MODE", value: "test" },
    ],
  },
  {
    id: "development",
    name: "Development",
    vars: [
      { key: "DATABASE_URL", value: "postgres://localhost:5432/app" },
      { key: "LOG_LEVEL", value: "debug" },
    ],
  },
];

export default function Collapsible05() {
  const [openIds, setOpenIds] = React.useState<string[]>(["production"]);
  const allOpen = openIds.length === environments.length;

  const setOpen = (id: string, open: boolean) => {
    setOpenIds((current) =>
      open ? [...current, id] : current.filter((value) => value !== id),
    );
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Environment variables</h3>
          <p className="text-xs text-muted-foreground">
            {openIds.length} of {environments.length} expanded
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setOpenIds(allOpen ? [] : environments.map((env) => env.id))
          }
        >
          {allOpen ? (
            <ChevronsDownUpIcon aria-hidden="true" />
          ) : (
            <ChevronsUpDownIcon aria-hidden="true" />
          )}
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {environments.map((env) => (
          <Collapsible
            key={env.id}
            open={openIds.includes(env.id)}
            onOpenChange={(open) => setOpen(env.id, open)}
            className="rounded-lg border bg-card"
          >
            <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <ChevronDownIcon
                aria-hidden="true"
                className="size-4 -rotate-90 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-0"
              />
              <span className="flex-1">{env.name}</span>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {env.vars.length} variables
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <dl className="flex flex-col border-t px-3 py-2 font-mono text-xs">
                {env.vars.map((variable) => (
                  <div
                    key={variable.key}
                    className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:gap-3"
                  >
                    <dt className="shrink-0 font-medium sm:w-32">
                      {variable.key}
                    </dt>
                    <dd className="min-w-0 truncate text-muted-foreground">
                      {variable.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
