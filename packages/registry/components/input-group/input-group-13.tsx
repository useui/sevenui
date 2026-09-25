"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MailIcon, SearchIcon, UserPlusIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Kbd } from "@/registry/base/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialMembers = [
  { name: "Olivia Martin", email: "olivia@northwind.io", role: "Owner" },
  { name: "Jackson Lee", email: "jackson@northwind.io", role: "Admin" },
  { name: "Isabella Nguyen", email: "isabella@northwind.io", role: "Member" },
  { name: "William Kim", email: "will@northwind.io", role: "Member" },
  { name: "Sofia Davis", email: "sofia@northwind.io", role: "Billing" },
  { name: "Ethan Brooks", email: "ethan@contractors.dev", role: "Guest" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function InputGroup13() {
  const inputId = useId();
  const countId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inviteId = useId();
  const inviteErrorId = useId();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  function sendInvite() {
    const email = invite.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setInviteError("Enter an email like alex@northwind.io.");
      return;
    }
    if (members.some((member) => member.email === email)) {
      setInviteError("That person is already in the workspace.");
      return;
    }
    const name = email
      .split("@")[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((current) => [...current, { name, email, role: "Invited" }]);
    setInvite("");
    setInviteError(null);
    setInviteOpen(false);
  }

  // Press "/" anywhere outside a text field to jump to search. If the host
  // app already claimed "/" (a site-wide search, say), step aside instead of
  // firing both shortcuts at once.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        event.key !== "/" ||
        event.defaultPrevented ||
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const needle = query.trim().toLowerCase();
  const results = members.filter(
    (member) =>
      member.name.toLowerCase().includes(needle) ||
      member.email.toLowerCase().includes(needle) ||
      member.role.toLowerCase().includes(needle),
  );

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="font-semibold">
          Members{" "}
          <span className="font-normal text-muted-foreground tabular-nums">
            {members.length}
          </span>
        </h3>
        <Popover
          open={inviteOpen}
          onOpenChange={(open) => {
            setInviteOpen(open);
            if (!open) setInviteError(null);
          }}
        >
          <PopoverTrigger render={<Button size="sm" variant="outline" />}>
            <UserPlusIcon aria-hidden="true" />
            Invite
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <PopoverHeader>
              <PopoverTitle>Invite a teammate</PopoverTitle>
              <PopoverDescription>
                They join as a Member once they accept.
              </PopoverDescription>
            </PopoverHeader>
            <form
              noValidate
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendInvite();
              }}
            >
              <label htmlFor={inviteId} className="sr-only">
                Email address
              </label>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  id={inviteId}
                  type="email"
                  value={invite}
                  placeholder="name@company.com"
                  autoComplete="off"
                  aria-invalid={inviteError ? true : undefined}
                  aria-describedby={inviteError ? inviteErrorId : undefined}
                  onChange={(event) => {
                    setInvite(event.target.value);
                    if (inviteError) setInviteError(null);
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="submit" variant="secondary">
                    Send
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {inviteError ? (
                <p id={inviteErrorId} role="alert" className="text-xs text-destructive">
                  {inviteError}
                </p>
              ) : null}
            </form>
          </PopoverContent>
        </Popover>
      </div>
      <div className="px-4 pt-3 pb-2">
        <label htmlFor={inputId} className="sr-only">
          Search members
        </label>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            placeholder="Name, email, or role"
            aria-describedby={countId}
            className="[&::-webkit-search-cancel-button]:hidden"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          <InputGroupAddon align="inline-end">
            {needle ? (
              <>
                <InputGroupText id={countId} className="text-xs tabular-nums">
                  {results.length} of {members.length}
                </InputGroupText>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                >
                  <XIcon aria-hidden="true" />
                </InputGroupButton>
              </>
            ) : (
              <Kbd aria-label="Press slash to search">/</Kbd>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ul aria-label="Team members" className="max-h-72 overflow-y-auto px-2 pb-2">
        {results.map((member) => (
          <li
            key={member.email}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
          >
            <Avatar className="size-8">
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback className="text-xs">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {member.role}
            </span>
          </li>
        ))}
      </ul>
      {results.length === 0 ? (
        <div className="px-4 pt-2 pb-8 text-center" aria-live="polite">
          <p className="text-sm font-medium">No one matches "{query.trim()}"</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check the spelling, or invite them to the workspace.
          </p>
        </div>
      ) : null}
    </div>
  );
}
