"use client";

import * as React from "react";

import { FileTextIcon, HashIcon, UserIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Scope = "all" | "docs" | "channels" | "people";

type Result = {
  value: string;
  label: string;
  meta: string;
  scope: Exclude<Scope, "all">;
};

const scopes: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "docs", label: "Docs" },
  { value: "channels", label: "Channels" },
  { value: "people", label: "People" },
];

const scopeIcons = {
  docs: FileTextIcon,
  channels: HashIcon,
  people: UserIcon,
};

const results: Result[] = [
  { value: "q3-roadmap", label: "Q3 roadmap", meta: "Edited 2h ago", scope: "docs" },
  { value: "release-notes", label: "Release notes 4.2", meta: "Edited yesterday", scope: "docs" },
  { value: "onboarding", label: "Onboarding checklist", meta: "Edited Mon", scope: "docs" },
  { value: "design-review", label: "design-review", meta: "18 members", scope: "channels" },
  { value: "releases", label: "releases", meta: "42 members", scope: "channels" },
  { value: "support-escalations", label: "support-escalations", meta: "9 members", scope: "channels" },
  { value: "rosa", label: "Rosa Delgado", meta: "Release manager", scope: "people" },
  { value: "noah", label: "Noah Fischer", meta: "Support lead", scope: "people" },
];

function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-xs bg-primary/15 text-foreground">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function Command04() {
  const [query, setQuery] = React.useState("re");
  const [scope, setScope] = React.useState<Scope>("all");

  const trimmed = query.trim();
  const visible = results.filter(
    (result) =>
      (scope === "all" || result.scope === scope) &&
      result.label.toLowerCase().includes(trimmed.toLowerCase()),
  );

  return (
    <Command
      items={visible}
      mode="none"
      value={query}
      onValueChange={setQuery}
      className="w-full max-w-sm border border-border shadow-md"
    >
      <CommandInput placeholder="Search workspace..." aria-label="Search workspace" />
      <div className="flex items-center justify-between gap-2 px-1 pt-2 pb-1">
        <ToggleGroup
          aria-label="Search scope"
          size="sm"
          value={[scope]}
          onValueChange={(next) => {
            // Keep one scope selected at all times.
            if (next.length > 0) setScope(next[0] as Scope);
          }}
          className="min-w-0"
        >
          {scopes.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="h-7 px-2 text-xs aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span
          className="shrink-0 pr-1 text-xs text-muted-foreground tabular-nums max-sm:sr-only"
          aria-live="polite"
        >
          {visible.length} {visible.length === 1 ? "result" : "results"}
        </span>
      </div>
      <CommandList>
        {(result: Result) => {
          const Icon = scopeIcons[result.scope];
          return (
            <CommandItem key={result.value} value={result}>
              <Icon aria-hidden="true" className="text-muted-foreground" />
              <span className="truncate">
                <Highlight text={result.label} query={trimmed} />
              </span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {result.meta}
              </span>
            </CommandItem>
          );
        }}
      </CommandList>
      <CommandEmpty>
        Nothing in {scope === "all" ? "this workspace" : scope} matches “{trimmed}”.
      </CommandEmpty>
    </Command>
  );
}
