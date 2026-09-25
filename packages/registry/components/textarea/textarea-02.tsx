"use client";

import { useId, useState } from "react";

import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const surfaces = {
  outline: {
    label: "Outline",
    hint: "Default border. Use on plain page backgrounds.",
    className: "",
  },
  filled: {
    label: "Filled",
    hint: "Tinted fill, no border. Reads well inside dense forms.",
    className:
      "border-transparent bg-muted focus-visible:bg-background dark:bg-muted dark:focus-visible:bg-input/30",
  },
  ghost: {
    label: "Ghost",
    hint: "Invisible until hovered or focused. Good for inline editing.",
    className:
      "border-transparent px-2 hover:bg-muted/60 focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-input/30",
  },
} as const;

type Surface = keyof typeof surfaces;

export default function Textarea02() {
  const id = useId();
  const [surface, setSurface] = useState<Surface>("filled");
  const current = surfaces[surface];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Textarea surface style"
        value={[surface]}
        onValueChange={(value) => {
          const next = value[0] as Surface | undefined;
          if (next) setSurface(next);
        }}
      >
        {(Object.keys(surfaces) as Surface[]).map((key) => (
          <ToggleGroupItem key={key} value={key} className="px-3">
            {surfaces[key].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-notes`}>Account notes</Label>
        <Textarea
          id={`${id}-notes`}
          aria-describedby={`${id}-hint`}
          defaultValue={
            "Acme Corp, 42 seats on Team\n- Wants SSO before the October renewal\n- Finance contact is Priya Shah, invoices by PO only"
          }
          className={current.className}
        />
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {current.hint}
        </p>
      </div>
    </div>
  );
}
