"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/base/ui/combobox";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const directory = [
  { value: "amara", label: "Amara Nwosu", email: "amara@northwind.io", member: false },
  { value: "ben", label: "Ben Hartley", email: "ben@northwind.io", member: true },
  { value: "chloe", label: "Chloé Martin", email: "chloe@northwind.io", member: false },
  { value: "diego", label: "Diego Alvarez", email: "diego@northwind.io", member: false },
  { value: "hana", label: "Hana Kobayashi", email: "hana@northwind.io", member: true },
  { value: "isaac", label: "Isaac Porter", email: "isaac@northwind.io", member: false },
  { value: "leila", label: "Leila Haddad", email: "leila@northwind.io", member: false },
  { value: "oscar", label: "Oscar Lindgren", email: "oscar@northwind.io", member: false },
];

type Person = (typeof directory)[number];

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const seatsLeft = 4;

export default function Combobox11() {
  const anchor = useComboboxAnchor();
  const [invitees, setInvitees] = React.useState<Person[]>([directory[2]]);
  const [role, setRole] = React.useState<string | null>("editor");
  const [sent, setSent] = React.useState<string | null>(null);
  const overLimit = invitees.length > seatsLeft;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (invitees.length === 0 || overLimit) return;
    setSent(
      `Invited ${invitees.length} ${invitees.length === 1 ? "person" : "people"} as ${role}.`,
    );
    setInvitees([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border bg-card p-5 text-card-foreground"
    >
      <h3 className="text-base font-medium">Invite to Northwind Design</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        New members get access to every project in this workspace.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <Label htmlFor="combobox-11-people">People</Label>
        <Combobox
          items={directory}
          multiple
          value={invitees}
          onValueChange={(value) => {
            setInvitees(value);
            setSent(null);
          }}
        >
          <ComboboxChips ref={anchor} className="w-full">
            <ComboboxValue>
              {(value: Person[]) => (
                <React.Fragment>
                  {value.map((person) => (
                    <ComboboxChip key={person.value} aria-label={person.label}>
                      {person.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="combobox-11-people"
                    aria-describedby="combobox-11-seats"
                    aria-invalid={overLimit || undefined}
                    placeholder={value.length > 0 ? "" : "Name or email"}
                  />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No one in your directory matches.</ComboboxEmpty>
            <ComboboxList>
              {(item: Person) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  disabled={item.member}
                  className="py-1.5"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{item.label}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {item.member ? "Already a member" : item.email}
                    </span>
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p
          id="combobox-11-seats"
          className={
            overLimit ? "text-xs text-destructive" : "text-xs text-muted-foreground"
          }
        >
          {overLimit
            ? `Your plan has ${seatsLeft} seats left. Remove ${invitees.length - seatsLeft} to continue.`
            : `${seatsLeft - invitees.length} of ${seatsLeft} open seats left after this invite.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="combobox-11-role" className="text-muted-foreground">
            Role
          </Label>
          <Select items={roles} value={role} onValueChange={setRole}>
            <SelectTrigger id="combobox-11-role" size="sm" className="w-28">
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
        </div>
        <Button type="submit" disabled={invitees.length === 0 || overLimit}>
          {invitees.length > 1 ? `Send ${invitees.length} invites` : "Send invite"}
        </Button>
      </div>
      <p aria-live="polite" className="mt-3 text-xs text-muted-foreground empty:hidden">
        {sent}
      </p>
    </form>
  );
}
