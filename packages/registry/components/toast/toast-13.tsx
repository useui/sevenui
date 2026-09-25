"use client";

import * as React from "react";
import { MailIcon, UserPlusIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { Toaster, createToastManager } from "@/registry/base/ui/toast";

const toastManager = createToastManager();

const roles = ["Viewer", "Editor", "Admin"];

const members = [
  { name: "Priya Natarajan", email: "priya@acme.io", role: "Owner" },
  { name: "Daniel Okafor", email: "daniel@acme.io", role: "Admin" },
];

type Invite = { email: string; role: string; sentAt: number };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(value: string) {
  return value
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Toast13() {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Editor");
  const [invites, setInvites] = React.useState<Invite[]>([
    { email: "marta@acme.io", role: "Viewer", sentAt: 0 },
  ]);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();

    // Format problems stay inline next to the field.
    if (!emailPattern.test(address)) {
      setError("Enter a full email address, like alex@acme.io.");
      return;
    }
    setError(null);

    // Outcomes of the request itself are reported with a toast.
    const member = members.find((entry) => entry.email === address);
    if (member) {
      toastManager.add({
        type: "info",
        title: `${member.name} is already on the team`,
        description: `They have ${member.role} access. Change roles from the members list.`,
      });
      return;
    }

    if (invites.some((invite) => invite.email === address)) {
      toastManager.add({
        type: "warning",
        title: "Invite already pending",
        description: `${address} hasn't accepted yet. Use Resend to nudge them.`,
      });
      return;
    }

    setInvites((current) => [
      { email: address, role, sentAt: Date.now() },
      ...current,
    ]);
    setEmail("");
    const toastId = toastManager.add({
      type: "success",
      title: `Invite sent to ${address}`,
      description: `They'll join as ${role.toLowerCase()} once they accept. The link expires in 7 days.`,
      actionProps: {
        children: "Cancel invite",
        onClick: () => {
          setInvites((current) =>
            current.filter((invite) => invite.email !== address),
          );
          toastManager.close(toastId);
          toastManager.add({
            title: "Invite canceled",
            description: `The link sent to ${address} no longer works.`,
          });
        },
      },
    });
  }

  function resend(invite: Invite) {
    const now = Date.now();
    // Throttle resends so a teammate isn't spammed.
    if (now - invite.sentAt < 60_000) {
      toastManager.add({
        id: `resend-${invite.email}`,
        type: "warning",
        title: "Hold on a minute",
        description: `An invite was just sent to ${invite.email}. You can resend it in under a minute.`,
      });
      return;
    }

    setInvites((current) =>
      current.map((entry) =>
        entry.email === invite.email ? { ...entry, sentAt: now } : entry,
      ),
    );
    toastManager.add({
      id: `resend-${invite.email}`,
      type: "success",
      title: "Invite resent",
      description: `A fresh link is on its way to ${invite.email}.`,
    });
  }

  return (
    <>
      <Toaster toastManager={toastManager} />
      <section
        aria-labelledby="toast-13-heading"
        className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-4 text-card-foreground"
      >
        <div className="flex flex-col gap-1">
          <h3 id="toast-13-heading" className="font-medium">
            Invite teammates
          </h3>
          <p className="text-sm text-muted-foreground">
            New members get access to every project in Acme Design.
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Label htmlFor="toast-13-email">Email address</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="toast-13-email"
              type="email"
              autoComplete="off"
              placeholder="alex@acme.io"
              value={email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "toast-13-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              className="flex-1"
            />
            <div className="flex gap-2">
              <NativeSelect
                aria-label="Role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="flex-1 sm:flex-none"
              >
                {roles.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="submit">
                <UserPlusIcon aria-hidden="true" />
                Invite
              </Button>
            </div>
          </div>
          {error ? (
            <p id="toast-13-error" className="text-xs text-destructive">
              {error}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Try daniel@acme.io or marta@acme.io to see the other outcomes.
            </p>
          )}
        </form>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            Pending invites
          </h4>
          {invites.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {invites.map((invite) => (
                <li
                  key={invite.email}
                  className="flex items-center gap-3 rounded-lg py-1.5"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="text-[0.625rem]">
                      {initials(invite.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm">{invite.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {invite.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Resend invite to ${invite.email}`}
                    onClick={() => resend(invite)}
                  >
                    <MailIcon aria-hidden="true" />
                    Resend
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pending invites.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
