"use client";

import * as React from "react";
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Kbd } from "@/registry/base/ui/kbd";

const integrations = [
  { name: "GitHub", category: "Source control" },
  { name: "GitLab", category: "Source control" },
  { name: "Linear", category: "Issue tracking" },
  { name: "Jira", category: "Issue tracking" },
  { name: "Slack", category: "Messaging" },
  { name: "Figma", category: "Design" },
];

const suggestions = ["Slack", "Linear", "Figma"];

export default function Empty10() {
  const [query, setQuery] = React.useState("Notion");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const term = query.trim().toLowerCase();
  const results = integrations.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term),
  );

  const search = (value: string) => {
    setQuery(value);
    inputRef.current?.focus();
  };

  return (
    <div className="grid w-full max-w-md gap-3">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          aria-label="Search integrations"
          placeholder="Search integrations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setQuery("");
          }}
        />
        {query ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onClick={() => search("")}
            >
              <XIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <div className="min-h-64 rounded-xl border">
        <p aria-live="polite" className="sr-only">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
        {results.length > 0 ? (
          <ul className="divide-y">
            {results.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.category}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="break-words">
                No integrations match &ldquo;{query.trim()}&rdquo;
              </EmptyTitle>
              <EmptyDescription>
                Check the spelling, or try one of the popular ones below.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-1.5">
                {suggestions.map((name) => (
                  <Button
                    key={name}
                    size="xs"
                    variant="secondary"
                    onClick={() => search(name)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Press <Kbd>Esc</Kbd> to clear the search
              </p>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
