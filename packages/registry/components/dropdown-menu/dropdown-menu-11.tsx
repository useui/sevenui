"use client";

import * as React from "react";
import { Building2, Check, ChevronDown, Globe, Link2, Lock } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const accessLevels = [
  {
    value: "restricted",
    label: "Restricted",
    icon: Lock,
    description: "Only people you added can open this file.",
  },
  {
    value: "organization",
    label: "Anyone at Fieldnote",
    icon: Building2,
    description: "Signed-in teammates with the link can open it.",
  },
  {
    value: "public",
    label: "Anyone with the link",
    icon: Globe,
    description: "No sign-in needed. Search engines won't index it.",
  },
] as const;

const linkRoles = [
  { value: "viewer", label: "Viewer" },
  { value: "commenter", label: "Commenter" },
  { value: "editor", label: "Editor" },
] as const;

type Access = (typeof accessLevels)[number]["value"];

export default function DropdownMenu11() {
  const [access, setAccess] = React.useState<Access>("organization");
  const [role, setRole] = React.useState("viewer");
  const [copied, setCopied] = React.useState(false);
  const current = accessLevels.find((level) => level.value === access) ?? accessLevels[0];
  const currentRole = linkRoles.find((r) => r.value === role) ?? linkRoles[0];
  const isRestricted = access === "restricted";

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <section
      aria-labelledby="dropdown-menu-11-title"
      className="w-full max-w-md rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="dropdown-menu-11-title" className="text-sm font-medium">
          General access
        </h3>
        <span className="truncate text-xs text-muted-foreground">
          Q3 roadmap review.pdf
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          data-public={access === "public" || undefined}
          className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:flex data-public:bg-primary/10 data-public:text-primary"
        >
          <current.icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Who can open this file: ${current.label}`}
                  className="-ml-2 max-w-full font-medium"
                >
                  <span className="truncate">{current.label}</span>
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Who can open this file</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={access}
                  onValueChange={(value) => setAccess(value as Access)}
                >
                  {accessLevels.map((level) => (
                    <DropdownMenuRadioItem
                      key={level.value}
                      value={level.value}
                      label={level.label}
                      closeOnClick
                      className="items-start gap-2.5 py-2"
                    >
                      <level.icon aria-hidden="true" className="mt-0.5 text-muted-foreground" />
                      <span className="flex flex-col gap-0.5">
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {level.description}
                        </span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs text-muted-foreground">{current.description}</p>
        </div>

        {isRestricted ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Link permission: ${currentRole.label}`}
                  className="shrink-0"
                >
                  {currentRole.label}
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>People with the link can</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as string)}
                >
                  {linkRoles.map((r) => (
                    <DropdownMenuRadioItem key={r.value} value={r.value} closeOnClick>
                      {r.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {copied ? "Link copied to clipboard." : "Changes save automatically."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard
              ?.writeText("https://fieldnote.app/f/q3-roadmap-review")
              .catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Link2 aria-hidden="true" data-icon="inline-start" />
          )}
          Copy link
        </Button>
      </div>
    </section>
  );
}
