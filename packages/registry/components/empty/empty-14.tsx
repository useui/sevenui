"use client";

import * as React from "react";
import { MailIcon, UserPlusIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Input } from "@/registry/base/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const seatLimit = 5;

type Invite = { email: string; role: string };

export default function Empty14() {
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Editor");
  const [error, setError] = React.useState("");

  const seatsUsed = 1 + invites.length;
  const full = seatsUsed >= seatLimit;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid work email, like sam@acme.com.");
      return;
    }
    if (invites.some((invite) => invite.email === value)) {
      setError(`${value} already has a pending invite.`);
      return;
    }
    setInvites((current) => [...current, { email: value, role }]);
    setEmail("");
    setError("");
  }

  return (
    <section
      aria-labelledby="empty-14-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-start justify-between gap-4 p-4">
        <div>
          <h2 id="empty-14-title" className="text-sm font-medium">
            Team members
          </h2>
          <p className="text-sm text-muted-foreground">
            Invite people to the Acme workspace.
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {seatsUsed} of {seatLimit} seats
        </span>
      </header>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5 px-4"
      >
        <label htmlFor="empty-14-email" className="sr-only">
          Email address
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="empty-14-email"
            type="email"
            placeholder="name@company.com"
            value={email}
            disabled={full}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "empty-14-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <NativeSelect
              aria-label="Role"
              value={role}
              disabled={full}
              onChange={(event) => setRole(event.target.value)}
              className="flex-1 sm:flex-none"
            >
              <NativeSelectOption value="Admin">Admin</NativeSelectOption>
              <NativeSelectOption value="Editor">Editor</NativeSelectOption>
              <NativeSelectOption value="Viewer">Viewer</NativeSelectOption>
            </NativeSelect>
            <Button type="submit" disabled={full}>
              Invite
            </Button>
          </div>
        </div>
        {error && (
          <p id="empty-14-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </form>
      <div className="p-4">
        {invites.length === 0 ? (
          <Empty className="border bg-muted/30 py-8">
            <EmptyHeader>
              <EmptyMedia aria-hidden="true">
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback>ML</AvatarFallback>
                  </Avatar>
                  <div
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 bg-card text-muted-foreground ring-2 ring-background"
                  >
                    <UserPlusIcon className="size-3.5" />
                  </div>
                </AvatarGroup>
              </EmptyMedia>
              <EmptyTitle>It&apos;s just you for now</EmptyTitle>
              <EmptyDescription>
                Invite your team to review designs, comment, and ship together.
                You have {seatLimit - 1} free seats left on the Team plan.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul aria-label="Pending invites" className="flex flex-col divide-y rounded-lg border">
            {invites.map((invite) => (
              <li key={invite.email} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MailIcon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">{invite.role}</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Revoke invite for ${invite.email}`}
                  onClick={() =>
                    setInvites((current) =>
                      current.filter((item) => item.email !== invite.email),
                    )
                  }
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
