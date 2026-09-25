"use client";

import * as React from "react";
import { CircleDot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { InputGroupAddon } from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

const people = [
  { value: "maya", label: "Maya Chen", initials: "MC", load: 2 },
  { value: "daniel", label: "Daniel Okafor", initials: "DO", load: 5 },
  { value: "lucia", label: "Lucía Fernández", initials: "LF", load: 1 },
  { value: "noah", label: "Noah Bennett", initials: "NB", load: 7 },
  { value: "priya", label: "Priya Raman", initials: "PR", load: 3 },
  { value: "tom", label: "Tom Lindqvist", initials: "TL", load: 0 },
];

type Person = (typeof people)[number];

const me = people[0];

export default function Combobox10() {
  const [assignee, setAssignee] = React.useState<Person | null>(null);

  return (
    <article className="w-full max-w-md rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CircleDot aria-hidden="true" className="size-3.5 text-chart-2" />
        <span className="font-mono">WEB-482</span>
        <Badge variant="outline" className="ml-auto">
          High priority
        </Badge>
      </div>
      <h3 className="mt-3 text-base font-medium text-balance">
        Checkout button stays disabled after applying a promo code
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Reported by 14 customers since the 3.12 release. Reproduces on Safari
        and Firefox.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="combobox-10-assignee">Assignee</Label>
          {assignee?.value !== me.value && (
            <Button
              variant="link"
              size="xs"
              className="h-auto px-0"
              onClick={() => setAssignee(me)}
            >
              Assign to me
            </Button>
          )}
        </div>
        <Combobox items={people} value={assignee} onValueChange={setAssignee}>
          <ComboboxInput
            id="combobox-10-assignee"
            placeholder="Search teammates"
            showClear={assignee !== null}
            className="w-full"
          >
            {assignee ? (
              <InputGroupAddon align="inline-start" className="pl-2">
                <Avatar aria-hidden="true" className="size-5">
                  <AvatarFallback className="text-[0.625rem]">
                    {assignee.initials}
                  </AvatarFallback>
                </Avatar>
              </InputGroupAddon>
            ) : null}
          </ComboboxInput>
          <ComboboxContent>
            <ComboboxEmpty>No teammate with that name.</ComboboxEmpty>
            <ComboboxList>
              {(item: Person) => (
                <ComboboxItem key={item.value} value={item} className="py-1.5">
                  <Avatar aria-hidden="true" className="size-6">
                    <AvatarFallback className="text-[0.625rem]">
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">
                    {item.label}
                    {item.value === me.value && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.load} open
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <p
        aria-live="polite"
        className="mt-4 border-t pt-3 text-xs text-muted-foreground"
      >
        {assignee
          ? `${assignee.label} will be notified and the issue moves to In progress.`
          : "Unassigned issues stay in the triage queue."}
      </p>
    </article>
  );
}
