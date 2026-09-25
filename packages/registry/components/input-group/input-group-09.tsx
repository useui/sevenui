"use client";

import { useId, useState } from "react";
import { ListFilterIcon, XIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

type Filter = { key: FilterKey; value: string };
type FilterKey = "status" | "assignee" | "label";

const issues = [
  { id: "NW-412", title: "Invoice PDF cuts off the tax line", status: "open", assignee: "maya", label: "bug" },
  { id: "NW-409", title: "Add SSO for the billing portal", status: "open", assignee: "diego", label: "feature" },
  { id: "NW-398", title: "Retry failed card charges nightly", status: "in-review", assignee: "maya", label: "feature" },
  { id: "NW-391", title: "Export button ignores date range", status: "open", assignee: "priya", label: "bug" },
  { id: "NW-377", title: "Dunning emails go out twice", status: "closed", assignee: "diego", label: "bug" },
];

const keys: { key: FilterKey; hint: string }[] = [
  { key: "status", hint: "open, in-review, closed" },
  { key: "assignee", hint: "maya, diego, priya" },
  { key: "label", hint: "bug, feature" },
];

const TOKEN_PATTERN = /^(status|assignee|label):(\S+)$/i;

export default function InputGroup09() {
  const id = useId();
  const [filters, setFilters] = useState<Filter[]>([
    { key: "status", value: "open" },
    { key: "label", value: "bug" },
  ]);
  const [draft, setDraft] = useState("");

  const words = draft.trim().toLowerCase();
  const results = issues.filter(
    (issue) =>
      filters.every((filter) => issue[filter.key] === filter.value) &&
      (!words || issue.title.toLowerCase().includes(words)),
  );

  // "status:open" followed by a space turns into a token.
  function handleChange(value: string) {
    const parts = value.split(" ");
    const last = parts.length > 1 ? parts[parts.length - 2] : "";
    const match = last.match(TOKEN_PATTERN);
    if (value.endsWith(" ") && match) {
      const key = match[1].toLowerCase() as FilterKey;
      const next = { key, value: match[2].toLowerCase() };
      setFilters((current) => [
        ...current.filter((filter) => filter.key !== key),
        next,
      ]);
      setDraft(parts.slice(0, -2).join(" "));
      return;
    }
    setDraft(value);
  }

  function removeFilter(key: FilterKey) {
    setFilters((current) => current.filter((filter) => filter.key !== key));
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Label htmlFor={`${id}-query`}>Filter issues</Label>
      <InputGroup className="h-auto min-h-8 flex-wrap gap-1 py-1 pr-1">
        <InputGroupAddon className="py-0">
          <ListFilterIcon aria-hidden="true" />
        </InputGroupAddon>
        <ul aria-label="Active filters" className="contents">
          {filters.map((filter) => (
            <li
              key={filter.key}
              className="flex h-6 max-w-full items-center overflow-hidden rounded-md border border-border text-xs"
            >
              <span className="bg-muted px-1.5 py-0.5 text-muted-foreground">
                {filter.key}
              </span>
              <span className="truncate px-1.5 font-medium">{filter.value}</span>
              <InputGroupButton
                size="icon-xs"
                className="size-6 rounded-none"
                aria-label={`Remove ${filter.key} filter`}
                onClick={() => removeFilter(filter.key)}
              >
                <XIcon aria-hidden="true" />
              </InputGroupButton>
            </li>
          ))}
        </ul>
        <InputGroupInput
          id={`${id}-query`}
          value={draft}
          placeholder={filters.length ? "Search titles" : "Try label:bug"}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`${id}-query-hint ${id}-query-count`}
          className="h-6 min-w-28 px-1.5"
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !draft && filters.length) {
              removeFilter(filters[filters.length - 1].key);
            }
          }}
        />
      </InputGroup>
      <p id={`${id}-query-hint`} className="text-xs text-muted-foreground">
        Type{" "}
        {keys.map((item, index) => (
          <span key={item.key}>
            <code className="font-mono text-foreground">{item.key}:</code>
            <span className="sr-only"> ({item.hint})</span>
            {index < keys.length - 1 ? ", " : ""}
          </span>
        ))}{" "}
        then a value and a space. Backspace removes the last filter.
      </p>
      <div className="mt-1 rounded-lg border border-border">
        <p
          id={`${id}-query-count`}
          aria-live="polite"
          className="border-b border-border px-3 py-2 text-xs text-muted-foreground tabular-nums"
        >
          {results.length} of {issues.length} issues
        </p>
        {results.length ? (
          <ul className="divide-y divide-border">
            {results.map((issue) => (
              <li key={issue.id} className="flex items-baseline gap-3 px-3 py-2">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {issue.id}
                </span>
                <span className="min-w-0 truncate text-sm">{issue.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No issues match. Remove a filter to widen the search.
          </p>
        )}
      </div>
    </div>
  );
}
