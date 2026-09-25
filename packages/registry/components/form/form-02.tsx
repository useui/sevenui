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
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Mode = "onSubmit" | "onBlur" | "onChange";

const modes: { value: Mode; label: string; hint: string }[] = [
  {
    value: "onSubmit",
    label: "On submit",
    hint: "Errors appear after the first submit, then update as you type.",
  },
  {
    value: "onBlur",
    label: "On blur",
    hint: "Each field checks itself when you leave it.",
  },
  {
    value: "onChange",
    label: "On change",
    hint: "Fields check on every keystroke, debounced by 300 ms.",
  },
];

function validateHandle(value: unknown) {
  const handle = String(value ?? "");
  if (handle.length < 3) return "Use at least 3 characters.";
  if (!/^[a-z0-9_]+$/.test(handle)) {
    return "Only lowercase letters, numbers and underscores.";
  }
  return null;
}

export default function Form02() {
  const [mode, setMode] = React.useState<Mode>("onSubmit");
  const [claimed, setClaimed] = React.useState<string | null>(null);
  const active = modes.find((item) => item.value === mode) ?? modes[0];

  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <span id="form-02-mode" className="text-sm font-medium">
          Validate
        </span>
        <ToggleGroup
          aria-labelledby="form-02-mode"
          variant="outline"
          size="sm"
          spacing={0}
          value={[mode]}
          onValueChange={(value) => {
            const next = value[0] as Mode | undefined;
            if (next) {
              setMode(next);
              setClaimed(null);
            }
          }}
          className="w-full"
        >
          {modes.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground">{active.hint}</p>
      </div>
      <Form
        key={mode}
        validationMode={mode}
        aria-label="Claim your handle"
        className="rounded-xl border border-border bg-card p-5"
        onFormSubmit={(values) => setClaimed(String(values.handle))}
      >
        <FieldGroup className="gap-4">
          <Field
            name="handle"
            validate={validateHandle}
            validationDebounceTime={mode === "onChange" ? 300 : 0}
          >
            <FieldLabel>Handle</FieldLabel>
            <Input
              autoComplete="off"
              spellCheck={false}
              placeholder="dana_builds"
            />
            <FieldDescription>Your public profile address.</FieldDescription>
            <FieldError />
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input
              required
              type="email"
              autoComplete="email"
              placeholder="dana@northwind.io"
            />
            <FieldError match="valueMissing">
              We need an email to confirm the handle.
            </FieldError>
            <FieldError match="typeMismatch">
              Enter an address like name@company.com.
            </FieldError>
          </Field>
        </FieldGroup>
        <Button type="submit">Claim handle</Button>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {claimed ? (
            <>
              <span className="font-medium text-foreground">@{claimed}</span>{" "}
              is yours.
            </>
          ) : null}
        </p>
      </Form>
    </div>
  );
}
