"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const roles = [
  {
    value: "admin",
    label: "Admin",
    hint: "Manage billing, members, and every project.",
  },
  {
    value: "member",
    label: "Member",
    hint: "Create projects and deploy to preview.",
  },
  {
    value: "viewer",
    label: "Viewer",
    hint: "Read-only access to projects and logs.",
  },
];

const existingMembers = ["maya@northwind.io", "daniel@northwind.io"];
const seatLimit = 10;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Field10() {
  const inputId = useId();
  const [emails, setEmails] = useState<string[]>(["priya@northwind.io"]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>("member");
  const [sent, setSent] = useState<number | null>(null);
  const [seatsUsed, setSeatsUsed] = useState(7);
  const seatsLeft = seatLimit - seatsUsed - emails.length;
  const roleHint = roles.find((item) => item.value === role)?.hint;

  function commit(raw: string) {
    const candidates = raw
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (candidates.length === 0) return;
    const next = [...emails];
    for (const email of candidates) {
      if (!emailPattern.test(email)) {
        setError(`"${email}" isn't a valid email address.`);
        return;
      }
      if (existingMembers.includes(email)) {
        setError(`${email} is already on the team.`);
        return;
      }
      if (next.includes(email)) continue;
      if (seatLimit - seatsUsed - next.length <= 0) {
        setError("No seats left. Remove someone or upgrade your plan.");
        return;
      }
      next.push(email);
    }
    setEmails(next);
    setDraft("");
    setError(null);
    setSent(null);
  }

  return (
    <form
      className="w-full max-w-md rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.trim()) {
          commit(draft);
          return;
        }
        if (emails.length > 0) {
          setSent(emails.length);
          setSeatsUsed((current) => current + emails.length);
          setEmails([]);
        }
      }}
    >
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="font-semibold">Invite teammates</h3>
        <p className="text-sm text-muted-foreground">
          They'll get an email with a link to join Northwind.
        </p>
      </div>
      <FieldGroup className="gap-4">
        <Field invalid={error !== null}>
          <FieldLabel htmlFor={inputId}>Email addresses</FieldLabel>
          <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input px-1.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 group-data-[invalid]/field:border-destructive dark:bg-input/30">
            {emails.map((email) => (
              <span
                key={email}
                className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted pr-0.5 pl-2 text-xs font-medium text-foreground"
              >
                <span className="truncate">{email}</span>
                <button
                  type="button"
                  aria-label={`Remove ${email}`}
                  onClick={() =>
                    setEmails((current) =>
                      current.filter((item) => item !== email),
                    )
                  }
                  className="grid size-5 place-items-center rounded-sm text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon aria-hidden="true" className="size-3" />
                </button>
              </span>
            ))}
            <input
              id={inputId}
              type="email"
              value={draft}
              placeholder={emails.length ? "Add another" : "name@company.com"}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === "," ||
                  event.key === " "
                ) {
                  if (draft.trim()) {
                    event.preventDefault();
                    commit(draft);
                  }
                } else if (
                  event.key === "Backspace" &&
                  draft === "" &&
                  emails.length > 0
                ) {
                  setEmails((current) => current.slice(0, -1));
                }
              }}
              onBlur={() => commit(draft)}
              onPaste={(event) => {
                event.preventDefault();
                commit(`${draft} ${event.clipboardData.getData("text")}`);
              }}
              aria-invalid={error !== null || undefined}
              className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              Press Enter or comma to add. Paste a list to add several at once.
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select items={roles} value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{roleHint}</FieldDescription>
        </Field>
      </FieldGroup>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {sent !== null ? (
            <span className="text-foreground">
              {sent} {sent === 1 ? "invite" : "invites"} sent.
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground tabular-nums">
                {seatsLeft}
              </span>{" "}
              of {seatLimit} seats left
            </>
          )}
        </p>
        <Button type="submit" disabled={emails.length === 0 && !draft}>
          {emails.length > 1 ? `Send ${emails.length} invites` : "Send invite"}
        </Button>
      </div>
    </form>
  );
}
