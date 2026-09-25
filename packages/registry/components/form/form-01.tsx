"use client";

import * as React from "react";

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

export default function Form01() {
  const [signedInAs, setSignedInAs] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-sm">
      <Form
        aria-labelledby="form-01-title"
        onFormSubmit={(values) => setSignedInAs(String(values.email))}
      >
        <div className="grid gap-1">
          <h2 id="form-01-title" className="text-lg font-semibold">
            Sign in to Ledgerly
          </h2>
          <p className="text-sm text-muted-foreground">
            Use the email your workspace admin invited.
          </p>
        </div>
        <FieldGroup className="gap-4">
          <Field name="email">
            <FieldLabel>Work email</FieldLabel>
            <Input
              required
              type="email"
              autoComplete="email"
              placeholder="dana@northwind.io"
            />
            <FieldError match="valueMissing">
              Enter the email you use for work.
            </FieldError>
            <FieldError match="typeMismatch">
              That doesn&apos;t look like an email address.
            </FieldError>
          </Field>
          <Field name="password">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>Password</FieldLabel>
              <a
                href="#reset-password"
                className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Forgot password?
              </a>
            </div>
            <Input
              required
              type="password"
              minLength={8}
              autoComplete="current-password"
            />
            <FieldDescription>At least 8 characters.</FieldDescription>
            <FieldError match="valueMissing">Enter your password.</FieldError>
            <FieldError match="tooShort">
              Passwords are at least 8 characters long.
            </FieldError>
          </Field>
        </FieldGroup>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        <p
          role="status"
          className="min-h-5 text-center text-sm text-muted-foreground"
        >
          {signedInAs ? `Signed in as ${signedInAs}` : null}
        </p>
      </Form>
    </div>
  );
}
