"use client";

import { Building2, Globe, Link2, Lock } from "lucide-react";
import * as React from "react";

import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const visibilities = [
  {
    value: "private",
    label: "Only invited people",
    icon: Lock,
    hint: "Nobody else can open this dashboard, even with the link.",
  },
  {
    value: "workspace",
    label: "Anyone at Northwind",
    icon: Building2,
    hint: "Everyone signed in to the Northwind workspace can view it.",
  },
  {
    value: "link",
    label: "Anyone with the link",
    icon: Link2,
    hint: "People outside your workspace can view it without signing in.",
  },
  {
    value: "public",
    label: "Public on the web",
    icon: Globe,
    hint: "Search engines can index this dashboard and its data.",
  },
];

export default function Select05() {
  const [value, setValue] = React.useState<string | null>("workspace");
  const selected = visibilities.find((option) => option.value === value);

  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-05-visibility">General access</Label>
      <Select items={visibilities} value={value} onValueChange={setValue}>
        <SelectTrigger
          id="select-05-visibility"
          className="w-full"
          aria-describedby="select-05-hint"
        >
          <SelectValue>
            {(current: string | null) => {
              const option = visibilities.find((item) => item.value === current);
              if (!option) return null;
              const Icon = option.icon;
              return (
                <>
                  <Icon className="text-muted-foreground" aria-hidden="true" />
                  {option.label}
                </>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {visibilities.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <option.icon className="text-muted-foreground" aria-hidden="true" />
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p id="select-05-hint" className="text-xs text-muted-foreground">
        {selected?.hint}
      </p>
    </div>
  );
}
