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

type Errors = Record<string, string | string[]>;

const takenUsernames = ["admin", "support", "dana"];
const breachedPasswords = ["password123", "qwerty2024", "letmein!"];

// Stands in for the response of a sign-up endpoint. A real server returns the
// same shape: messages keyed by field name, one string or a list per field.
function checkOnServer(values: Record<string, unknown>): Errors {
  const username = String(values.username ?? "").toLowerCase();
  const password = String(values.password ?? "");
  const errors: Errors = {};

  if (takenUsernames.includes(username)) {
    errors.username = `“${username}” is taken. Try ${username}-studio.`;
  }

  const passwordIssues: string[] = [];
  if (password.length < 12) passwordIssues.push("Use at least 12 characters.");
  if (!/\d/.test(password)) passwordIssues.push("Add at least one number.");
  if (breachedPasswords.includes(password.toLowerCase())) {
    passwordIssues.push("This password appeared in a known data breach.");
  }
  if (username && password.toLowerCase().includes(username)) {
    passwordIssues.push("Don't include your username.");
  }
  if (passwordIssues.length) errors.password = passwordIssues;

  return errors;
}

export default function Form03() {
  const [errors, setErrors] = React.useState<Errors>({});
  const [created, setCreated] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-sm">
      <Form
        aria-label="Create account"
        errors={errors}
        onFormSubmit={(values) => {
          const next = checkOnServer(values);
          setErrors(next);
          setCreated(
            Object.keys(next).length ? null : String(values.username ?? ""),
          );
        }}
      >
        <FieldGroup className="gap-4">
          <Field name="username">
            <FieldLabel>Username</FieldLabel>
            <Input defaultValue="admin" autoComplete="username" />
            <FieldError />
          </Field>
          <Field name="password">
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              defaultValue="password123"
              autoComplete="new-password"
            />
            <FieldDescription>
              Checked by the server when you submit.
            </FieldDescription>
            <FieldError className="[&_ul]:ml-4 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1" />
          </Field>
        </FieldGroup>
        <Button type="submit">Create account</Button>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {created ? `Account created for ${created}.` : null}
        </p>
      </Form>
    </div>
  );
}
