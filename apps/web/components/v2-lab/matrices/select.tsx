"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { LabSection } from "../lab-frame";

const SIZES = ["default", "sm"] as const;

const FRUITS = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Dragon fruit, a very long option label", value: "dragon" },
];

function Items() {
  return (
    <>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        {FRUITS.map((fruit) => (
          <SelectItem key={fruit.value} value={fruit.value}>
            {fruit.label}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Other</SelectLabel>
        <SelectItem value="none" disabled>
          Disabled option
        </SelectItem>
      </SelectGroup>
    </>
  );
}

function Demo({
  size,
  defaultValue = null,
  disabled,
  invalid,
  className,
}: {
  size: (typeof SIZES)[number];
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <Select items={FRUITS} defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger size={size} aria-invalid={invalid || undefined} className={className ?? "w-40"}>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <Items />
      </SelectContent>
    </Select>
  );
}

export default function SelectMatrix() {
  return (
    <div>
      {SIZES.map((size) => (
        <LabSection key={size} title={`trigger size=${size}`}>
          <Demo size={size} />
          <Demo size={size} defaultValue="banana" />
          <Demo size={size} defaultValue="apple" disabled />
          <Demo size={size} defaultValue="cherry" invalid />
          <Demo size={size} defaultValue="dragon" className="w-36" />
        </LabSection>
      ))}
      <LabSection title="open (popup portals to body: document theme, comfortable density)">
        <Select items={FRUITS} defaultValue="banana" defaultOpen modal={false}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <Items />
          </SelectContent>
        </Select>
      </LabSection>
    </div>
  );
}
