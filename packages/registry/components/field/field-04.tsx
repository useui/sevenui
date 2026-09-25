"use client";

import { useId, useState } from "react";
import { CpuIcon, type LucideIcon, ServerIcon, ZapIcon } from "lucide-react";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const machines: {
  value: string;
  title: string;
  description: string;
  price: string;
  icon: LucideIcon;
}[] = [
  {
    value: "shared",
    title: "Shared CPU",
    description: "1 vCPU, 1 GB RAM. Previews and side projects.",
    price: "$5/mo",
    icon: CpuIcon,
  },
  {
    value: "dedicated",
    title: "Dedicated CPU",
    description: "4 vCPU, 8 GB RAM. Steady production traffic.",
    price: "$48/mo",
    icon: ServerIcon,
  },
  {
    value: "performance",
    title: "Performance",
    description: "16 vCPU, 32 GB RAM. Builds, queues, and search.",
    price: "$190/mo",
    icon: ZapIcon,
  },
];

export default function Field04() {
  const id = useId();
  const [machine, setMachine] = useState("dedicated");

  return (
    <Field name="machineSize" className="w-full max-w-md">
      <FieldLabel>Machine size</FieldLabel>
      <FieldDescription>
        Resize at any time. Billing is prorated by the minute.
      </FieldDescription>
      <RadioGroup
        value={machine}
        onValueChange={(value) => setMachine(value as string)}
        className="mt-1 gap-2.5"
      >
        {machines.map((option) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: RadioGroupItem renders the radio control inside this label.
          <label
            key={option.value}
            className="group/choice flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors group-has-data-checked/choice:border-transparent group-has-data-checked/choice:bg-primary group-has-data-checked/choice:text-primary-foreground">
              <option.icon aria-hidden="true" className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                id={`${id}-${option.value}-title`}
                className="text-sm font-medium text-foreground"
              >
                {option.title}
              </span>
              <span
                id={`${id}-${option.value}-description`}
                className="text-xs text-muted-foreground"
              >
                {option.description}
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {option.price}
            </span>
            <RadioGroupItem
              value={option.value}
              aria-labelledby={`${id}-${option.value}-title`}
              aria-describedby={`${id}-${option.value}-description`}
            />
          </label>
        ))}
      </RadioGroup>
    </Field>
  );
}
