"use client";

import { UserMinus } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const initialMembers = [
  { email: "maya.chen@northwind.io", name: "Maya Chen", role: "Owner" },
  { email: "daniel.ortiz@northwind.io", name: "Daniel Ortiz", role: "Admin" },
  { email: "priya.nair@northwind.io", name: "Priya Nair", role: "Member" },
  { email: "tom.becker@northwind.io", name: "Tom Becker", role: "Member" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Meter09() {
  const [members, setMembers] = React.useState(initialMembers);
  const [seats, setSeats] = React.useState(5);
  const [email, setEmail] = React.useState("");

  const full = members.length >= seats;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const duplicate = members.some(
    (member) => member.email === email.trim().toLowerCase(),
  );

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (full || !validEmail || duplicate) return;
    const address = email.trim().toLowerCase();
    setMembers((current) => [
      ...current,
      { email: address, name: nameFromEmail(address), role: "Invited" },
    ]);
    setEmail("");
  }

  return (
    <section
      aria-labelledby="meter-09-title"
      className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="meter-09-title" className="font-medium">
            Team members
          </h3>
          <p className="text-sm text-muted-foreground">
            Seats are billed at $12 per month each.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSeats((current) => current + 5)}
        >
          Add 5 seats
        </Button>
      </div>

      <Meter
        value={members.length}
        max={seats}
        getAriaValueText={() => `${members.length} of ${seats} seats used`}
        className={
          full
            ? "mt-4 grid-cols-[1fr_auto] [&>div:last-of-type]:bg-warning/20 [&>div:last-of-type>div]:bg-warning"
            : "mt-4 grid-cols-[1fr_auto]"
        }
      >
        <MeterLabel>Seats used</MeterLabel>
        <MeterValue className="tabular-nums">
          {() => `${members.length} of ${seats}`}
        </MeterValue>
      </Meter>

      <form onSubmit={invite} className="mt-4 flex gap-2">
        <Input
          type="email"
          aria-label="Email address to invite"
          placeholder="name@northwind.io"
          value={email}
          disabled={full}
          onChange={(event) => setEmail(event.target.value)}
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={full || !validEmail || duplicate}>
          Invite
        </Button>
      </form>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-muted-foreground">
        {full
          ? "All seats are taken. Add seats or remove a member to invite someone."
          : duplicate
            ? "That person is already on the team."
            : `${seats - members.length} open ${seats - members.length === 1 ? "seat" : "seats"} left.`}
      </p>

      <ul className="mt-3 divide-y border-t">
        {members.map((member) => (
          <li key={member.email} className="flex items-center gap-3 py-2.5">
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
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${member.name}`}
              disabled={member.role === "Owner"}
              onClick={() =>
                setMembers((current) =>
                  current.filter((item) => item.email !== member.email),
                )
              }
            >
              <UserMinus aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
