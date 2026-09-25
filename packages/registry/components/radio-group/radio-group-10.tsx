"use client";

import * as React from "react";
import { Check, CircleAlert, CircleCheck, Minus } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const roles = [
  { value: "viewer", label: "Viewer", summary: "Can view and comment" },
  { value: "editor", label: "Editor", summary: "Can edit projects" },
  { value: "admin", label: "Admin", summary: "Full workspace access" },
];

const permissions = [
  { label: "View projects and comment", roles: ["viewer", "editor", "admin"] },
  { label: "Create and edit projects", roles: ["editor", "admin"] },
  { label: "Publish to production", roles: ["editor", "admin"] },
  { label: "Manage members and billing", roles: ["admin"] },
];

export default function RadioGroup10() {
  const [role, setRole] = React.useState("editor");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "error" } | { kind: "sent"; to: string; role: string }
  >({ kind: "idle" });
  const selected = roles.find((item) => item.value === role) ?? roles[0];
  const invalid = status.kind === "error";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
        if (!email.trim() || !input.checkValidity()) {
          setStatus({ kind: "error" });
          input.focus();
          return;
        }
        setStatus({ kind: "sent", to: email.trim(), role: selected.label.toLowerCase() });
        setEmail("");
      }}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Invite to Northwind</h3>
        <p className="text-sm text-muted-foreground">
          They will get an email with a link to join this workspace.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="radio-group-10-email">Email address</Label>
        <Input
          id="radio-group-10-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status.kind !== "idle") setStatus({ kind: "idle" });
          }}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "radio-group-10-error" : undefined}
          placeholder="daniel@northwind.dev"
        />
        {invalid ? (
          <p id="radio-group-10-error" className="flex items-center gap-1.5 text-xs text-destructive">
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            Enter a valid email address.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <span id="radio-group-10-role" className="text-sm font-medium">
          Role
        </span>
        <RadioGroup
          aria-labelledby="radio-group-10-role"
          value={role}
          onValueChange={(value) => setRole(value as string)}
          className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
        >
          {roles.map((item) => (
            <Label
              key={item.value}
              className="relative cursor-pointer justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:text-foreground has-data-checked:bg-background has-data-checked:text-foreground has-data-checked:shadow-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <RadioGroupItem value={item.value} className="sr-only absolute" />
              {item.label}
            </Label>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {selected.summary}
        </p>
      </div>
      <ul className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
        {permissions.map((permission) => {
          const allowed = permission.roles.includes(role);
          return (
            <li
              key={permission.label}
              className={allowed ? "flex items-center gap-2" : "flex items-center gap-2 text-muted-foreground"}
            >
              {allowed ? (
                <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
              ) : (
                <Minus aria-hidden="true" className="size-4 shrink-0" />
              )}
              <span className={allowed ? undefined : "line-through decoration-muted-foreground/40"}>
                {permission.label}
              </span>
              <span className="sr-only">{allowed ? "(allowed)" : "(not allowed)"}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Send invite as {selected.label.toLowerCase()}
        </Button>
        <p aria-live="polite" className="flex min-h-4 items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          {status.kind === "sent" ? (
            <>
              <CircleCheck aria-hidden="true" className="size-3.5 shrink-0 text-success" />
              Invite sent to {status.to} as {status.role}.
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
