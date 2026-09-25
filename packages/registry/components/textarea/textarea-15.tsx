"use client";

import { CalendarIcon, ListTodoIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";
import { Textarea } from "@/registry/base/ui/textarea";

const attendees = [
  { handle: "dana", name: "Dana Whitfield", initials: "DW" },
  { handle: "omar", name: "Omar Haddad", initials: "OH" },
  { handle: "lena", name: "Lena Brandt", initials: "LB" },
];

const initialNotes = `Q3 launch sync

Pricing page copy is approved, legal signed off Tuesday.
TODO @omar publish the pricing page behind the launch flag
Beta feedback: onboarding checklist feels long for solo users.
TODO @lena cut the checklist to four steps for solo workspaces
TODO @dana confirm the press embargo time with Northstar PR
Next sync moves to Thursday.`;

const TODO_PATTERN = /^\s*TODO\s+(?:@(\w+)\s+)?(.+)$/i;

function extractActions(notes: string) {
  return notes.split("\n").flatMap((line, index) => {
    const match = line.match(TODO_PATTERN);
    if (!match) return [];
    const owner = attendees.find(
      (person) => person.handle === match[1]?.toLowerCase(),
    );
    return [{ key: `${index}-${match[2].trim()}`, owner, task: match[2].trim() }];
  });
}

export default function Textarea15() {
  const id = useId();
  const [notes, setNotes] = useState(initialNotes);
  const [done, setDone] = useState<Set<string>>(new Set());

  const actions = useMemo(() => extractActions(notes), [notes]);
  const doneCount = actions.filter((action) => done.has(action.key)).length;

  const toggle = (key: string, checked: boolean) => {
    setDone((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return (
    <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <CalendarIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="font-medium">Launch sync</span>
          <span className="text-muted-foreground">Wed, Jul 9 · 10:00</span>
        </div>
        <AvatarGroup aria-label="Attendees" className="-space-x-1">
          {attendees.map((person) => (
            <Avatar key={person.handle} title={person.name}>
              <AvatarFallback className="text-xs">{person.initials}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      <div className="grid md:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-2 p-4">
          <Label htmlFor={`${id}-notes`}>Meeting notes</Label>
          <Textarea
            id={`${id}-notes`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            aria-describedby={`${id}-syntax`}
            className="min-h-64 resize-y text-sm leading-relaxed md:text-sm"
          />
          <p id={`${id}-syntax`} className="text-xs text-muted-foreground">
            Start a line with{" "}
            <code className="rounded bg-muted px-1 font-mono">TODO @name</code>{" "}
            to turn it into an action item. Attendees: @dana, @omar, @lena.
          </p>
        </div>

        <Separator className="md:hidden" />

        <section
          aria-labelledby={`${id}-actions`}
          className="flex flex-col gap-3 bg-muted/40 p-4 md:border-l md:border-border"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              id={`${id}-actions`}
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <ListTodoIcon aria-hidden="true" className="size-4" />
              Action items
            </h3>
            <Badge variant="secondary" className="tabular-nums">
              {doneCount}/{actions.length}
            </Badge>
          </div>

          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No action items yet. Add a TODO line to your notes.
            </p>
          ) : (
            <ul aria-live="polite" className="flex flex-col gap-3">
              {actions.map((action) => {
                const checkboxId = `${id}-${action.key}`;
                const checked = done.has(action.key);
                return (
                  <li key={action.key} className="flex items-start gap-2.5">
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={(value) => toggle(action.key, value)}
                      className="mt-0.5"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Label
                        htmlFor={checkboxId}
                        className={
                          checked
                            ? "leading-snug font-normal text-muted-foreground line-through"
                            : "leading-snug font-normal"
                        }
                      >
                        {action.task}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {action.owner ? action.owner.name : "Unassigned"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
