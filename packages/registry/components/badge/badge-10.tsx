"use client";

import * as React from "react";
import { ListFilter, X } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

type Field = "status" | "priority";

type Filter = { field: Field; value: string };

const options: { field: Field; label: string; values: string[] }[] = [
  { field: "status", label: "Status", values: ["Open", "In review", "Closed"] },
  { field: "priority", label: "Priority", values: ["Urgent", "High", "Low"] },
];

const issues = [
  { id: "API-481", title: "Webhook retries ignore backoff", status: "Open", priority: "Urgent" },
  { id: "API-476", title: "Rate limit headers missing on 429", status: "In review", priority: "High" },
  { id: "API-470", title: "Pagination cursor expires too early", status: "Open", priority: "High" },
  { id: "API-462", title: "Typo in OAuth consent screen", status: "Closed", priority: "Low" },
  { id: "API-459", title: "Batch endpoint drops empty rows", status: "Open", priority: "Low" },
];

const INITIAL: Filter[] = [
  { field: "status", value: "Open" },
  { field: "priority", value: "Urgent" },
  { field: "priority", value: "High" },
];

const fieldLabel: Record<Field, string> = {
  status: "Status",
  priority: "Priority",
};

export default function Badge10() {
  const [filters, setFilters] = React.useState<Filter[]>(INITIAL);
  const addRef = React.useRef<HTMLButtonElement>(null);

  const has = (field: Field, value: string) =>
    filters.some((filter) => filter.field === field && filter.value === value);

  const toggle = (field: Field, value: string, checked: boolean) =>
    setFilters((prev) =>
      checked
        ? [...prev, { field, value }]
        : prev.filter((f) => !(f.field === field && f.value === value)),
    );

  const results = issues.filter((issue) =>
    (["status", "priority"] as const).every((field) => {
      const active = filters.filter((filter) => filter.field === field);
      return (
        active.length === 0 ||
        active.some((filter) => filter.value === issue[field])
      );
    }),
  );

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button ref={addRef} variant="outline" size="sm">
                <ListFilter aria-hidden="true" data-icon="inline-start" />
                Filter
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-48">
            {options.map((option, index) => (
              <React.Fragment key={option.field}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{option.label}</DropdownMenuLabel>
                  {option.values.map((value) => (
                    <DropdownMenuCheckboxItem
                      key={value}
                      checked={has(option.field, value)}
                      onCheckedChange={(checked) =>
                        toggle(option.field, value, checked)
                      }
                    >
                      {value}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ul aria-label="Active filters" className="contents">
          {filters.map((filter) => (
            <li key={`${filter.field}-${filter.value}`} className="flex">
              <Badge variant="secondary" className="h-6 gap-1 pr-0.5 pl-2">
                <span className="text-muted-foreground">
                  {fieldLabel[filter.field]}:
                </span>
                {filter.value}
                <button
                  type="button"
                  aria-label={`Remove filter ${fieldLabel[filter.field]}: ${filter.value}`}
                  onClick={() => {
                    toggle(filter.field, filter.value, false);
                    addRef.current?.focus();
                  }}
                  className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>

        {filters.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setFilters([]);
              addRef.current?.focus();
            }}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-border">
        <p
          aria-live="polite"
          className="border-b border-border px-3 py-2 text-xs text-muted-foreground tabular-nums"
        >
          {results.length} of {issues.length} issues
        </p>
        {results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No issues match these filters.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {results.map((issue) => (
              <li
                key={issue.id}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {issue.id}
                </span>
                <span className="min-w-0 flex-1 truncate">{issue.title}</span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {issue.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
