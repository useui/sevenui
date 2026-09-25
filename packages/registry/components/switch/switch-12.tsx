"use client";

import * as React from "react";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Switch } from "@/registry/base/ui/switch";

type FieldId = "email" | "phone" | "location" | "company";

const fields: {
  id: FieldId;
  label: string;
  value: string;
  icon: typeof Mail;
}[] = [
  { id: "company", label: "Company", value: "Product designer at Northwind", icon: Briefcase },
  { id: "location", label: "Location", value: "Lisbon, Portugal", icon: MapPin },
  { id: "email", label: "Email", value: "ava.moreno@northwind.app", icon: Mail },
  { id: "phone", label: "Phone", value: "+351 912 408 331", icon: Phone },
];

export default function Switch12() {
  const [visible, setVisible] = React.useState<Record<FieldId, boolean>>({
    company: true,
    location: true,
    email: false,
    phone: false,
  });

  const shown = fields.filter((field) => visible[field.id]);

  return (
    <section
      aria-labelledby="switch-12-title"
      className="w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-0.5 p-4 pb-3">
        <h3 id="switch-12-title" className="font-medium">
          Public profile
        </h3>
        <p className="text-sm text-muted-foreground">Choose what people outside your team see.</p>
      </div>

      <figure className="mx-4 flex flex-col gap-3 rounded-lg bg-muted/60 p-3">
        <figcaption className="sr-only">Preview of your public profile</figcaption>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Ava Moreno</span>
            <span className="text-xs text-muted-foreground">@avamoreno</span>
          </div>
        </div>
        <ul aria-live="polite" className="flex min-h-5 flex-col gap-1.5">
          {shown.length === 0 ? (
            <li className="text-xs text-muted-foreground">Only your name and photo are public.</li>
          ) : (
            shown.map((field) => {
              const Icon = field.icon;
              return (
                <li key={field.id} className="flex min-w-0 items-center gap-2 text-xs">
                  <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{field.value}</span>
                </li>
              );
            })
          )}
        </ul>
      </figure>

      <ul aria-label="Profile fields" className="flex flex-col divide-y divide-border px-4 pt-2 pb-1">
        {fields.map((field) => {
          const id = `switch-12-${field.id}`;
          return (
            <li key={field.id} className="flex items-center justify-between gap-4 py-2.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">{field.label}</span>
                <span className="truncate text-xs text-muted-foreground">{field.value}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span aria-hidden="true" className="w-11 text-right text-xs text-muted-foreground">
                  {visible[field.id] ? "Public" : "Private"}
                </span>
                <Switch
                  id={id}
                  size="sm"
                  aria-label={`Show ${field.label.toLowerCase()} on public profile`}
                  checked={visible[field.id]}
                  onCheckedChange={(checked) =>
                    setVisible((current) => ({ ...current, [field.id]: checked }))
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
