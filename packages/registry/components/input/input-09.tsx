"use client";

import * as React from "react";
import { MailCheck } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Input09() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [subscribed, setSubscribed] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email to subscribe.");
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setError("That doesn't look like an email. Check for a missing @ or domain.");
      return;
    }
    setError(null);
    setSubscribed(value);
  }

  return (
    <section
      aria-labelledby="input-09-heading"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="input-09-heading" className="text-base font-semibold">
          The changelog, once a month
        </h3>
        <p className="text-sm text-muted-foreground">
          New components, breaking changes and migration notes. No launch hype,
          unsubscribe in one click.
        </p>
      </div>

      {subscribed ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm"
        >
          <MailCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <p>
              Almost there. Confirm the link we sent to{" "}
              <span className="font-medium break-all">{subscribed}</span>.
            </p>
            <button
              type="button"
              className="w-fit rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => {
                setSubscribed(null);
                setEmail("");
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Label htmlFor="input-09-email" className="sr-only">
            Email address
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="input-09-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "input-09-error" : "input-09-hint"}
            />
            <Button type="submit" className="sm:shrink-0">
              Subscribe
            </Button>
          </div>
          {error ? (
            <p id="input-09-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p id="input-09-hint" className="text-xs text-muted-foreground">
              Joined by 12,400 frontend engineers.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
