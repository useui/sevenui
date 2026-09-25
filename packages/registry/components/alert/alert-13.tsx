"use client";

import * as React from "react";
import { UsersRoundIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const INCLUDED_SEATS = 5;

const initialMembers = [
  { name: "Ava Chen", email: "ava@orbitlabs.dev", role: "Owner" },
  { name: "Jonah Reyes", email: "jonah@orbitlabs.dev", role: "Admin" },
  { name: "Priya Nair", email: "priya@orbitlabs.dev", role: "Member" },
  { name: "Leo Martins", email: "leo@orbitlabs.dev", role: "Member" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Alert13() {
  const [members, setMembers] = React.useState([
    ...initialMembers,
    { name: "Sam Patel", email: "sam@orbitlabs.dev", role: "Invited" },
  ]);
  const [seatLimit, setSeatLimit] = React.useState(INCLUDED_SEATS);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const full = members.length >= seatLimit;

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim();
    if (!address || full) return;
    if (
      members.some(
        (member) => member.email.toLowerCase() === address.toLowerCase(),
      )
    ) {
      setError(`${address} is already on the team.`);
      return;
    }
    setError(null);
    setMembers((current) => [
      ...current,
      { name: address.split("@")[0], email: address, role: "Invited" },
    ]);
    setEmail("");
  }

  return (
    <section
      aria-labelledby="alert-13-heading"
      className="grid w-full max-w-md gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="alert-13-heading" className="font-medium">
          Team members
        </h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          {members.length} of {seatLimit} seats
        </span>
      </div>
      <ul className="grid gap-3">
        {members.map((member) => (
          <li key={member.email} className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{member.role}</span>
          </li>
        ))}
      </ul>
      {full ? (
        <Alert aria-live="polite">
          <UsersRoundIcon aria-hidden="true" />
          <AlertTitle>All {seatLimit} seats are in use</AlertTitle>
          <AlertDescription>
            Remove a member or add a seat for $12 a month to invite
            more people.
          </AlertDescription>
          <div className="col-start-2 mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setSeatLimit((limit) => limit + 1)}>
              Add a seat
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!members.some((member) => member.role === "Invited")}
              onClick={() =>
                setMembers((current) => {
                  const last = current
                    .map((member) => member.role)
                    .lastIndexOf("Invited");
                  return current.filter((_, index) => index !== last);
                })
              }
            >
              Remove last invite
            </Button>
          </div>
        </Alert>
      ) : (
        <form onSubmit={invite} className="grid gap-2">
          <Label htmlFor="alert-13-email">Invite by email</Label>
          <div className="flex gap-2">
            <Input
              id="alert-13-email"
              type="email"
              placeholder="name@orbitlabs.dev"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby="alert-13-hint"
              required
            />
            <Button type="submit">Invite</Button>
          </div>
          <p
            id="alert-13-hint"
            aria-live="polite"
            className={
              error ? "text-xs text-destructive" : "text-xs text-muted-foreground"
            }
          >
            {error ??
              `${seatLimit - members.length} seat${
                seatLimit - members.length === 1 ? "" : "s"
              } left on your plan.`}
          </p>
        </form>
      )}
    </section>
  );
}
