"use client";

import * as React from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

type FieldName = "fullName" | "street" | "city" | "postcode" | "phone";

const fields: {
  name: FieldName;
  label: string;
  autoComplete: string;
  type?: string;
  span?: boolean;
}[] = [
  { name: "fullName", label: "Full name", autoComplete: "name", span: true },
  {
    name: "street",
    label: "Street address",
    autoComplete: "street-address",
    span: true,
  },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postcode", label: "Postcode", autoComplete: "postal-code" },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel", span: true },
];

function validate(values: Record<string, unknown>) {
  const value = (name: FieldName) => String(values[name] ?? "").trim();
  const errors: Partial<Record<FieldName, string>> = {};
  if (!value("fullName")) errors.fullName = "Enter the recipient's full name.";
  if (!value("street")) errors.street = "Enter a street and house number.";
  if (!value("city")) errors.city = "Enter a town or city.";
  if (!/^[A-Z0-9 ]{3,10}$/i.test(value("postcode"))) {
    errors.postcode = "Enter a postcode, like SW1A 1AA.";
  }
  if (value("phone").replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a phone number the courier can call.";
  }
  return errors;
}

export default function Form06() {
  const idPrefix = React.useId();
  const [errors, setErrors] = React.useState<Partial<Record<FieldName, string>>>(
    {},
  );
  const [confirmed, setConfirmed] = React.useState(false);
  const entries = fields.filter((field) => errors[field.name]);

  function clear(name: FieldName) {
    setConfirmed(false);
    if (!errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  return (
    <div className="w-full max-w-md">
      <Form
        aria-labelledby={`${idPrefix}-title`}
        errors={errors}
        onFormSubmit={(values) => {
          const next = validate(values);
          setErrors(next);
          setConfirmed(Object.keys(next).length === 0);
        }}
      >
        <h2 id={`${idPrefix}-title`} className="font-semibold">
          Shipping address
        </h2>
        {entries.length > 0 ? (
          <Alert variant="destructive" role="alert">
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>
              Fix {entries.length}{" "}
              {entries.length === 1 ? "field" : "fields"} to continue
            </AlertTitle>
            <AlertDescription>
              <ul className="grid gap-1">
                {entries.map((field) => (
                  <li key={field.name}>
                    <button
                      type="button"
                      className="rounded-sm text-left underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-destructive/30"
                      onClick={() =>
                        document
                          .getElementById(`${idPrefix}-${field.name}`)
                          ?.focus()
                      }
                    >
                      {errors[field.name]}
                    </button>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Field
              key={field.name}
              name={field.name}
              className={field.span ? "sm:col-span-2" : undefined}
            >
              <FieldLabel>{field.label}</FieldLabel>
              <Input
                id={`${idPrefix}-${field.name}`}
                type={field.type}
                autoComplete={field.autoComplete}
                onChange={() => clear(field.name)}
              />
              <FieldError />
            </Field>
          ))}
        </FieldGroup>
        <Button type="submit">Continue to payment</Button>
        <p
          role="status"
          className="flex min-h-5 items-center gap-1.5 text-sm text-muted-foreground"
        >
          {confirmed ? (
            <>
              <CircleCheckIcon
                aria-hidden="true"
                className="size-4 text-success"
              />
              Address saved. Delivery estimate: 2–3 business days.
            </>
          ) : null}
        </p>
      </Form>
    </div>
  );
}
