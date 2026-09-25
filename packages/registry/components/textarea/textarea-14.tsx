"use client";

import { CheckIcon, CircleAlertIcon, CopyIcon, PlusIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const source =
  "Hi {name}, invoice {invoiceId} for {amount} is due on {dueDate}. Pay online to keep your workspace active.";

const initialTranslation =
  "Hallo {name}, die Rechnung {invoiceId} über {betrag} ist am {dueDate} fällig. Bezahle online, damit dein Workspace aktiv bleibt.";

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

function placeholdersIn(text: string) {
  return Array.from(text.matchAll(PLACEHOLDER_PATTERN), (match) => match[1]);
}

const required = placeholdersIn(source);

export default function Textarea14() {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [translation, setTranslation] = useState(initialTranslation);
  const [approved, setApproved] = useState(false);

  const found = placeholdersIn(translation);
  const missing = required.filter((name) => !found.includes(name));
  const unknown = [...new Set(found.filter((name) => !required.includes(name)))];
  const hasIssues = missing.length > 0 || unknown.length > 0 || !translation.trim();
  const lengthDelta = Math.round(
    ((translation.length - source.length) / source.length) * 100,
  );

  function update(value: string) {
    setTranslation(value);
    setApproved(false);
  }

  function insertPlaceholder(name: string) {
    const textarea = textareaRef.current;
    const token = `{${name}}`;
    const start = textarea?.selectionStart ?? translation.length;
    const end = textarea?.selectionEnd ?? translation.length;
    update(translation.slice(0, start) + token + translation.slice(end));
    // Restore the caret after React commits the new value.
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <form
      aria-labelledby={`${id}-key`}
      className="flex w-full max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasIssues) setApproved(true);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-key`} className="min-w-0 truncate font-mono text-sm font-medium">
          billing.invoice.due_reminder
        </h3>
        <Badge variant="outline">English to German</Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Source (en-US)</p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => update(source)}
          >
            <CopyIcon aria-hidden="true" />
            Copy source
          </Button>
        </div>
        <p className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">{source}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-translation`}>Translation (de-DE)</Label>
        <Textarea
          ref={textareaRef}
          id={`${id}-translation`}
          lang="de"
          value={translation}
          onChange={(event) => update(event.target.value)}
          aria-invalid={hasIssues || undefined}
          aria-describedby={`${id}-check`}
          className="min-h-24 leading-relaxed"
        />
        <fieldset className="flex min-w-0 flex-wrap items-center gap-1.5">
          <legend className="sr-only">Placeholders from the source</legend>
          {required.map((name) => {
            const present = found.includes(name);
            return (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => insertPlaceholder(name)}
                aria-label={
                  present
                    ? `Insert {${name}} again, already used`
                    : `Insert missing {${name}}`
                }
                className={
                  present
                    ? "font-mono text-muted-foreground"
                    : "border-destructive/50 font-mono text-destructive"
                }
              >
                {present ? (
                  <CheckIcon aria-hidden="true" className="text-success" />
                ) : (
                  <PlusIcon aria-hidden="true" />
                )}
                {`{${name}}`}
              </Button>
            );
          })}
        </fieldset>
      </div>

      <div
        id={`${id}-check`}
        aria-live="polite"
        className="flex flex-col gap-1 text-sm"
      >
        {missing.length > 0 ? (
          <p className="flex items-start gap-1.5 text-destructive">
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Missing {missing.map((name) => `{${name}}`).join(", ")}. Click a
            placeholder to insert it at the cursor.
          </p>
        ) : null}
        {unknown.length > 0 ? (
          <p className="flex items-start gap-1.5 text-destructive">
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {unknown.map((name) => `{${name}}`).join(", ")} is not in the source.
            Placeholder names must stay in English.
          </p>
        ) : null}
        {!hasIssues ? (
          <p className="text-muted-foreground">
            {approved
              ? "Approved. Ships with the next release."
              : "All placeholders match the source."}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground tabular-nums">
          {lengthDelta > 0
            ? `${lengthDelta}% longer than the source. Check it still fits the email preview.`
            : "Same length or shorter than the source."}
        </p>
      </div>

      <Button type="submit" className="self-end" disabled={hasIssues || approved}>
        Approve translation
      </Button>
    </form>
  );
}
