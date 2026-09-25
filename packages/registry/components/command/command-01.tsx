"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Country = { value: string; label: string; code: string };

const countries: Country[] = [
  { value: "au", label: "Australia", code: "+61" },
  { value: "br", label: "Brazil", code: "+55" },
  { value: "ca", label: "Canada", code: "+1" },
  { value: "de", label: "Germany", code: "+49" },
  { value: "in", label: "India", code: "+91" },
  { value: "jp", label: "Japan", code: "+81" },
  { value: "mx", label: "Mexico", code: "+52" },
  { value: "ng", label: "Nigeria", code: "+234" },
  { value: "tr", label: "Türkiye", code: "+90" },
  { value: "gb", label: "United Kingdom", code: "+44" },
  { value: "us", label: "United States", code: "+1" },
];

export default function Command01() {
  return (
    <Command
      items={countries}
      className="w-full max-w-xs border border-border shadow-xs"
    >
      <CommandInput
        placeholder="Search countries..."
        aria-label="Search country calling codes"
      />
      <CommandList className="max-h-60">
        {(country: Country) => (
          <CommandItem key={country.value} value={country}>
            <span className="truncate">{country.label}</span>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {country.code}
            </span>
          </CommandItem>
        )}
      </CommandList>
      <CommandEmpty>No country matches that name.</CommandEmpty>
    </Command>
  );
}
