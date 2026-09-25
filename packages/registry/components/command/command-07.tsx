"use client";

import * as React from "react";

import {
  CalculatorIcon,
  CalendarIcon,
  FilePlusIcon,
  MailIcon,
  NotebookPenIcon,
  TerminalIcon,
  TimerIcon,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/registry/base/ui/command";
import { Kbd } from "@/registry/base/ui/kbd";

type Entry = {
  value: string;
  label: string;
  hint: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  // The calculator answer skips text filtering.
  answer?: boolean;
};

type Group = { value: string; items: Entry[] };

const launchers: Group[] = [
  {
    value: "Applications",
    items: [
      { value: "calendar", label: "Calendar", hint: "Application", icon: CalendarIcon },
      { value: "mail", label: "Mail", hint: "Application", icon: MailIcon },
      { value: "notes", label: "Notes", hint: "Application", icon: NotebookPenIcon },
      { value: "terminal", label: "Terminal", hint: "Application", icon: TerminalIcon },
    ],
  },
  {
    value: "Quick actions",
    items: [
      { value: "new-note", label: "New note", hint: "Notes", icon: FilePlusIcon },
      { value: "focus", label: "Start a 25-minute focus timer", hint: "Clock", icon: TimerIcon },
    ],
  },
];

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

// A tiny recursive-descent parser for + - * / and parentheses. No eval.
function calculate(input: string): number | null {
  const source = input
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/,/g, "");
  if (!/^[\d\s.+\-*/()]+$/.test(source) || !/\d\s*[+\-*/]/.test(source)) {
    return null;
  }
  const tokens = source.match(/\d*\.?\d+|[+\-*/()]/g) ?? [];
  let position = 0;

  function factor(): number {
    const token = tokens[position++];
    if (token === "-") return -factor();
    if (token === "(") {
      const value = expression();
      if (tokens[position++] !== ")") throw new Error("Unclosed parenthesis");
      return value;
    }
    const value = Number(token);
    if (token === undefined || Number.isNaN(value)) {
      throw new Error("Expected a number");
    }
    return value;
  }

  function term(): number {
    let value = factor();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const next = factor();
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }

  function expression(): number {
    let value = term();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = term();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  try {
    const result = expression();
    return position === tokens.length && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export default function Command07() {
  const [query, setQuery] = React.useState("1450 * 0.18");
  const [status, setStatus] = React.useState("");

  const result = calculate(query);
  const groups: Group[] =
    result === null
      ? launchers
      : [
          {
            value: "Calculator",
            items: [
              {
                value: "answer",
                label: numberFormat.format(result),
                hint: query.trim().replace(/\*/g, "×").replace(/\//g, "÷"),
                icon: CalculatorIcon,
                answer: true,
              },
            ],
          },
          ...launchers,
        ];

  function run(entry: Entry) {
    if (entry.answer) {
      navigator.clipboard?.writeText(entry.label).catch(() => {});
      setStatus(`Copied ${entry.label} to the clipboard.`);
      return;
    }
    setStatus(`Opening ${entry.label}…`);
  }

  return (
    <Command
      items={groups}
      value={query}
      onValueChange={(next, details) => {
        if (details.reason === "item-press") return;
        setQuery(next);
        setStatus("");
      }}
      filter={(item, value) => {
        const entry = item as Entry;
        return (
          entry.answer === true ||
          entry.label.toLowerCase().includes(value.trim().toLowerCase())
        );
      }}
      className="w-full max-w-md border border-border shadow-lg"
    >
      <CommandInput
        placeholder="Search apps, or type a sum like 24 * 7"
        aria-label="Search apps and actions, or calculate"
      />
      <CommandList className="mt-1">
        {(group: Group) => (
          <CommandGroup key={group.value} heading={group.value} items={group.items}>
            {(entry: Entry) =>
              entry.answer ? (
                <CommandItem
                  key={entry.value}
                  value={entry}
                  onClick={() => run(entry)}
                  className="gap-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <entry.icon aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-xl font-semibold tracking-tight tabular-nums">
                      <span className="sr-only">Result: </span>
                      {entry.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground tabular-nums">
                      {entry.hint}
                    </span>
                  </span>
                  <CommandShortcut className="tracking-normal">Copy</CommandShortcut>
                </CommandItem>
              ) : (
                <CommandItem
                  key={entry.value}
                  value={entry}
                  onClick={() => run(entry)}
                >
                  <entry.icon aria-hidden="true" className="text-muted-foreground" />
                  <span className="truncate">{entry.label}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {entry.hint}
                  </span>
                </CommandItem>
              )
            }
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty>No app or action matches “{query.trim()}”.</CommandEmpty>
      <div className="mt-1 flex min-h-9 items-center justify-between gap-3 border-t border-border px-2 pt-1 text-xs text-muted-foreground">
        <span aria-live="polite" className="min-w-0">
          {status || "Math works too: + − × ÷ and parentheses."}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <Kbd>
            <span aria-hidden="true">↵</span>
            <span className="sr-only">Enter</span>
          </Kbd>
          {result === null ? "Open" : "Copy"}
        </span>
      </div>
    </Command>
  );
}
