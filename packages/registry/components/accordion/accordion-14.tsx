"use client";

import { Lock } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

const permissions = [
  { id: "projects.edit", label: "Edit projects and environments" },
  { id: "deploy.production", label: "Deploy to production" },
  { id: "members.invite", label: "Invite and remove members" },
  { id: "billing.manage", label: "Manage billing and plans" },
  { id: "analytics.view", label: "View usage analytics" },
];

const roles = [
  {
    value: "owner",
    name: "Owner",
    summary: "Full access. Cannot be edited.",
    locked: true,
    members: [
      { name: "Mara Lindqvist", initials: "ML" },
    ],
  },
  {
    value: "admin",
    name: "Admin",
    summary: "Runs the workspace day to day.",
    locked: false,
    members: [
      { name: "Theo Okafor", initials: "TO" },
      { name: "Priya Raman", initials: "PR" },
    ],
  },
  {
    value: "developer",
    name: "Developer",
    summary: "Builds and ships projects.",
    locked: false,
    members: [
      { name: "Jonas Weber", initials: "JW" },
      { name: "Aiko Tanaka", initials: "AT" },
      { name: "Lucas Moreau", initials: "LM" },
      { name: "Sofia Alvarez", initials: "SA" },
      { name: "Kwame Mensah", initials: "KM" },
    ],
  },
  {
    value: "viewer",
    name: "Viewer",
    summary: "Read-only access for stakeholders.",
    locked: false,
    members: [
      { name: "Hannah Brooks", initials: "HB" },
      { name: "Diego Ramos", initials: "DR" },
    ],
  },
];

type Grants = Record<string, string[]>;

const initialGrants: Grants = {
  owner: permissions.map((p) => p.id),
  admin: ["projects.edit", "deploy.production", "members.invite", "analytics.view"],
  developer: ["projects.edit", "deploy.production"],
  viewer: ["analytics.view"],
};

const visibleAvatars = 3;

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
}

export default function Accordion14() {
  const [saved, setSaved] = React.useState(initialGrants);
  const [draft, setDraft] = React.useState(initialGrants);
  const [status, setStatus] = React.useState("");

  const changedRoles = roles.filter(
    (role) => !sameSet(saved[role.value], draft[role.value]),
  );
  const dirty = changedRoles.length > 0;

  function toggle(role: string, permission: string, checked: boolean) {
    setStatus("");
    setDraft((current) => ({
      ...current,
      [role]: checked
        ? [...current[role], permission]
        : current[role].filter((id) => id !== permission),
    }));
  }

  function save() {
    setSaved(draft);
    setStatus(
      `Permissions updated for ${changedRoles.map((r) => r.name).join(", ")}.`,
    );
  }

  function discard() {
    setDraft(saved);
    setStatus("Changes discarded.");
  }

  return (
    <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-col gap-1 px-4 pt-4 pb-3">
        <h3 className="text-base font-semibold">Roles and permissions</h3>
        <p className="text-sm text-muted-foreground">
          Changes apply to every member with that role.
        </p>
      </div>
      <Accordion defaultValue={["developer"]} className="border-t">
        {roles.map((role) => {
          const granted = draft[role.value];
          const changed = changedRoles.includes(role);
          const extra = role.members.length - visibleAvatars;
          return (
            <AccordionItem key={role.value} value={role.value}>
              <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3 hover:bg-muted/50 hover:no-underline focus-visible:ring-inset">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    {role.name}
                    {role.locked && (
                      <Lock
                        aria-hidden="true"
                        className="size-3 text-muted-foreground"
                      />
                    )}
                    {changed && (
                      <span className="size-1.5 rounded-full bg-primary">
                        <span className="sr-only">Unsaved changes</span>
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {granted.length} of {permissions.length} permissions ·{" "}
                    {role.members.length}{" "}
                    {role.members.length === 1 ? "member" : "members"}
                  </span>
                </span>
                <AvatarGroup aria-hidden="true" className="max-[360px]:hidden">
                  {role.members.slice(0, visibleAvatars).map((member) => (
                    <Avatar key={member.name} size="sm">
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  {extra > 0 && (
                    <AvatarGroupCount className="text-xs">
                      +{extra}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <fieldset
                  disabled={role.locked}
                  className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3"
                >
                  <legend className="sr-only">{role.name} permissions</legend>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {role.summary}
                  </p>
                  {permissions.map((permission) => {
                    const id = `accordion-14-${role.value}-${permission.id}`;
                    return (
                      <div
                        key={permission.id}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <Checkbox
                          id={id}
                          disabled={role.locked}
                          checked={granted.includes(permission.id)}
                          onCheckedChange={(checked) =>
                            toggle(role.value, permission.id, checked)
                          }
                        />
                        <Label htmlFor={id} className="font-normal">
                          {permission.label}
                        </Label>
                      </div>
                    );
                  })}
                </fieldset>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {dirty
            ? `Unsaved changes in ${changedRoles.length} ${changedRoles.length === 1 ? "role" : "roles"}`
            : status || "All changes saved"}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={!dirty} onClick={discard}>
            Discard
          </Button>
          <Button size="sm" disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
