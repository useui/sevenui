"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const areas = [
  { value: "billing", label: "Billing and invoices", team: "Payments" },
  { value: "auth", label: "Sign-in and SSO", team: "Identity" },
  { value: "api", label: "API and webhooks", team: "Platform" },
  { value: "editor", label: "Document editor", team: "Editor" },
];

const severities = [
  { value: "sev1", label: "Sev 1 · Production is down" },
  { value: "sev2", label: "Sev 2 · Major feature broken" },
  { value: "sev3", label: "Sev 3 · Workaround exists" },
  { value: "sev4", label: "Sev 4 · Cosmetic or question" },
];

export default function NativeSelect05() {
  const [area, setArea] = React.useState("");
  const [severity, setSeverity] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const areaInvalid = submitted && !area;
  const severityInvalid = submitted && !severity;
  const complete = sent;
  const team = areas.find((item) => item.value === area)?.team;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setSent(Boolean(area) && Boolean(severity));
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-05-area">Product area</Label>
        <NativeSelect
          id="native-select-05-area"
          className="w-full"
          value={area}
          required
          aria-invalid={areaInvalid || undefined}
          aria-describedby={
            areaInvalid ? "native-select-05-area-error" : undefined
          }
          onChange={(event) => {
            setArea(event.target.value);
            setSent(false);
          }}
        >
          <NativeSelectOption value="" disabled>
            Where did it happen?
          </NativeSelectOption>
          {areas.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {areaInvalid ? (
          <p
            id="native-select-05-area-error"
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <CircleAlertIcon aria-hidden="true" className="size-3.5 shrink-0" />
            Pick an area so the right team sees this.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-05-severity">Severity</Label>
        <NativeSelect
          id="native-select-05-severity"
          className="w-full"
          value={severity}
          required
          aria-invalid={severityInvalid || undefined}
          aria-describedby="native-select-05-severity-hint"
          onChange={(event) => {
            setSeverity(event.target.value);
            setSent(false);
          }}
        >
          <NativeSelectOption value="" disabled>
            How bad is it?
          </NativeSelectOption>
          {severities.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p
          id="native-select-05-severity-hint"
          className={
            severityInvalid
              ? "flex items-center gap-1.5 text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {severityInvalid ? (
            <>
              <CircleAlertIcon
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              Choose a severity to set the response time.
            </>
          ) : severity === "sev1" ? (
            "Sev 1 pages the on-call engineer immediately."
          ) : (
            "Sev 1 pages on-call; others get a reply within one business day."
          )}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full">
          Submit report
        </Button>
        <p
          aria-live="polite"
          className="flex min-h-5 items-center justify-center gap-1.5 text-sm text-success"
        >
          {complete ? (
            <>
              <CircleCheckIcon
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              Routed to the {team} team
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
