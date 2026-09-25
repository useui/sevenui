"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

const MAX_LENGTH = 40;

export default function Field01() {
  const [value, setValue] = useState("Northwind Studio");
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="w-full max-w-sm">
      <Field name="workspaceName">
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel>Workspace name</FieldLabel>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <Input
          value={value}
          maxLength={MAX_LENGTH}
          placeholder="Acme Inc."
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="flex items-start justify-between gap-3">
          <FieldDescription>
            Shown on invoices and in the sidebar switcher.
          </FieldDescription>
          <span
            aria-live="polite"
            className="shrink-0 text-xs text-muted-foreground tabular-nums"
          >
            {remaining} left
          </span>
        </div>
      </Field>
    </div>
  );
}
