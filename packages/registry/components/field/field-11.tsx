"use client";

import { useId, useState } from "react";
import {
  BugIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  KeyRoundIcon,
  LifeBuoyIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Textarea } from "@/registry/base/ui/textarea";

const topics = [
  { value: "bug", title: "Something's broken", icon: BugIcon },
  { value: "billing", title: "Billing & invoices", icon: CreditCardIcon },
  { value: "access", title: "Account access", icon: KeyRoundIcon },
  { value: "other", title: "Something else", icon: LifeBuoyIcon },
];

const maxLength = 600;
const minLength = 30;

export default function Field11() {
  const messageId = useId();
  const [topic, setTopic] = useState("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachLogs, setAttachLogs] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const subjectError =
    submitted && subject.trim().length === 0
      ? "Add a short subject so we can route your request."
      : null;
  const messageError =
    submitted && message.trim().length < minLength
      ? `Add a few more details, at least ${minLength} characters.`
      : null;

  if (ticket) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-2 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2Icon aria-hidden="true" className="size-8 text-success" />
        <h3 className="font-semibold">Request {ticket} received</h3>
        <p className="text-sm text-muted-foreground">
          We reply within 4 business hours. You'll get updates at
          harper@northwind.io.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            setTicket(null);
            setSubject("");
            setMessage("");
            setSubmitted(false);
          }}
        >
          Open another request
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="w-full max-w-md rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (subject.trim() && message.trim().length >= minLength) {
          setTicket("SUP-48213");
        }
      }}
    >
      <FieldGroup className="gap-5">
        <FieldSet>
          <FieldLegend variant="label">What do you need help with?</FieldLegend>
          <RadioGroup
            value={topic}
            onValueChange={(value) => setTopic(value as string)}
            className="grid grid-cols-2 gap-2"
          >
            {topics.map((item) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: the label wraps the Base UI radio control
              <label
                key={item.value}
                className="flex w-full cursor-pointer rounded-lg border border-border transition-colors hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10"
              >
                <Field orientation="horizontal" className="items-start p-2.5">
                  <FieldContent className="gap-2">
                    <item.icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <FieldTitle>{item.title}</FieldTitle>
                  </FieldContent>
                  <RadioGroupItem value={item.value} />
                </Field>
              </label>
            ))}
          </RadioGroup>
        </FieldSet>

        <Field invalid={subjectError !== null}>
          <FieldLabel>Subject</FieldLabel>
          <Input
            value={subject}
            placeholder={
              topic === "billing"
                ? "Charged twice for September"
                : "Deploys stuck in queue"
            }
            onChange={(event) => setSubject(event.target.value)}
          />
          <FieldError>{subjectError}</FieldError>
        </Field>

        <Field invalid={messageError !== null}>
          <div className="flex items-baseline justify-between gap-2">
            <FieldLabel htmlFor={messageId}>Details</FieldLabel>
            <span
              className="text-xs text-muted-foreground tabular-nums"
              aria-hidden="true"
            >
              {message.length}/{maxLength}
            </span>
          </div>
          <Textarea
            id={messageId}
            rows={4}
            maxLength={maxLength}
            value={message}
            aria-invalid={messageError !== null || undefined}
            placeholder="What happened, what you expected, and any steps to reproduce."
            onChange={(event) => setMessage(event.target.value)}
          />
          <FieldError>{messageError}</FieldError>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            checked={attachLogs}
            onCheckedChange={(checked) => setAttachLogs(checked)}
          />
          <FieldContent>
            <FieldLabel>Attach diagnostic logs</FieldLabel>
            <FieldDescription>
              Last 24 hours of build and runtime logs. No secrets included.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Button type="submit" className="w-full">
          Send request
        </Button>
      </FieldGroup>
    </form>
  );
}
