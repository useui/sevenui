"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const initialUrls = `https://app.northwind.dev/auth/callback
https://staging.northwind.dev/auth/callback
http://localhost:3000/auth/callback
http://northwind.dev/auth/callback
https://*.preview.northwind.dev/auth/callback`;

type LineIssue = { line: number; message: string };

function validate(raw: string) {
  const lines = raw.split("\n");
  const seen = new Set<string>();
  const issues: LineIssue[] = [];
  let valid = 0;

  lines.forEach((text, index) => {
    const value = text.trim();
    if (!value) return;
    const line = index + 1;
    if (value.includes("*")) {
      issues.push({ line, message: "Wildcards are not supported." });
      return;
    }
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      issues.push({ line, message: "Not a valid URL." });
      return;
    }
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
      issues.push({ line, message: "Use https outside localhost." });
      return;
    }
    if (seen.has(value)) {
      issues.push({ line, message: "Duplicate of an earlier line." });
      return;
    }
    seen.add(value);
    valid += 1;
  });

  return { lineCount: lines.length, issues, valid };
}

export default function Textarea12() {
  const id = useId();
  const [urls, setUrls] = useState(initialUrls);
  const [saved, setSaved] = useState(false);

  const { lineCount, issues, valid } = validate(urls);
  const badLines = new Set(issues.map((issue) => issue.line));
  const hasIssues = issues.length > 0;

  return (
    <form
      className="flex w-full max-w-lg flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasIssues) setSaved(true);
      }}
    >
      <Label htmlFor={`${id}-urls`}>Allowed redirect URLs</Label>
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        One URL per line. Sign-in only returns users to an exact match.
      </p>
      <div className="flex overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:bg-input/30">
        <div
          aria-hidden="true"
          className="shrink-0 border-r border-border bg-muted/50 py-2 font-mono text-xs leading-6 tabular-nums select-none"
        >
          {Array.from({ length: lineCount }, (_, index) => {
            const line = index + 1;
            return (
              <div
                key={line}
                className={
                  badLines.has(line)
                    ? "bg-destructive/10 px-2.5 text-right text-destructive"
                    : "px-2.5 text-right text-muted-foreground"
                }
              >
                {line}
              </div>
            );
          })}
        </div>
        <Textarea
          id={`${id}-urls`}
          value={urls}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-invalid={hasIssues || undefined}
          aria-describedby={`${id}-hint ${id}-issues`}
          onChange={(event) => {
            setUrls(event.target.value);
            setSaved(false);
          }}
          className="min-h-32 resize-none rounded-none border-0 bg-transparent font-mono text-xs leading-6 shadow-none focus-visible:ring-0 aria-invalid:ring-0 md:text-xs dark:bg-transparent"
        />
      </div>

      <div id={`${id}-issues`} aria-live="polite">
        {hasIssues ? (
          <ul className="flex flex-col gap-1 text-sm text-destructive">
            {issues.map((issue) => (
              <li key={issue.line} className="flex items-start gap-1.5">
                <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-medium tabular-nums">Line {issue.line}:</span>{" "}
                  {issue.message}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CircleCheckIcon aria-hidden="true" className="size-4 shrink-0 text-success" />
            {saved
              ? `Saved. ${valid} redirect ${valid === 1 ? "URL is" : "URLs are"} live.`
              : `${valid} ${valid === 1 ? "URL" : "URLs"} ready to save.`}
          </p>
        )}
      </div>

      <Button type="submit" className="mt-2 self-end" disabled={hasIssues || saved}>
        Save URLs
      </Button>
    </form>
  );
}
