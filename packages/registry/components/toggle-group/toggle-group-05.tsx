"use client";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const people = [
  { value: "maya", name: "Maya Patel", initials: "MP", tasks: 9 },
  { value: "theo", name: "Theo Laurent", initials: "TL", tasks: 5 },
  { value: "ines", name: "Ines Moreau", initials: "IM", tasks: 7 },
  { value: "kofi", name: "Kofi Mensah", initials: "KM", tasks: 3 },
  { value: "sara", name: "Sara Lindqvist", initials: "SL", tasks: 6 },
];

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default function ToggleGroup05() {
  const [selected, setSelected] = React.useState<string[]>(["maya", "theo"]);
  const chosen = people.filter((person) => selected.includes(person.value));
  const total = chosen.reduce((sum, person) => sum + person.tasks, 0);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span id="assignee-filter" className="text-sm font-medium">
          Assignees
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() =>
            setSelected(
              selected.length === people.length
                ? []
                : people.map((person) => person.value),
            )
          }
        >
          {selected.length === people.length ? "Clear all" : "Select all"}
        </Button>
      </div>
      <ToggleGroup
        aria-labelledby="assignee-filter"
        multiple
        spacing={1.5}
        value={selected}
        onValueChange={setSelected}
        className="flex-wrap"
      >
        {people.map((person) => (
          <ToggleGroupItem
            key={person.value}
            value={person.value}
            aria-label={person.name}
            title={person.name}
            className="relative size-auto min-w-0 rounded-full p-0.5 hover:bg-transparent aria-pressed:bg-transparent"
          >
            <Avatar
              size="lg"
              className="opacity-50 grayscale transition-[opacity,filter] duration-150 group-hover/toggle:opacity-80 group-aria-pressed/toggle:opacity-100 group-aria-pressed/toggle:grayscale-0 motion-reduce:transition-none"
            >
              <AvatarFallback className="bg-secondary font-medium text-secondary-foreground">
                {person.initials}
              </AvatarFallback>
            </Avatar>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-transparent transition-[box-shadow] duration-150 group-aria-pressed/toggle:ring-primary motion-reduce:transition-none"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {chosen.length === 0
          ? "No assignees selected. Showing unassigned tasks only."
          : `${total} tasks assigned to ${joinNames(
              chosen.map((person) => person.name.split(" ")[0]),
            )}.`}
      </p>
    </div>
  );
}
