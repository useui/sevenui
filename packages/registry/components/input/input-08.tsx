"use client";

import * as React from "react";
import { CircleCheck } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fields = [
  { id: "name", label: "Full name", type: "text", autoComplete: "name", defaultValue: "Maya Chen" },
  { id: "email", label: "Work email", type: "email", autoComplete: "email", defaultValue: "" },
  { id: "company", label: "Company", type: "text", autoComplete: "organization", defaultValue: "" },
] as const;

type FieldId = (typeof fields)[number]["id"];

function validate(id: FieldId, value: string) {
  const trimmed = value.trim();
  if (id === "name" && !trimmed) return "Enter your name.";
  if (id === "email") {
    if (!trimmed) return "Enter your work email.";
    if (!EMAIL_PATTERN.test(trimmed)) return "Check the email for a missing @ or domain.";
  }
  if (id === "company" && !trimmed) return "Enter your company.";
  return null;
}

const initialValues = Object.fromEntries(
  fields.map((field) => [field.id, field.defaultValue]),
) as Record<FieldId, string>;

export default function Input08() {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<FieldId, string>>>({});
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div
        role="status"
        className="flex w-full max-w-sm flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-sm text-card-foreground"
      >
        <div className="flex items-center gap-2">
          <CircleCheck aria-hidden="true" className="size-4 text-success" />
          <p className="font-medium">Request received</p>
        </div>
        <p className="text-muted-foreground">
          Thanks, {values.name.trim().split(/\s+/)[0]}. We'll email{" "}
          <span className="font-medium break-all text-foreground">{values.email.trim()}</span>{" "}
          within one business day to book a time.
        </p>
        <Button
          autoFocus
          variant="outline"
          size="sm"
          onClick={() => {
            setValues(initialValues);
            setErrors({});
            setSubmitted(false);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const next: Partial<Record<FieldId, string>> = {};
        for (const field of fields) {
          const error = validate(field.id, values[field.id]);
          if (error) next[field.id] = error;
        }
        setErrors(next);
        const firstInvalid = fields.find((field) => next[field.id]);
        if (firstInvalid) {
          document.getElementById(`input-08-${firstInvalid.id}`)?.focus();
          return;
        }
        setSubmitted(true);
      }}
    >
      {fields.map((field) => {
        const error = errors[field.id];
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <div className="relative">
              <Input
                id={`input-08-${field.id}`}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.id]}
                placeholder=" "
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `input-08-${field.id}-error` : undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  setValues((prev) => ({ ...prev, [field.id]: value }));
                  if (error) setErrors((prev) => ({ ...prev, [field.id]: undefined }));
                }}
                className="peer h-12 px-3 pt-5 pb-1.5"
              />
              <label
                htmlFor={`input-08-${field.id}`}
                className="pointer-events-none absolute top-1/2 left-3 origin-left -translate-y-1/2 text-sm text-muted-foreground transition-[top,transform,color] duration-200 ease-out select-none peer-focus-visible:top-3.5 peer-focus-visible:scale-[0.8] peer-focus-visible:text-foreground peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:scale-[0.8] peer-disabled:opacity-50 motion-reduce:transition-none"
              >
                {field.label}
              </label>
            </div>
            {error && (
              <p id={`input-08-${field.id}-error`} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        );
      })}
      <Button type="submit" size="lg" className="mt-1 h-10">
        Request a demo
      </Button>
    </form>
  );
}
