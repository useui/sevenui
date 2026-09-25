"use client";

import { Fingerprint, KeyRound, Mail } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type Method = "passkey" | "sso" | "email";

const methods: {
  id: Method;
  label: string;
  pending: string;
  status: string;
  icon: typeof Fingerprint;
}[] = [
  {
    id: "passkey",
    label: "Sign in with a passkey",
    pending: "Waiting for passkey",
    status: "Confirm with Touch ID or your security key.",
    icon: Fingerprint,
  },
  {
    id: "sso",
    label: "Continue with SSO",
    pending: "Redirecting to Okta",
    status: "Redirecting to your identity provider.",
    icon: KeyRound,
  },
  {
    id: "email",
    label: "Email me a sign-in link",
    pending: "Sending link",
    status: "Sending a one-time link to your inbox.",
    icon: Mail,
  },
];

export default function Button03() {
  const [pending, setPending] = React.useState<Method | null>(null);

  React.useEffect(() => {
    if (!pending) return;
    const timeout = setTimeout(() => setPending(null), 1800);
    return () => clearTimeout(timeout);
  }, [pending]);

  const active = methods.find((method) => method.id === pending);

  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Sign in to Northwind</h3>
        <p className="text-sm text-muted-foreground">
          Use the method your workspace admin set up.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {methods.map((method, index) => {
          const Icon = method.icon;
          const isPending = pending === method.id;
          return (
            <React.Fragment key={method.id}>
              {index === 1 && (
                <div
                  aria-hidden="true"
                  className="my-1 flex items-center gap-3 text-xs text-muted-foreground"
                >
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <Button
                size="lg"
                variant={index === 0 ? "default" : "outline"}
                className="w-full"
                disabled={pending !== null}
                focusableWhenDisabled={isPending}
                onClick={() => setPending(method.id)}
              >
                {isPending ? (
                  <Spinner data-icon="inline-start" aria-hidden="true" role="presentation" />
                ) : (
                  <Icon data-icon="inline-start" aria-hidden="true" />
                )}
                {isPending ? `${method.pending}…` : method.label}
              </Button>
            </React.Fragment>
          );
        })}
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
        {active ? active.status : "New to Northwind? Ask your admin for an invite."}
      </p>
    </div>
  );
}
