"use client";

import { useId } from "react";
import { AtSignIcon, BuildingIcon, TicketIcon, UserIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

// Four surface treatments over the same anatomy. Only the group's own
// border, fill, radius, and shadow change; the addons stay untouched.
const surfaces = [
  {
    key: "outline",
    style: "Outline",
    label: "Full name",
    placeholder: "Maya Chen",
    icon: UserIcon,
    className: "",
  },
  {
    key: "filled",
    style: "Filled",
    label: "Work email",
    placeholder: "maya@northwind.com",
    icon: AtSignIcon,
    className:
      "border-transparent bg-muted dark:bg-muted has-[[data-slot=input-group-control]:focus-visible]:bg-background",
  },
  {
    key: "underline",
    style: "Underline",
    label: "Company",
    placeholder: "Northwind Labs",
    icon: BuildingIcon,
    className:
      "rounded-none border-x-0 border-t-0 bg-transparent dark:bg-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 [&>[data-align=inline-start]]:pl-0",
  },
  {
    key: "elevated",
    style: "Elevated",
    label: "Invite code",
    placeholder: "NW-2026-BETA",
    icon: TicketIcon,
    className: "border-border/60 bg-card shadow-sm dark:bg-card",
  },
] as const;

export default function InputGroup03() {
  const id = useId();

  return (
    <div className="grid w-full max-w-md gap-5 sm:grid-cols-2">
      {surfaces.map((surface) => {
        const inputId = `${id}-${surface.key}`;
        const Icon = surface.icon;
        return (
          <div key={surface.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={inputId}>{surface.label}</Label>
              <span className="text-xs text-muted-foreground">
                {surface.style}
              </span>
            </div>
            <InputGroup className={surface.className}>
              <InputGroupAddon>
                <Icon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput id={inputId} placeholder={surface.placeholder} />
            </InputGroup>
          </div>
        );
      })}
    </div>
  );
}
