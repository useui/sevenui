"use client";

import * as React from "react";
import { ArchiveRestoreIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

const project = "acme-marketing-site";

const losses = [
  { label: "Deployments", value: "214" },
  { label: "Custom domains", value: "3" },
  { label: "Env variables", value: "18" },
];

export default function Form07() {
  const titleId = React.useId();
  const [typed, setTyped] = React.useState("");
  const [understood, setUnderstood] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const matches = typed === project;

  if (deleted) {
    return (
      <div
        role="status"
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">{project} was deleted</h2>
          <p className="text-sm text-muted-foreground">
            Its domains are released now. You can restore the project and its
            deployments until October 25.
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setTyped("");
            setUnderstood(false);
            setDeleted(false);
          }}
        >
          <ArchiveRestoreIcon aria-hidden="true" data-icon="inline-start" />
          Restore project
        </Button>
      </div>
    );
  }

  return (
    <Form
      aria-labelledby={titleId}
      validationMode="onChange"
      className="w-full max-w-md gap-5 rounded-xl border border-destructive/30 bg-card p-5"
      onFormSubmit={() => {
        if (matches && understood) setDeleted(true);
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
          <TriangleAlertIcon
            aria-hidden="true"
            className="size-4 text-destructive"
          />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="font-semibold">
            Delete project
          </h2>
          <p className="text-sm text-muted-foreground">
            This removes {project} for everyone on the Acme team.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-muted/40 text-center">
        {losses.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 px-2 py-3">
            <dt className="order-2 text-xs text-muted-foreground">
              {item.label}
            </dt>
            <dd className="order-1 text-lg font-semibold tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <FieldGroup className="gap-4">
        <Field
          name="confirmName"
          validate={(value) => {
            const text = String(value ?? "");
            if (!text || text === project) return null;
            return project.startsWith(text)
              ? null
              : "The name doesn't match. Check for typos.";
          }}
        >
          <FieldLabel>
            <span>
              Type <span className="font-mono">{project}</span> to confirm
            </span>
          </FieldLabel>
          <Input
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
          <FieldError />
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked)}
          />
          <FieldContent>
            <FieldLabel>I understand every deployment goes offline now</FieldLabel>
            <FieldDescription>
              You can restore it for 30 days. After that it&apos;s erased for good.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setTyped("");
            setUnderstood(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={!matches || !understood}
        >
          Delete project
        </Button>
      </div>
    </Form>
  );
}
