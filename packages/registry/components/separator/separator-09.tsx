"use client";

import { Building2, KeyRound, MailCheck } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";

export default function Separator09() {
  const [email, setEmail] = React.useState("");
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const emailId = React.useId();

  const sendLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (value) setSentTo(value);
  };

  return (
    <section
      aria-labelledby="separator-09-heading"
      className="w-full max-w-sm rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1 text-center">
          <h3 id="separator-09-heading" className="text-lg font-semibold">
            Sign in to Northwind
          </h3>
          <p className="text-sm text-balance text-muted-foreground">
            Use your company account or a one-time email link.
          </p>
        </div>

        <div className="grid gap-2">
          <Button variant="outline">
            <Building2 aria-hidden="true" data-icon="inline-start" />
            Continue with SSO
          </Button>
          <Button variant="outline">
            <KeyRound aria-hidden="true" data-icon="inline-start" />
            Continue with a passkey
          </Button>
        </div>

        {/* The label sits on the line; flex-1 separators fill either side. */}
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or with email</span>
          <Separator className="flex-1" />
        </div>

        {sentTo ? (
          <div
            role="status"
            className="flex flex-col items-center gap-2 rounded-lg bg-muted px-4 py-5 text-center"
          >
            <MailCheck aria-hidden="true" className="size-5" />
            <p className="text-sm font-medium">Check your inbox</p>
            <p className="text-sm break-all text-muted-foreground">
              We sent a sign-in link to {sentTo}.
            </p>
            <Button variant="link" size="sm" onClick={() => setSentTo(null)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={sendLink} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor={emailId}>Work email</Label>
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <Button type="submit">Email me a sign-in link</Button>
          </form>
        )}
      </div>

      <Separator />
      <p className="px-6 py-4 text-center text-sm text-muted-foreground">
        New to Northwind?{" "}
        <a
          href="#sign-up"
          className="rounded-sm font-medium whitespace-nowrap text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Create a workspace
        </a>
      </p>
    </section>
  );
}
