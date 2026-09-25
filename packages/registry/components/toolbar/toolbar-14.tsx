"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  FileCodeIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Toggle } from "@/registry/base/ui/toggle";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Line = {
  kind: "context" | "add" | "remove";
  old?: number;
  new?: number;
  text: string;
  hunk?: number;
  whitespaceOnly?: boolean;
};

const filePath = "src/billing/proration.ts";

const lines: Line[] = [
  { kind: "context", old: 12, new: 12, text: "export function prorate(" },
  { kind: "context", old: 13, new: 13, text: "  plan: Plan," },
  { kind: "remove", old: 14, text: "  days: number," },
  { kind: "add", new: 14, text: "  period: BillingPeriod,", hunk: 0 },
  { kind: "context", old: 15, new: 15, text: "): number {" },
  {
    kind: "remove",
    old: 16,
    text: "    const daily = plan.price / period.days;",
    whitespaceOnly: true,
  },
  {
    kind: "add",
    new: 16,
    text: "  const daily = plan.price / period.days;",
    hunk: 1,
    whitespaceOnly: true,
  },
  {
    kind: "remove",
    old: 17,
    text: "  return Math.round(daily * days);",
  },
  {
    kind: "add",
    new: 17,
    text: "  const cents = daily * period.remaining;",
    hunk: 2,
  },
  {
    kind: "add",
    new: 18,
    text: "  return Math.round(cents * 100) / 100;",
  },
  { kind: "context", old: 18, new: 19, text: "}" },
];

const lineStyles = {
  context: "",
  add: "bg-success/10",
  remove: "bg-destructive/10",
};

const markers = { context: " ", add: "+", remove: "-" };

export default function Toolbar14() {
  const [hideWhitespace, setHideWhitespace] = useState(false);
  const [hunk, setHunk] = useState(0);
  const [viewed, setViewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function copyPath() {
    navigator.clipboard?.writeText(filePath).catch(() => {});
    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1600);
  }

  // With whitespace hidden, an indentation-only change reads as context.
  const visible = hideWhitespace
    ? lines.flatMap((line): Line[] => {
        if (!line.whitespaceOnly) return [line];
        if (line.kind === "remove") return [];
        return [{ ...line, kind: "context", old: 16 }];
      })
    : lines;

  // Only the changes still on screen are navigable, so hiding whitespace
  // drops the indentation-only hunk from "Change n of m".
  const hunks = visible.flatMap((line) =>
    line.kind !== "context" && line.hunk !== undefined ? [line.hunk] : [],
  );
  const hunkCount = hunks.length;
  const position = Math.min(hunk, hunkCount - 1);
  const activeHunk = hunks[position];

  return (
    <section
      aria-label={`Changes to ${filePath}`}
      className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs"
    >
      <div className="flex min-w-0 items-center gap-2 border-b bg-muted/40 px-3 pt-2.5 pb-1">
        <FileCodeIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 truncate font-mono text-xs font-medium">
          {filePath}
        </span>
        <span className="ml-auto shrink-0 font-mono text-xs tabular-nums">
          <span className="text-success">+4</span>{" "}
          <span className="text-destructive">-3</span>
        </span>
      </div>

      <Toolbar
        aria-label="Diff controls"
        className="w-full flex-wrap rounded-none border-0 border-b bg-muted/40 px-2 shadow-none"
      >
        <ToolbarGroup aria-label="Navigate changes">
          <ToolbarButton
            aria-label="Previous change"
            disabled={position === 0}
            onClick={() => setHunk(position - 1)}
          >
            <ChevronUpIcon aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            aria-label="Next change"
            disabled={position === hunkCount - 1}
            onClick={() => setHunk(position + 1)}
          >
            <ChevronDownIcon aria-hidden="true" />
          </ToolbarButton>
          <span
            aria-live="polite"
            className="px-1 text-xs text-muted-foreground tabular-nums"
          >
            Change {position + 1} of {hunkCount}
          </span>
        </ToolbarGroup>
        <ToolbarSeparator className="hidden sm:block" />
        <ToolbarButton
          render={
            <Toggle
              size="sm"
              pressed={hideWhitespace}
              onPressedChange={setHideWhitespace}
            />
          }
        >
          Hide whitespace
        </ToolbarButton>
        <ToolbarGroup aria-label="File actions" className="ml-auto">
          <ToolbarButton
            aria-label={copied ? "File path copied" : "Copy file path"}
            onClick={copyPath}
          >
            {copied ? (
              <CheckIcon aria-hidden="true" className="text-success" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
          </ToolbarButton>
          <ToolbarButton
            render={
              <Toggle
                size="sm"
                variant="outline"
                pressed={viewed}
                onPressedChange={setViewed}
              />
            }
            className="data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
          >
            {viewed ? <CheckIcon aria-hidden="true" /> : null}
            Viewed
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      {viewed ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          Marked as viewed. The diff is collapsed until the file changes again.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs leading-6">
            <caption className="sr-only">
              Unified diff of {filePath}
            </caption>
            <tbody>
              {visible.map((line) => {
                const active =
                  line.kind !== "context" && line.hunk === activeHunk;
                return (
                  <tr
                    key={`${line.kind}-${line.old ?? ""}-${line.new ?? ""}`}
                    data-active={active || undefined}
                    className={`${lineStyles[line.kind]} data-active:outline data-active:-outline-offset-1 data-active:outline-ring`}
                  >
                    <td className="w-8 pr-2 text-right text-muted-foreground select-none">
                      {line.old ?? ""}
                    </td>
                    <td className="w-8 pr-2 text-right text-muted-foreground select-none">
                      {line.new ?? ""}
                    </td>
                    <td className="w-4 text-muted-foreground select-none">
                      {markers[line.kind]}
                    </td>
                    <td className="pr-4 whitespace-pre">{line.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
