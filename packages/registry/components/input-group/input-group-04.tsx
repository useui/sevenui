"use client";

import { useId, useState } from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  LandmarkIcon,
  MailIcon,
} from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// EU VAT IDs: a two-letter country code followed by 8 to 12 characters.
const VAT_PATTERN = /^(AT|BE|DE|DK|ES|FI|FR|IE|IT|NL|PL|PT|SE)[0-9A-Z]{8,12}$/;

type Status = "idle" | "error" | "success";

function getEmailStatus(value: string): Status {
  if (!value) return "idle";
  return EMAIL_PATTERN.test(value) ? "success" : "error";
}

function getVatStatus(value: string): Status {
  // Stay quiet until the ID is long enough to judge.
  if (value.length < 10) return "idle";
  return VAT_PATTERN.test(value) ? "success" : "error";
}

const successGroup =
  "border-success/60 has-[[data-slot=input-group-control]:focus-visible]:border-success has-[[data-slot=input-group-control]:focus-visible]:ring-success/20";

export default function InputGroup04() {
  const id = useId();
  const [email, setEmail] = useState("maya@northwind");
  const [vat, setVat] = useState("DE294817365");

  const emailStatus = getEmailStatus(email);
  const vatStatus = getVatStatus(vat);

  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>Billing email</Label>
        <InputGroup className={emailStatus === "success" ? successGroup : undefined}>
          <InputGroupAddon>
            <MailIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={emailStatus === "error"}
            aria-describedby={`${id}-email-message`}
            onChange={(event) => setEmail(event.target.value.trim())}
          />
          {emailStatus !== "idle" ? (
            <InputGroupAddon align="inline-end">
              {emailStatus === "error" ? (
                <CircleAlertIcon aria-hidden="true" className="text-destructive" />
              ) : (
                <CircleCheckIcon aria-hidden="true" className="text-success" />
              )}
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <p
          id={`${id}-email-message`}
          aria-live="polite"
          className={
            emailStatus === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {emailStatus === "error"
            ? "Add the full domain, like maya@northwind.com."
            : "Receipts and failed-payment notices go here."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-vat`}>VAT number</Label>
        <InputGroup className={vatStatus === "success" ? successGroup : undefined}>
          <InputGroupAddon>
            <LandmarkIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-vat`}
            value={vat}
            placeholder="DE123456789"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={vatStatus === "error"}
            aria-describedby={`${id}-vat-message`}
            className="tracking-wide tabular-nums"
            onChange={(event) =>
              setVat(event.target.value.toUpperCase().replace(/[\s.-]/g, ""))
            }
          />
          {vatStatus === "success" ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-success">
                <CircleCheckIcon aria-hidden="true" />
                Valid
              </InputGroupText>
            </InputGroupAddon>
          ) : null}
          {vatStatus === "error" ? (
            <InputGroupAddon align="inline-end">
              <CircleAlertIcon aria-hidden="true" className="text-destructive" />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <p
          id={`${id}-vat-message`}
          aria-live="polite"
          className={
            vatStatus === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {vatStatus === "success"
            ? "Reverse charge applies, so invoices won’t include VAT."
            : vatStatus === "error"
              ? "Start with the country code, like DE294817365."
              : "EU businesses only. Leave empty to be charged VAT."}
        </p>
      </div>
    </form>
  );
}
