"use client";

import * as React from "react";
import { CheckIcon, LockIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Spinner } from "@/registry/base/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
];

const guestAccess = [
  { value: "none", label: "No access" },
  { value: "view", label: "View" },
  { value: "comment", label: "Comment" },
];

type Status = "idle" | "saving" | "saved";

export default function ToggleGroup04() {
  const [role, setRole] = React.useState("commenter");
  const [status, setStatus] = React.useState<Status>("idle");
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function handleChange(next: string[]) {
    if (next.length === 0) return;
    setRole(next[0]);
    setStatus("saving");
    if (timeout.current) clearTimeout(timeout.current);
    // Simulate a request to persist the new default role.
    timeout.current = setTimeout(() => setStatus("saved"), 900);
  }

  return (
    <div className="flex w-full max-w-md flex-col divide-y divide-border rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span id="default-role" className="text-sm font-medium">
              Default role for new members
            </span>
            <span className="text-xs text-muted-foreground">
              Owner can only be granted from member settings.
            </span>
          </div>
          <span
            className="flex h-5 shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {status === "saving" && (
              <>
                <Spinner className="size-3.5" aria-hidden="true" />
                Saving
              </>
            )}
            {status === "saved" && (
              <>
                <CheckIcon
                  className="size-3.5 text-success"
                  aria-hidden="true"
                />
                Saved
              </>
            )}
          </span>
        </div>
        <ToggleGroup
          aria-labelledby="default-role"
          variant="outline"
          size="sm"
          spacing={0}
          value={[role]}
          onValueChange={handleChange}
          aria-busy={status === "saving"}
          className="w-full"
        >
          {roles.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1 max-sm:flex-auto max-sm:px-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
          <ToggleGroupItem
            value="owner"
            disabled
            className="flex-1 max-sm:flex-auto max-sm:px-1"
          >
            <LockIcon aria-hidden="true" />
            Owner
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span id="guest-access" className="text-sm font-medium">
              Guest link access
            </span>
            <span className="text-xs text-muted-foreground">
              Set by your organization admin for all workspaces.
            </span>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <LockIcon aria-hidden="true" />
            Managed
          </Badge>
        </div>
        <ToggleGroup
          aria-labelledby="guest-access"
          variant="outline"
          size="sm"
          spacing={0}
          defaultValue={["view"]}
          disabled
          className="w-full"
        >
          {guestAccess.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
