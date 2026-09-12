"use client";

import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function Input02() {
  return (
    <div className="w-full max-w-sm">
      <Field name="email" invalid>
        <FieldLabel>Email address</FieldLabel>
        <Input type="email" defaultValue="maya@sevenui" aria-invalid="true" />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
    </div>
  );
}
