"use client";

import { useId, useState } from "react";
import { ReceiptTextIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

type CountryCode = "DE" | "FR" | "NL" | "US";

// Each billing country has its own tax ID name, format, and tax treatment.
const countries: Record<
  CountryCode,
  {
    label: string;
    taxLabel: string;
    placeholder: string;
    pattern: RegExp;
    hint: string;
    eu: boolean;
  }
> = {
  DE: {
    label: "Germany",
    taxLabel: "VAT number (USt-IdNr.)",
    placeholder: "DE123456789",
    pattern: /^DE\d{9}$/,
    hint: "DE followed by 9 digits.",
    eu: true,
  },
  FR: {
    label: "France",
    taxLabel: "VAT number (TVA)",
    placeholder: "FR12345678901",
    pattern: /^FR[A-Z0-9]{2}\d{9}$/,
    hint: "FR, 2 characters, then 9 digits.",
    eu: true,
  },
  NL: {
    label: "Netherlands",
    taxLabel: "VAT number (btw-id)",
    placeholder: "NL123456789B01",
    pattern: /^NL\d{9}B\d{2}$/,
    hint: "NL, 9 digits, B, then 2 digits.",
    eu: true,
  },
  US: {
    label: "United States",
    taxLabel: "EIN",
    placeholder: "12-3456789",
    pattern: /^\d{2}-\d{7}$/,
    hint: "9 digits in the format 12-3456789.",
    eu: false,
  },
};

// Stands in for the VIES registry lookup a server would run.
function lookupFails(taxId: string) {
  return /0{6}/.test(taxId);
}

export default function Form10() {
  const countryId = useId();
  const [country, setCountry] = useState<CountryCode>("DE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<{
    company: string;
    taxId: string;
  } | null>(null);
  const config = countries[country];

  const treatment = !saved
    ? null
    : !config.eu
      ? "Sales tax is calculated from your billing address."
      : saved.taxId
        ? "Reverse charge applies. Invoices show 0% VAT."
        : "Standard VAT will be added to each invoice.";

  return (
    <Form
      className="w-full max-w-lg gap-5 rounded-xl border border-border bg-card p-5"
      errors={errors}
      onChange={() => setSaved(null)}
      onFormSubmit={(values) => {
        const taxId = String(values.taxId ?? "")
          .replace(/\s/g, "")
          .toUpperCase();
        if (taxId && config.eu && lookupFails(taxId)) {
          setErrors({
            taxId:
              "The EU VAT registry couldn't verify this number. Check it, or leave it empty to be charged VAT.",
          });
          return;
        }
        setErrors({});
        setSaved({ company: String(values.company ?? ""), taxId });
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <ReceiptTextIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Tax details</h3>
          <p className="text-sm text-muted-foreground">
            Printed on every invoice from your next billing date, October 1.
          </p>
        </div>
      </div>

      <FieldGroup className="gap-4">
        <Field name="company">
          <FieldLabel>Legal business name</FieldLabel>
          <Input
            required
            autoComplete="organization"
            defaultValue="Lindqvist Studio GmbH"
          />
          <FieldError />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Field>
            <FieldLabel htmlFor={countryId}>Country</FieldLabel>
            <NativeSelect
              id={countryId}
              className="w-full"
              autoComplete="country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value as CountryCode);
                setErrors({});
              }}
            >
              {(Object.keys(countries) as CountryCode[]).map((code) => (
                <NativeSelectOption key={code} value={code}>
                  {countries[code].label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {/* Keyed by country so a stale format error doesn't carry over. */}
          <Field
            key={country}
            name="taxId"
            validate={(value) => {
              const taxId = String(value ?? "")
                .replace(/\s/g, "")
                .toUpperCase();
              if (!taxId) return null;
              return config.pattern.test(taxId) ? null : `Use ${config.hint}`;
            }}
          >
            <FieldLabel>
              {config.taxLabel}
              <span className="font-normal text-muted-foreground">
                Optional
              </span>
            </FieldLabel>
            <Input
              placeholder={config.placeholder}
              spellCheck={false}
              className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
            />
            <FieldError />
          </Field>
        </div>

        <Field name="billingEmail">
          <FieldLabel>Invoice email</FieldLabel>
          <Input
            required
            type="email"
            autoComplete="email"
            defaultValue="finance@lindqvist.studio"
          />
          <FieldDescription>
            Receipts and payment failures go here, not to your login email.
          </FieldDescription>
          <FieldError />
        </Field>
      </FieldGroup>

      {saved ? (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{saved.company}</span>
            {saved.taxId ? (
              <Badge variant="secondary" className="font-mono">
                {saved.taxId}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">{treatment}</p>
        </div>
      ) : null}

      <Button type="submit" className="sm:justify-self-end">
        Save tax details
      </Button>
    </Form>
  );
}
