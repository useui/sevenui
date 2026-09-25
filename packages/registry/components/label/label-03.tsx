"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const fields = [
  {
    id: "label-03-name",
    label: "Display name",
    placeholder: "Maya Chen",
    autoComplete: "name",
  },
  {
    id: "label-03-title",
    label: "Job title",
    placeholder: "Staff product designer",
    autoComplete: "organization-title",
  },
  {
    id: "label-03-location",
    label: "Location",
    placeholder: "Lisbon, Portugal",
    autoComplete: "address-level2",
  },
];

export default function Label03() {
  return (
    <form
      className="grid w-full max-w-lg gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-4"
        >
          <Label htmlFor={field.id} className="sm:justify-end sm:text-right">
            {field.label}
          </Label>
          <Input
            id={field.id}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
          />
        </div>
      ))}
      <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-start sm:gap-4">
        <Label
          htmlFor="label-03-bio"
          className="sm:justify-end sm:pt-2 sm:text-right"
        >
          Bio
        </Label>
        <Textarea
          id="label-03-bio"
          rows={3}
          placeholder="Designing billing flows at Northwind."
        />
      </div>
    </form>
  );
}
