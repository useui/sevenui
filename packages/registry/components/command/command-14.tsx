"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CommandIcon,
  CopyIcon,
  GitBranchIcon,
  HistoryIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/base/ui/command";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

type Deployment = {
  id: string;
  branch: string;
  message: string;
  age: string;
};

type Action = "promote" | "rollback";

type Entry = {
  value: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortcut?: string;
  run: () => void;
  // Entries that open another page show a chevron.
  nested?: boolean;
};

type Section = { value: string; items: Entry[] };

type Page =
  | { kind: "root" }
  | { kind: "pick"; action: Action }
  | { kind: "confirm"; action: Action; deployment: Deployment };

const previews: Deployment[] = [
  { id: "dpl_8f2a91", branch: "feat/gift-cards", message: "Add gift card redemption at checkout", age: "12m ago" },
  { id: "dpl_71c0de", branch: "fix/tax-rounding", message: "Round VAT per line instead of per order", age: "1h ago" },
  { id: "dpl_5b3e47", branch: "chore/deps", message: "Bump payments SDK to 4.2", age: "Yesterday" },
];

const history: Deployment[] = [
  { id: "dpl_40d9aa", branch: "main", message: "Faster product image loading", age: "2d ago" },
  { id: "dpl_3a7f12", branch: "main", message: "New shipping rates for EU", age: "5d ago" },
];

const actionCopy: Record<Action, { title: string; verb: string }> = {
  promote: { title: "Promote to production", verb: "Promote" },
  rollback: { title: "Roll back production", verb: "Roll back to" },
};

type LogLine = { id: number; text: string; time: string };

export default function Command14() {
  const [open, setOpen] = React.useState(false);
  const [pages, setPages] = React.useState<Page[]>([{ kind: "root" }]);
  const [query, setQuery] = React.useState("");
  const [production, setProduction] = React.useState<Deployment>({
    id: "dpl_62e1bf",
    branch: "main",
    message: "Checkout copy tweaks",
    age: "4h ago",
  });
  const [log, setLog] = React.useState<LogLine[]>([
    { id: 1, text: "dpl_62e1bf promoted to production", time: "09:41" },
  ]);

  const page = pages[pages.length - 1];

  // Scoped to this card (and its palette, which bubbles through the portal)
  // so ⌘K does not also trigger an app-wide search listening on document.
  function handleShortcut(event: React.KeyboardEvent) {
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.stopPropagation();
      // React may be mounted on document itself (Next.js App Router), where
      // stopPropagation cannot reach sibling listeners on the same node.
      event.nativeEvent.stopImmediatePropagation();
      handleOpenChange(!open);
    }
  }

  function record(text: string) {
    setLog((current) => [
      { id: current.length + 1, text, time: "Just now" },
      ...current,
    ]);
  }

  function push(next: Page) {
    setPages((current) => [...current, next]);
    setQuery("");
  }

  function pop() {
    setPages((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  function finish(text: string) {
    record(text);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPages([{ kind: "root" }]);
      setQuery("");
    }
  }

  function toEntry(action: Action, deployment: Deployment): Entry {
    return {
      value: deployment.id,
      label: deployment.message,
      hint: `${deployment.id} · ${deployment.branch} · ${deployment.age}`,
      icon: action === "promote" ? GitBranchIcon : HistoryIcon,
      nested: true,
      run: () => push({ kind: "confirm", action, deployment }),
    };
  }

  let sections: Section[];
  if (page.kind === "root") {
    sections = [
      {
        value: "Deployments",
        items: [
          {
            value: "promote",
            label: "Promote a preview…",
            icon: ArrowUpCircleIcon,
            nested: true,
            run: () => push({ kind: "pick", action: "promote" }),
          },
          {
            value: "rollback",
            label: "Roll back production…",
            icon: Undo2Icon,
            nested: true,
            run: () => push({ kind: "pick", action: "rollback" }),
          },
        ],
      },
      {
        value: "Project",
        items: [
          {
            value: "logs",
            label: "Open runtime logs",
            icon: ScrollTextIcon,
            shortcut: "⌘L",
            run: () => finish("Runtime logs opened in a new tab"),
          },
          {
            value: "purge",
            label: "Purge CDN cache",
            icon: RefreshCwIcon,
            run: () => finish("CDN cache purged for acme-storefront"),
          },
          {
            value: "copy-url",
            label: "Copy production URL",
            icon: CopyIcon,
            shortcut: "⌘⇧C",
            run: () => finish("Copied shop.acme.dev to clipboard"),
          },
        ],
      },
    ];
  } else if (page.kind === "pick") {
    sections = [
      {
        value:
          page.action === "promote"
            ? "Ready previews"
            : "Previous production deployments",
        items: (page.action === "promote" ? previews : history).map(
          (deployment) => toEntry(page.action, deployment),
        ),
      },
    ];
  } else {
    const { action, deployment } = page;
    sections = [
      {
        value: `${actionCopy[action].verb} ${deployment.id}?`,
        items: [
          {
            value: "confirm",
            label: `${actionCopy[action].verb} ${deployment.id}`,
            hint: `Replaces ${production.id}. Traffic switches in about 10 seconds.`,
            icon: CircleCheckIcon,
            run: () => {
              setProduction(deployment);
              finish(
                action === "promote"
                  ? `${deployment.id} promoted to production`
                  : `Production rolled back to ${deployment.id}`,
              );
            },
          },
          {
            value: "cancel",
            label: "Cancel",
            icon: XIcon,
            run: pop,
          },
        ],
      },
    ];
  }

  const crumbs = pages.slice(1).map((entry) =>
    entry.kind === "pick"
      ? actionCopy[entry.action].title
      : entry.kind === "confirm"
        ? entry.deployment.id
        : "",
  );

  return (
    <section
      aria-labelledby="command-14-title"
      onKeyDown={handleShortcut}
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <h3 id="command-14-title" className="truncate text-sm font-medium">
            acme-storefront
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            shop.acme.dev
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <CommandIcon aria-hidden="true" />
          Actions
          <KbdGroup className="ml-1 hidden sm:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </header>

      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Production</span>
          <Badge variant="secondary" className="gap-1">
            <span
              className="size-1.5 rounded-full bg-success"
              aria-hidden="true"
            />
            Ready
          </Badge>
        </div>
        <p className="truncate text-sm font-medium">{production.message}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {production.id} · {production.branch}
        </p>
      </div>

      <div className="border-t border-border p-4">
        <h4 className="text-xs font-medium text-muted-foreground">Activity</h4>
        <ol aria-live="polite" className="mt-2 flex flex-col gap-1.5">
          {log.slice(0, 4).map((line) => (
            <li key={line.id} className="flex items-baseline gap-3 text-sm">
              <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">
                {line.time}
              </span>
              <span className="min-w-0 truncate">{line.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Project actions"
        description="Deploy, roll back and manage acme-storefront."
      >
        <Command
          items={sections}
          value={query}
          onValueChange={(next, details) => {
            if (details.reason === "item-press") return;
            setQuery(next);
          }}
          filter={(item, value) => {
            const entry = item as Entry;
            const needle = value.trim().toLowerCase();
            // Deployments are found by message, id or branch.
            return `${entry.label} ${entry.hint ?? ""}`
              .toLowerCase()
              .includes(needle);
          }}
          className="rounded-lg border-none"
        >
          {crumbs.length > 0 && (
            <nav
              aria-label="Command path"
              className="flex flex-wrap items-center gap-1 px-2 pt-2 text-xs text-muted-foreground"
            >
              <span>Actions</span>
              {crumbs.map((crumb) => (
                <React.Fragment key={crumb}>
                  <ChevronRightIcon className="size-3" aria-hidden="true" />
                  <span className="font-medium text-foreground">{crumb}</span>
                </React.Fragment>
              ))}
            </nav>
          )}
          <CommandInput
            placeholder={
              page.kind === "root"
                ? "Search project actions…"
                : page.kind === "pick"
                  ? "Filter by message, id or branch…"
                  : "Confirm or cancel…"
            }
            aria-label="Search project actions"
            onKeyDown={(event) => {
              if (event.key === "Backspace" && query === "" && pages.length > 1) {
                event.preventDefault();
                pop();
              }
            }}
          />
          <CommandList>
            {(section: Section) => (
              <CommandGroup
                key={section.value}
                heading={section.value}
                items={section.items}
              >
                {(entry: Entry) => (
                  <CommandItem
                    key={entry.value}
                    value={entry}
                    onClick={entry.run}
                    className={entry.hint ? "items-start" : undefined}
                  >
                    <entry.icon
                      className={
                        entry.hint
                          ? "mt-0.5 text-muted-foreground"
                          : "text-muted-foreground"
                      }
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{entry.label}</span>
                      {entry.hint && (
                        <span className="truncate text-xs text-muted-foreground">
                          {entry.hint}
                        </span>
                      )}
                    </span>
                    {entry.shortcut && (
                      <CommandShortcut>{entry.shortcut}</CommandShortcut>
                    )}
                    {entry.nested && (
                      <ChevronRightIcon
                        className="ml-auto text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
          <CommandEmpty>No matching action.</CommandEmpty>
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> Select
            </span>
            {pages.length > 1 && (
              <span className="flex items-center gap-1.5">
                <Kbd>⌫</Kbd> Back
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd> Close
            </span>
          </div>
        </Command>
      </CommandDialog>
    </section>
  );
}
