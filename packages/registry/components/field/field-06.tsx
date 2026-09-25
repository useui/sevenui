"use client";

import { useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "cn";

import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

const rules = [
  {
    id: "length",
    label: "At least 12 characters",
    test: (v: string) => v.length >= 12,
  },
  {
    id: "case",
    label: "Upper and lowercase letters",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  {
    id: "number",
    label: "At least one number",
    test: (v: string) => /\d/.test(v),
  },
  {
    id: "symbol",
    label: "At least one symbol",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export default function Field06() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const passed = rules.filter((rule) => rule.test(password)).length;

  const barColor =
    passed === rules.length
      ? "bg-success"
      : passed >= 2
        ? "bg-warning"
        : "bg-destructive";

  return (
    <div className="w-full max-w-sm">
      <Field
        name="newPassword"
        validationMode="onBlur"
        validate={(value) =>
          rules.every((rule) => rule.test(String(value ?? "")))
            ? null
            : "Your password doesn't meet every requirement yet."
        }
      >
        <FieldLabel>New password</FieldLabel>
        <InputGroup className="has-[[data-slot=input-group-control][data-valid]]:border-success/60">
          <InputGroupInput
            type={visible ? "text" : "password"}
            value={password}
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={visible ? "Hide password" : "Show password"}
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

        <div className="flex items-center gap-3">
          <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
            {rules.map((rule, index) => (
              <span
                key={rule.id}
                className={cn(
                  "h-1 rounded-full bg-muted transition-colors duration-300",
                  index < passed && barColor,
                )}
              />
            ))}
          </div>
          <span
            aria-live="polite"
            className="w-16 text-right text-xs font-medium text-muted-foreground"
          >
            {password ? strengthLabels[passed] : ""}
          </span>
        </div>

        <ul className="grid gap-1.5 text-sm" aria-label="Password requirements">
          {rules.map((rule) => {
            const met = rule.test(password);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  met ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-all duration-200",
                    met
                      ? "scale-100 border-success bg-success text-success-foreground"
                      : "scale-90 border-border",
                  )}
                >
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      "size-3 transition-opacity",
                      met ? "opacity-100" : "opacity-0",
                    )}
                  />
                </span>
                {rule.label}
                <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
              </li>
            );
          })}
        </ul>
        <FieldError />
      </Field>
    </div>
  );
}
