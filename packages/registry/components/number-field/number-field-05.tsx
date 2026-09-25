"use client";

import { useState } from "react";
import { LockIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const groupClasses =
  "w-full data-disabled:bg-muted/40 data-disabled:opacity-60 data-invalid:border-destructive data-invalid:focus-within:ring-destructive/30 data-readonly:bg-muted/40 data-readonly:shadow-none";

const uploadCap = 500;

export default function NumberField05() {
  const [uploadSize, setUploadSize] = useState<number | null>(750);
  const overCap = uploadSize !== null && uploadSize > uploadCap;

  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <Field>
        <FieldLabel>Licensed seats</FieldLabel>
        <NumberField defaultValue={48} readOnly>
          <NumberFieldGroup className={groupClasses}>
            <NumberFieldInput className="min-w-0 flex-1 pl-3 text-left" />
            <span className="flex items-center px-3 text-muted-foreground">
              <LockIcon aria-hidden="true" className="size-3.5" />
            </span>
          </NumberFieldGroup>
        </NumberField>
        <FieldDescription>
          Read-only. Seats sync from your identity provider.
        </FieldDescription>
      </Field>

      <Field disabled>
        <FieldLabel>Log retention (days)</FieldLabel>
        <NumberField defaultValue={30} disabled>
          <NumberFieldGroup className={groupClasses}>
            <NumberFieldDecrement />
            <NumberFieldInput className="min-w-0 flex-1" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <FieldDescription>
          Disabled. Custom retention is available on Enterprise.
        </FieldDescription>
      </Field>

      <Field invalid={overCap}>
        <FieldLabel>Max upload size (MB)</FieldLabel>
        <NumberField
          value={uploadSize}
          onValueChange={setUploadSize}
          min={1}
          step={50}
        >
          <NumberFieldGroup className={groupClasses}>
            <NumberFieldDecrement />
            <NumberFieldInput className="min-w-0 flex-1" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        {overCap ? (
          <FieldError match>
            Your plan caps uploads at {uploadCap} MB. Lower the limit or
            upgrade.
          </FieldError>
        ) : (
          <FieldDescription>Within your plan's {uploadCap} MB cap.</FieldDescription>
        )}
      </Field>
    </div>
  );
}
