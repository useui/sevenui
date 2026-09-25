"use client";

import * as React from "react";
import { LockIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";

const initial = { sharing: false, expiry: true };

export default function Checkbox03() {
  const [sharing, setSharing] = React.useState(initial.sharing);
  const [expiry, setExpiry] = React.useState(initial.expiry);
  const [saved, setSaved] = React.useState(initial);

  const dirty = sharing !== saved.sharing || expiry !== saved.expiry;

  return (
    <form
      className="w-full max-w-md rounded-xl border border-border bg-card p-5 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved({ sharing, expiry });
      }}
    >
      <FieldSet>
        <FieldLegend>Workspace policies</FieldLegend>
        <p className="-mt-1.5 text-sm text-muted-foreground">
          Some settings are managed by your organization or your plan.
        </p>
        <FieldGroup className="gap-4">
          {/* Read-only: shows a value the user can't change here. */}
          <Field orientation="horizontal">
            <Checkbox readOnly checked className="data-readonly:opacity-70" />
            <FieldContent>
              <FieldLabel className="flex-wrap items-center gap-y-1">
                Require two-factor authentication
                <Badge variant="secondary" className="gap-1">
                  <LockIcon aria-hidden="true" />
                  Managed
                </Badge>
              </FieldLabel>
              <FieldDescription>
                Enforced by Northwind IT for every member.
              </FieldDescription>
            </FieldContent>
          </Field>

          {/* Disabled: unavailable on the current plan. */}
          <Field orientation="horizontal" disabled>
            <Checkbox />
            <FieldContent>
              <FieldLabel>Allow guest access</FieldLabel>
              <FieldDescription>
                Available on the Business plan.
              </FieldDescription>
            </FieldContent>
          </Field>

          {/* Dependent: the child only applies while its parent is on. */}
          <div className="flex flex-col gap-3">
            <Field orientation="horizontal">
              <Checkbox
                checked={sharing}
                onCheckedChange={(checked) => setSharing(checked)}
              />
              <FieldContent>
                <FieldLabel>Allow public file links</FieldLabel>
                <FieldDescription>
                  Anyone with the link can view the file.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field
              orientation="horizontal"
              disabled={!sharing}
              className="ms-2 border-s border-border ps-5"
            >
              <Checkbox
                checked={sharing && expiry}
                onCheckedChange={(checked) => setExpiry(checked)}
              />
              <FieldContent>
                <FieldLabel>Expire links after 30 days</FieldLabel>
                <FieldDescription>
                  {sharing
                    ? "Old links stop working automatically."
                    : "Turn on public file links to change this."}
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <p role="status" className="mr-auto text-sm text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <Button type="submit" disabled={!dirty}>
          Save policies
        </Button>
      </div>
    </form>
  );
}
