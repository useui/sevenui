"use client";

import { ChevronDownIcon, RotateCwIcon, XIcon } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

type Role = "Admin" | "Member" | "Viewer";

const roles: { value: Role; description: string }[] = [
  { value: "Admin", description: "Manage billing and members" },
  { value: "Member", description: "Create and edit projects" },
  { value: "Viewer", description: "Read-only access" },
];

type Invite = { email: string; role: Role; sent: string };

const initialInvites: Invite[] = [
  { email: "jordan@northwind.io", role: "Member", sent: "Sent 2 days ago" },
  { email: "sam.okafor@northwind.io", role: "Viewer", sent: "Sent 5 days ago" },
];

export default function ButtonGroup12() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [invites, setInvites] = useState(initialInvites);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid work email, like name@company.com.");
      return;
    }
    if (invites.some((invite) => invite.email === value)) {
      setError(`${value} already has a pending invite.`);
      return;
    }
    setInvites((list) => [{ email: value, role, sent: "Sent just now" }, ...list]);
    setEmail("");
    setError(null);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>Invite teammates</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonGroup className="w-full min-w-0">
            <Input
              id={`${id}-email`}
              type="email"
              autoComplete="off"
              placeholder="name@northwind.io"
              value={email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              className="min-w-0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" aria-label={`Role: ${role}`}>
                    {role}
                    <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as Role)}
                >
                  {roles.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      closeOnClick
                    >
                      <span className="flex flex-col">
                        <span>{option.value}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
          <Button type="submit">Send invite</Button>
        </div>
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </form>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Pending invites ({invites.length})
        </span>
        {invites.length > 0 ? (
          <ul className="flex flex-col divide-y rounded-lg border">
            {invites.map((invite) => (
              <li
                key={invite.email}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">{invite.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {invite.role} · {invite.sent}
                  </span>
                </div>
                <ButtonGroup aria-label={`Manage invite for ${invite.email}`}>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Resend invite to ${invite.email}`}
                    onClick={() =>
                      setInvites((list) =>
                        list.map((item) =>
                          item.email === invite.email
                            ? { ...item, sent: "Resent just now" }
                            : item,
                        ),
                      )
                    }
                  >
                    <RotateCwIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Revoke invite for ${invite.email}`}
                    onClick={() =>
                      setInvites((list) =>
                        list.filter((item) => item.email !== invite.email),
                      )
                    }
                    className="hover:text-destructive"
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No pending invites. New teammates appear here until they accept.
          </p>
        )}
      </div>
    </div>
  );
}
