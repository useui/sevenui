"use client";

import * as React from "react";
import { CheckIcon, ClockIcon, PlusIcon, XIcon } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";

type Invite = { email: string; name?: string; image?: string };

const seats = 5;

// Empty seats have no identity of their own, so each gets a fixed id.
const openSeatIds = Array.from({ length: seats - 1 }, (_, i) => `seat-${i + 2}`);

const suggestions: Invite[] = [
  {
    email: "noor.aziz@fernbank.co",
    name: "Noor Aziz",
    image: "/placeholder.svg",
  },
  { email: "theo.laurent@fernbank.co", name: "Theo Laurent" },
  { email: "wanjiru.kamau@fernbank.co", name: "Wanjiru Kamau" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initialsFor(invite: Invite) {
  const source = invite.name ?? invite.email.split("@")[0];
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Avatar15() {
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  // Emails already sent; the list can still change, and new ones send again.
  const [sent, setSent] = React.useState<string[]>([]);
  const unsent = invites.filter((invite) => !sent.includes(invite.email));

  const remaining = seats - 1 - invites.length;
  const openSuggestions = suggestions.filter(
    (suggestion) =>
      !invites.some((invite) => invite.email === suggestion.email),
  );

  function add(invite: Invite) {
    if (remaining <= 0) {
      setError("All seats on the Starter plan are taken.");
      return;
    }
    if (invites.some((item) => item.email === invite.email)) {
      setError(`${invite.email} is already on the list.`);
      return;
    }
    setInvites((current) => [...current, invite]);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = draft.trim().toLowerCase();
    if (!emailPattern.test(email)) {
      setError("Enter a full email address, like sam@fernbank.co.");
      return;
    }
    add({ email });
    setDraft("");
  }

  return (
    <section
      aria-labelledby="avatar-15-title"
      className="flex w-full max-w-md flex-col gap-6 rounded-xl border bg-card p-5 text-card-foreground sm:p-6"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground tabular-nums">
          Step 2 of 3
        </p>
        <h3 id="avatar-15-title" className="text-lg font-semibold">
          Invite your team to Fernbank
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          Projects are more useful with the people who work on them. You can
          always invite more later.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <ul aria-label="Seats" className="flex flex-wrap items-center gap-2.5">
          <li>
            <Avatar className="size-11">
              <AvatarImage src="/placeholder.svg" alt="You, Riya Shah" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                RS
              </AvatarFallback>
            </Avatar>
          </li>
          {invites.map((invite) => (
            <li key={invite.email} className="group/seat relative">
              <Avatar className="size-11">
                {invite.image && <AvatarImage src={invite.image} alt="" />}
                <AvatarFallback className="font-medium">
                  {initialsFor(invite)}
                </AvatarFallback>
                <AvatarBadge className="size-4! bg-warning text-warning-foreground [&>svg]:size-2.5!">
                  <ClockIcon aria-hidden="true" strokeWidth={3} />
                </AvatarBadge>
              </Avatar>
              <button
                type="button"
                onClick={() => {
                  setInvites((current) =>
                    current.filter((item) => item.email !== invite.email),
                  );
                  setSent((current) =>
                    current.filter((email) => email !== invite.email),
                  );
                  setError(null);
                }}
                aria-label={`Remove ${invite.name ?? invite.email}, invite pending`}
                className="absolute -top-1 -right-1 z-20 flex size-4.5 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity outline-none group-hover/seat:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 pointer-coarse:opacity-100"
              >
                <XIcon className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
          {openSeatIds.slice(0, Math.max(remaining, 0)).map((id) => (
            <li
              key={id}
              className="flex size-11 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground/60"
            >
              <PlusIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Open seat</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {remaining > 0
            ? `${remaining} of ${seats} seats open on the Starter plan`
            : "Every seat is filled. Upgrade to add more people."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <label htmlFor="avatar-15-email" className="text-sm font-medium">
          Email address
        </label>
        <div className="flex gap-2">
          <Input
            id="avatar-15-email"
            type="email"
            autoComplete="off"
            placeholder="sam@fernbank.co"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "avatar-15-error" : undefined}
            disabled={remaining <= 0}
          />
          <Button type="submit" variant="outline" disabled={remaining <= 0}>
            Add
          </Button>
        </div>
        {error && (
          <p id="avatar-15-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </form>

      {openSuggestions.length > 0 && remaining > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs text-muted-foreground">
            Already at fernbank.co
          </h4>
          <ul className="-mx-2 flex flex-col">
            {openSuggestions.map((suggestion) => (
              <li
                key={suggestion.email}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5"
              >
                <Avatar>
                  {suggestion.image && (
                    <AvatarImage src={suggestion.image} alt="" />
                  )}
                  <AvatarFallback className="text-xs">
                    {initialsFor(suggestion)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{suggestion.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {suggestion.email}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => add(suggestion)}
                  aria-label={`Invite ${suggestion.name}`}
                >
                  Invite
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <Button variant="ghost">Skip for now</Button>
        {invites.length > 0 && unsent.length === 0 ? (
          <p
            role="status"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <CheckIcon className="size-4 text-success" aria-hidden="true" />
            {invites.length === 1 ? "Invite sent" : `${invites.length} invites sent`}
          </p>
        ) : (
          <Button
            disabled={unsent.length === 0}
            onClick={() =>
              setSent((current) => [
                ...current,
                ...unsent.map((invite) => invite.email),
              ])
            }
          >
            {unsent.length > 1
              ? `Send ${unsent.length} invites`
              : unsent.length === 1
                ? "Send invite"
                : "Send invites"}
          </Button>
        )}
      </div>
    </section>
  );
}
