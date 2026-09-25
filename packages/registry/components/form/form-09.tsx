"use client";

import { useId, useState } from "react";
import { PlaneIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Switch } from "@/registry/base/ui/switch";
import { Textarea } from "@/registry/base/ui/textarea";

const audiences = [
  { value: "everyone", label: "Everyone who emails me" },
  { value: "internal", label: "Only people at Northwind" },
];

const defaultMessage =
  "Thanks for your message. I'm away until Monday, October 12 with limited access to email. For anything urgent, reach Daniel Park at daniel@northwind.co.";

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function dayCount(start: string, end: string) {
  const ms = Date.parse(`${end}T00:00:00`) - Date.parse(`${start}T00:00:00`);
  return Math.round(ms / 86_400_000) + 1;
}

export default function Form09() {
  const messageId = useId();
  const [enabled, setEnabled] = useState(true);
  const [start, setStart] = useState("2026-10-05");
  const [end, setEnd] = useState("2026-10-09");
  const [audience, setAudience] = useState("everyone");
  const [message, setMessage] = useState(defaultMessage);
  const [messageError, setMessageError] = useState(false);
  const [scheduled, setScheduled] = useState<string | null>(null);

  const validRange = Boolean(start && end) && end >= start;

  return (
    <Form
      className="w-full max-w-lg gap-5 rounded-xl border border-border bg-card p-5"
      onChange={() => setScheduled(null)}
      onFormSubmit={() => {
        if (enabled && !message.trim()) {
          setMessageError(true);
          return;
        }
        setScheduled(
          enabled
            ? `Auto-reply scheduled for ${formatDay(start)} to ${formatDay(end)}.`
            : "Auto-reply turned off.",
        );
      }}
    >
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel className="text-base font-semibold">
            Out-of-office reply
          </FieldLabel>
          <FieldDescription>
            Answer incoming email automatically while you're away.
          </FieldDescription>
        </FieldContent>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            setScheduled(null);
          }}
        />
      </Field>

      {enabled ? (
        <FieldGroup className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="start">
              <FieldLabel>First day away</FieldLabel>
              <Input
                required
                type="date"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
              <FieldError />
            </Field>
            <Field
              name="end"
              validate={(value, formValues) =>
                String(value ?? "") >= String(formValues.start ?? "")
                  ? null
                  : "Pick a day on or after the first day."
              }
            >
              <FieldLabel>Last day away</FieldLabel>
              <Input
                required
                type="date"
                min={start}
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
              <FieldError />
            </Field>
          </div>

          {validRange ? (
            <p className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <PlaneIcon aria-hidden="true" className="size-4 shrink-0" />
              <span>
                Away{" "}
                <span className="font-medium text-foreground">
                  {dayCount(start, end)}{" "}
                  {dayCount(start, end) === 1 ? "day" : "days"}
                </span>
                , back on the next working day.
              </span>
            </p>
          ) : null}

          <FieldSet>
            <FieldLegend variant="label">Send replies to</FieldLegend>
            <RadioGroup
              value={audience}
              onValueChange={(value) => setAudience(value as string)}
            >
              {audiences.map((option) => (
                <Label key={option.value} className="font-normal">
                  <RadioGroupItem value={option.value} />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
          </FieldSet>

          <Field invalid={messageError}>
            <FieldLabel htmlFor={messageId}>Message</FieldLabel>
            <Textarea
              id={messageId}
              rows={4}
              aria-invalid={messageError || undefined}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setMessageError(false);
              }}
            />
            {messageError ? (
              <FieldError>Write a short message for people to read.</FieldError>
            ) : (
              <FieldDescription>
                Each sender gets this reply once per day.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {scheduled ? (
          <p role="status" className="mr-auto text-sm text-muted-foreground">
            {scheduled}
          </p>
        ) : null}
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}
