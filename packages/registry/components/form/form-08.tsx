"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

// Stands in for the password the server has on file for this account.
const storedPassword = "correct-horse-42";
const otherSessions = 3;

function PasswordInput({
  label,
  autoComplete,
}: {
  label: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        spellCheck={false}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOffIcon aria-hidden="true" />
          ) : (
            <EyeIcon aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default function Form08() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {updatedAt ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
        >
          <ShieldCheckIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-success"
          />
          <p>
            Password updated at {updatedAt}.
            {signOutOthers
              ? ` ${otherSessions} other sessions were signed out.`
              : " Your other sessions stay signed in."}
          </p>
        </div>
      ) : null}

      <Form
        key={formKey}
        className="w-full gap-5 rounded-xl border border-border bg-card p-5"
        errors={errors}
        onFormSubmit={(values) => {
          if (values.currentPassword !== storedPassword) {
            setErrors({
              currentPassword:
                "That's not your current password. Try again or reset it by email.",
            });
            return;
          }
          setErrors({});
          setUpdatedAt(
            new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
          );
          // Remount the form to clear every field and its validation state.
          setFormKey((current) => current + 1);
        }}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Change password</h3>
          <p className="text-sm text-muted-foreground">
            Last changed 94 days ago. New passwords need 12 characters.
          </p>
        </div>

        <FieldGroup className="gap-4">
          <Field
            name="currentPassword"
            validate={(value) =>
              String(value ?? "") ? null : "Enter your current password."
            }
          >
            <FieldLabel>Current password</FieldLabel>
            <PasswordInput
              label="current password"
              autoComplete="current-password"
            />
            <FieldDescription>
              The demo account uses{" "}
              <span className="font-mono whitespace-nowrap">{storedPassword}</span>.
            </FieldDescription>
            <FieldError />
          </Field>

          <Field
            name="newPassword"
            validate={(value, formValues) => {
              const next = String(value ?? "");
              if (next.length < 12) return "Use at least 12 characters.";
              if (next === formValues.currentPassword) {
                return "Choose a password you haven't used here before.";
              }
              return null;
            }}
          >
            <FieldLabel>New password</FieldLabel>
            <PasswordInput label="new password" autoComplete="new-password" />
            <FieldError />
          </Field>

          <Field
            name="confirmPassword"
            validate={(value, formValues) =>
              value === formValues.newPassword
                ? null
                : "Passwords don't match."
            }
          >
            <FieldLabel>Confirm new password</FieldLabel>
            <PasswordInput
              label="password confirmation"
              autoComplete="new-password"
            />
            <FieldError />
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              checked={signOutOthers}
              onCheckedChange={(checked) => setSignOutOthers(checked)}
            />
            <FieldContent>
              <FieldLabel>Sign out of other devices</FieldLabel>
              <FieldDescription>
                Ends {otherSessions} active sessions on your phone, tablet, and
                work laptop.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button type="submit" className="sm:justify-self-end">
          Update password
        </Button>
      </Form>
    </div>
  );
}
