"use client";

import { useId, useState } from "react";
import { ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

// Swaps the default check for a dash while the box is indeterminate.
const mixedIndicator =
  "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:[&_svg]:hidden data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current";

const groups = [
  {
    id: "projects",
    label: "Projects",
    permissions: [
      { id: "projects.view", label: "View all projects" },
      { id: "projects.create", label: "Create projects" },
      { id: "projects.archive", label: "Archive projects" },
    ],
  },
  {
    id: "members",
    label: "Members",
    permissions: [
      { id: "members.invite", label: "Invite members" },
      { id: "members.roles", label: "Change member roles" },
      { id: "members.remove", label: "Remove members" },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    permissions: [
      { id: "billing.invoices", label: "Download invoices" },
      { id: "billing.payment", label: "Update payment method" },
      { id: "billing.plan", label: "Change plan" },
    ],
  },
];

const initialSaved = [
  "projects.view",
  "projects.create",
  "projects.archive",
  "members.invite",
  "billing.invoices",
];

export default function Checkbox13() {
  const baseId = useId();
  const [saved, setSaved] = useState<string[]>(initialSaved);
  const [granted, setGranted] = useState<string[]>(initialSaved);
  const [justSaved, setJustSaved] = useState(false);
  const total = groups.reduce(
    (sum, group) => sum + group.permissions.length,
    0,
  );
  const changes =
    granted.filter((id) => !saved.includes(id)).length +
    saved.filter((id) => !granted.includes(id)).length;

  function setMany(ids: string[], checked: boolean) {
    setJustSaved(false);
    setGranted((prev) =>
      checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((id) => !ids.includes(id)),
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-start gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <ShieldCheckIcon aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium">Project lead</h3>
            <Badge variant="secondary">4 members</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
            {granted.length} of {total} permissions granted
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {groups.map((group) => {
          const ids = group.permissions.map((permission) => permission.id);
          const count = ids.filter((id) => granted.includes(id)).length;
          const groupId = `${baseId}-${group.id}`;
          return (
            <fieldset
              key={group.id}
              className="rounded-lg border border-border"
              aria-labelledby={`${groupId}-label`}
            >
              <div className="flex items-center gap-3 rounded-t-lg bg-muted/50 px-3 py-2.5">
                <Checkbox
                  id={groupId}
                  className={mixedIndicator}
                  checked={count === ids.length}
                  indeterminate={count > 0 && count < ids.length}
                  onCheckedChange={(checked) => setMany(ids, checked)}
                />
                <Label
                  id={`${groupId}-label`}
                  htmlFor={groupId}
                  className="flex-1"
                >
                  {group.label}
                </Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count}/{ids.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5 px-3 py-3 ps-10">
                {group.permissions.map((permission) => {
                  const id = `${baseId}-${permission.id.replace(".", "-")}`;
                  const changed =
                    granted.includes(permission.id) !==
                    saved.includes(permission.id);
                  return (
                    <li key={permission.id} className="flex items-center gap-3">
                      <Checkbox
                        id={id}
                        checked={granted.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          setMany([permission.id], checked)
                        }
                      />
                      <Label htmlFor={id} className="flex-1 font-normal">
                        {permission.label}
                      </Label>
                      {changed ? (
                        <span className="text-xs text-muted-foreground">
                          Edited
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3 ps-4">
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {changes === 0
            ? justSaved
              ? "Role saved"
              : "No unsaved changes"
            : `${changes} unsaved ${changes === 1 ? "change" : "changes"}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            disabled={changes === 0}
            onClick={() => setGranted(saved)}
          >
            Reset
          </Button>
          <Button
            disabled={changes === 0}
            onClick={() => {
              setSaved(granted);
              setJustSaved(true);
            }}
          >
            Save role
          </Button>
        </div>
      </div>
    </div>
  );
}
