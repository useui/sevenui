"use client";

import * as React from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
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
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "submitting" | "error" | "success";

export default function Form04() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [email, setEmail] = React.useState("");
  const attempts = React.useRef(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const submitting = status === "submitting";

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex w-full max-w-sm animate-in flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center duration-300 fade-in-0 zoom-in-95 motion-reduce:animate-none"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-success/10">
          <CircleCheckIcon aria-hidden="true" className="size-5 text-success" />
        </span>
        <div className="grid gap-1">
          <h2 className="font-semibold">Check your inbox</h2>
          <p className="text-sm text-balance text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>. It
            expires in 24 hours.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            attempts.current = 0;
            setEmail("");
            setStatus("idle");
          }}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5">
      <Form
        aria-labelledby="form-04-title"
        aria-busy={submitting}
        onFormSubmit={(values) => {
          setEmail(String(values.email));
          setStatus("submitting");
          attempts.current += 1;
          // The first attempt fails so every state of the form is visible.
          const fails = attempts.current === 1;
          timer.current = setTimeout(() => {
            setStatus(fails ? "error" : "success");
          }, 1200);
        }}
      >
        <div className="grid gap-1">
          <h2 id="form-04-title" className="font-semibold">
            Get the release notes
          </h2>
          <p className="text-sm text-muted-foreground">
            One email per release. Unsubscribe anytime.
          </p>
        </div>
        {status === "error" ? (
          <Alert variant="destructive" className="animate-in fade-in-0 motion-reduce:animate-none">
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>We couldn&apos;t reach the server</AlertTitle>
            <AlertDescription>
              Your details are still here. Check your connection and try again.
            </AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup className="gap-4">
          <Field name="email" disabled={submitting}>
            <FieldLabel>Email</FieldLabel>
            <Input
              required
              type="email"
              autoComplete="email"
              placeholder="dana@northwind.io"
            />
            <FieldDescription>
              We&apos;ll send a link to confirm it&apos;s you.
            </FieldDescription>
            <FieldError match="valueMissing">
              Enter an email to subscribe.
            </FieldError>
            <FieldError match="typeMismatch">
              Enter an address like name@company.com.
            </FieldError>
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner aria-hidden="true" role="presentation" />
              Subscribing…
            </>
          ) : status === "error" ? (
            "Try again"
          ) : (
            "Subscribe"
          )}
        </Button>
        <span role="status" className="sr-only">
          {submitting ? "Subscribing" : ""}
        </span>
      </Form>
    </div>
  );
}
