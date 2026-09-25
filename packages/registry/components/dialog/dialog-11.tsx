"use client";

import * as React from "react";
import { UserPlus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

type Role = "admin" | "member" | "viewer";

type Member = {
  name: string;
  email: string;
  role: Role;
  invited?: boolean;
};

const roles: { value: Role; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Manages billing and members" },
  { value: "member", label: "Member", hint: "Creates and edits projects" },
  { value: "viewer", label: "Viewer", hint: "Can view and comment" },
];

const roleLabel = Object.fromEntries(
  roles.map((role) => [role.value, role.label]),
) as Record<Role, string>;

const initialMembers: Member[] = [
  { name: "Olivia Martin", email: "olivia@northwind.io", role: "admin" },
  { name: "Jackson Lee", email: "jackson@northwind.io", role: "member" },
  { name: "Sofia Davis", email: "sofia@northwind.io", role: "viewer" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Dialog11() {
  const [members, setMembers] = React.useState(initialMembers);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [emails, setEmails] = React.useState<string[]>([]);
  const [role, setRole] = React.useState<Role>("member");
  const [error, setError] = React.useState<string | null>(null);

  const addEmails = (value: string) => {
    const candidates = value
      .split(/[\s,;]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    if (candidates.length === 0) return;

    const invalid = candidates.find((entry) => !emailPattern.test(entry));
    if (invalid) {
      setError(`“${invalid}” is not a valid email address.`);
      return;
    }
    const taken = new Set([...emails, ...members.map((m) => m.email)]);
    const fresh = candidates.filter((entry) => !taken.has(entry));
    if (fresh.length === 0) {
      setError("Everyone you entered is already on the team or on the list.");
      setDraft("");
      return;
    }
    setEmails((current) => [...current, ...fresh]);
    setDraft("");
    setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addEmails(draft);
    } else if (event.key === "Backspace" && draft === "" && emails.length) {
      setEmails((current) => current.slice(0, -1));
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setDraft("");
      setEmails([]);
      setError(null);
      setRole("member");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pending = draft.trim() ? [...emails, draft.trim().toLowerCase()] : emails;
    if (pending.some((entry) => !emailPattern.test(entry))) {
      addEmails(draft);
      return;
    }
    if (pending.length === 0) {
      setError("Add at least one email address.");
      return;
    }
    setMembers((current) => [
      ...current,
      ...pending.map((email) => ({ name: email, email, role, invited: true })),
    ]);
    handleOpenChange(false);
  };

  const inviteCount = emails.length + (draft.trim() ? 1 : 0);

  return (
    <section
      aria-labelledby="dialog-11-heading"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-4 border-b p-4">
        <div className="min-w-0">
          <h2 id="dialog-11-heading" className="font-medium">
            Team members
          </h2>
          <p className="text-sm text-muted-foreground">
            {members.length} people in Northwind
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger
            render={
              <Button size="sm">
                <UserPlus aria-hidden="true" data-icon="inline-start" />
                Invite
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>Invite to Northwind</DialogTitle>
                <DialogDescription>
                  Invitations expire after 7 days. Paste several addresses at
                  once, separated by commas.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <Label htmlFor="dialog-11-emails">Email addresses</Label>
                <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                  <ul aria-label="Addresses to invite" className="contents">
                    {emails.map((email) => (
                      <li key={email}>
                        <Badge variant="secondary" className="h-6 gap-0.5 pr-0.5">
                          {email}
                          <button
                            type="button"
                            onClick={() =>
                              setEmails((current) =>
                                current.filter((entry) => entry !== email),
                              )
                            }
                            aria-label={`Remove ${email}`}
                            className="grid size-5 place-items-center rounded-full outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X aria-hidden="true" className="size-3" />
                          </button>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                  <input
                    id="dialog-11-emails"
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addEmails(draft)}
                    onPaste={(event) => {
                      event.preventDefault();
                      addEmails(event.clipboardData.getData("text"));
                    }}
                    placeholder={emails.length ? "" : "name@company.com"}
                    aria-invalid={error ? true : undefined}
                    aria-describedby="dialog-11-emails-hint"
                    className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p
                  id="dialog-11-emails-hint"
                  aria-live="polite"
                  className={
                    error ? "text-sm text-destructive" : "text-xs text-muted-foreground"
                  }
                >
                  {error ?? "Press Enter to add each address."}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dialog-11-role">Role</Label>
                <Select
                  items={roles}
                  value={role}
                  onValueChange={(value) => value && setRole(value)}
                >
                  <SelectTrigger id="dialog-11-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.hint}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <DialogClose
                  render={
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  }
                />
                <Button type="submit" disabled={inviteCount === 0}>
                  {inviteCount > 1
                    ? `Send ${inviteCount} invites`
                    : "Send invite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <ul className="divide-y">
        {members.map((member) => (
          <li key={member.email} className="flex items-center gap-3 px-4 py-3">
            <Avatar>
              {!member.invited && (
                <AvatarImage src="/placeholder.svg" alt="" />
              )}
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {member.invited ? member.email : member.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.invited
                  ? `Invited as ${roleLabel[member.role]}`
                  : member.email}
              </p>
            </div>
            {member.invited ? (
              <Badge variant="outline">Pending</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">
                {roleLabel[member.role]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
