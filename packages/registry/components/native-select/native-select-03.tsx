"use client";

import { ChevronsUpDownIcon, LanguagesIcon } from "lucide-react";
import * as React from "react";
import { cn } from "cn";

import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
];

const statuses = [
  { value: "operational", label: "Operational", dot: "bg-success" },
  { value: "degraded", label: "Degraded performance", dot: "bg-warning" },
  { value: "outage", label: "Major outage", dot: "bg-destructive" },
  { value: "maintenance", label: "Under maintenance", dot: "bg-muted-foreground" },
];

export default function NativeSelect03() {
  const [status, setStatus] = React.useState("operational");
  const current = statuses.find((item) => item.value === status);

  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-03-language">Interface language</Label>
        <div className="relative">
          <LanguagesIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <NativeSelect
            id="native-select-03-language"
            defaultValue="en"
            className="w-full [&>select]:pl-8"
          >
            {languages.map((language) => (
              <NativeSelectOption key={language.value} value={language.value}>
                {language.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-03-status">API status</Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 z-10 size-2 -translate-y-1/2 rounded-full transition-colors duration-200",
              current?.dot,
            )}
          />
          <NativeSelect
            id="native-select-03-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full [&>select]:pl-8 [&>svg]:hidden"
          >
            {statuses.map((item) => (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <ChevronsUpDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
