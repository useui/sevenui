"use client";

import * as React from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const fields = [
  {
    id: "alert-07-company",
    name: "company",
    label: "Company name",
    autoComplete: "organization",
    validate: (value: string) =>
      value.trim().length < 2 ? "Enter your company name" : null,
  },
  {
    id: "alert-07-vat",
    name: "vat",
    label: "VAT number",
    autoComplete: "off",
    validate: (value: string) =>
      /^[A-Z]{2}[0-9A-Z]{8,12}$/.test(value.trim().toUpperCase())
        ? null
        : "Enter a VAT number that starts with a country code, like DE123456789",
  },
  {
    id: "alert-07-email",
    name: "email",
    label: "Billing email",
    autoComplete: "email",
    validate: (value: string) =>
      /^\S+@\S+\.\S+$/.test(value.trim())
        ? null
        : "Enter an email address like finance@company.com",
  },
];

type Values = Record<string, string>;

function validateAll(values: Values) {
  return fields.flatMap((field) => {
    const message = field.validate(values[field.name] ?? "");
    return message ? [{ id: field.id, message }] : [];
  });
}

const initialValues: Values = {
  company: "Brightline Studio",
  vat: "123456",
  email: "finance@brightline",
};

export default function Alert07() {
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = React.useState<Values>(initialValues);
  const [errors, setErrors] = React.useState<{ id: string; message: string }[]>(
    () => validateAll(initialValues),
  );
  const [saved, setSaved] = React.useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validateAll(values);
    setErrors(next);
    setSaved(next.length === 0);
    if (next.length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  function errorFor(id: string) {
    return errors.find((error) => error.id === id)?.message;
  }

  return (
    <form noValidate onSubmit={submit} className="grid w-full max-w-sm gap-4">
      <div className="grid gap-1">
        <h3 className="font-medium">Billing details</h3>
        <p className="text-sm text-muted-foreground">
          These appear on every invoice we send you.
        </p>
      </div>
      {errors.length > 0 && (
        <Alert
          ref={summaryRef}
          tabIndex={-1}
          variant="destructive"
          className="border-destructive/30 outline-none focus-visible:ring-3 focus-visible:ring-destructive/20"
        >
          <CircleAlertIcon aria-hidden="true" />
          <AlertTitle>
            Fix {errors.length} {errors.length === 1 ? "field" : "fields"} to
            save
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-1 grid gap-1">
              {errors.map((error) => (
                <li key={error.id}>
                  <a
                    href={`#${error.id}`}
                    className="rounded-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-destructive/30"
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(error.id)?.focus();
                    }}
                  >
                    {error.message}
                  </a>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert role="status">
          <CircleCheckIcon aria-hidden="true" className="text-success!" />
          <AlertTitle>Billing details saved</AlertTitle>
          <AlertDescription>
            Your next invoice will use these details.
          </AlertDescription>
        </Alert>
      )}
      {fields.map((field) => {
        const message = errorFor(field.id);
        return (
          <div key={field.id} className="grid gap-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              aria-invalid={message ? true : undefined}
              aria-describedby={message ? `${field.id}-error` : undefined}
              onChange={(event) => {
                setSaved(false);
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }));
              }}
            />
            {message && (
              <p id={`${field.id}-error`} className="text-xs text-destructive">
                {message}
              </p>
            )}
          </div>
        );
      })}
      <Button type="submit" className="w-full sm:w-auto sm:justify-self-end">
        Save details
      </Button>
    </form>
  );
}
