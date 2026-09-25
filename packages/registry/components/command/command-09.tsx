"use client";

import * as React from "react";
import { FilePlusIcon, FileTextIcon, GlobeIcon, Link2OffIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Target = {
  value: string;
  label: string;
  detail: string;
  kind: "page" | "url" | "create";
};

type Group = { value: string; items: Target[] };

type Link = { label: string; href: string; external: boolean };

const pages: Target[] = [
  { value: "q4-targets", label: "Q4 targets", detail: "Company / Planning", kind: "page" },
  { value: "okr-guide", label: "How we write OKRs", detail: "Company / Handbook", kind: "page" },
  { value: "roadmap", label: "Product roadmap 2026", detail: "Product", kind: "page" },
  { value: "pricing-review", label: "Pricing review notes", detail: "Product / Research", kind: "page" },
  { value: "hiring-plan", label: "Hiring plan H2", detail: "People / Planning", kind: "page" },
];

const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

function buildGroups(query: string): Group[] {
  const trimmed = query.trim();
  if (URL_PATTERN.test(trimmed)) {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return [
      {
        value: "Web",
        items: [{ value: "url", label: href, detail: "External link", kind: "url" }],
      },
    ];
  }
  const groups: Group[] = [
    { value: trimmed ? "Pages" : "Recent pages", items: pages },
  ];
  const exists = pages.some(
    (page) => page.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (trimmed && !exists) {
    groups.push({
      value: "New",
      items: [
        {
          value: "create",
          label: trimmed,
          detail: "Company / Planning",
          kind: "create",
        },
      ],
    });
  }
  return groups;
}

export default function Command09() {
  const [query, setQuery] = React.useState("");
  const [link, setLink] = React.useState<Link | null>(null);

  function apply(target: Target) {
    setLink({
      label: target.kind === "url" ? target.label.replace(/^https?:\/\//i, "") : target.label,
      href: target.kind === "url" ? target.label : `/wiki/${target.value}`,
      external: target.kind === "url",
    });
    setQuery("");
  }

  return (
    <section
      aria-labelledby="command-09-title"
      className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground"
    >
      <div className="flex flex-col gap-1 px-1">
        <h3 id="command-09-title" className="text-sm font-medium">
          Add link
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          Before planning starts, review the{" "}
          {link ? (
            <a
              href={link.href}
              onClick={(event) => event.preventDefault()}
              className="font-medium text-foreground underline decoration-primary/60 underline-offset-2 hover:decoration-primary"
              title={link.label}
            >
              quarterly targets
            </a>
          ) : (
            <mark className="rounded-xs bg-primary/15 px-0.5 text-foreground">
              quarterly targets
            </mark>
          )}{" "}
          with your team.
        </p>
      </div>

      <Command
        items={buildGroups(query)}
        value={query}
        onValueChange={(next, details) => {
          if (details.reason === "item-press") return;
          setQuery(next);
        }}
        filter={(item, value) => {
          const target = item as Target;
          if (target.kind !== "page") return true;
          const needle = value.trim().toLowerCase();
          return `${target.label} ${target.detail}`.toLowerCase().includes(needle);
        }}
        className="rounded-lg! border border-border bg-background"
      >
        <CommandInput
          placeholder="Search pages or paste a URL"
          aria-label="Link to a page or URL"
        />
        <CommandList className="max-h-56">
          {(group: Group) => (
            <CommandGroup key={group.value} heading={group.value} items={group.items}>
              {(target: Target) => (
                <CommandItem
                  key={target.value}
                  value={target}
                  onClick={() => apply(target)}
                >
                  {target.kind === "url" ? (
                    <GlobeIcon aria-hidden="true" className="text-muted-foreground" />
                  ) : target.kind === "create" ? (
                    <FilePlusIcon aria-hidden="true" className="text-muted-foreground" />
                  ) : (
                    <FileTextIcon aria-hidden="true" className="text-muted-foreground" />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">
                      {target.kind === "create" ? (
                        <>
                          Create page{" "}
                          <span className="font-medium">“{target.label}”</span>
                        </>
                      ) : (
                        target.label
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {target.kind === "create" ? `in ${target.detail}` : target.detail}
                    </span>
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
        <CommandEmpty>No page matches. Paste a full URL instead.</CommandEmpty>
      </Command>

      <div className="flex min-h-8 items-center justify-between gap-2 px-1">
        <p
          aria-live="polite"
          className="min-w-0 truncate text-xs text-muted-foreground"
        >
          {link ? (
            <>
              Linked to{" "}
              <span className="text-foreground">
                {link.external ? link.label : `“${link.label}”`}
              </span>
            </>
          ) : (
            "Pick a page to link the highlighted text."
          )}
        </p>
        {link && (
          <Button variant="ghost" size="sm" onClick={() => setLink(null)}>
            <Link2OffIcon aria-hidden="true" />
            Unlink
          </Button>
        )}
      </div>
    </section>
  );
}
