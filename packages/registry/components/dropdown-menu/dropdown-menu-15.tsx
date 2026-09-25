"use client";

import * as React from "react";
import {
  AlarmClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Flag,
  Tag,
  UserRound,
  UserX,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const agents = [
  { id: "priya", name: "Priya Raman", initials: "PR", load: 4 },
  { id: "tomas", name: "Tomás Ortega", initials: "TO", load: 9 },
  { id: "grace", name: "Grace Liu", initials: "GL", load: 2 },
];

const priorities = [
  { value: "urgent", label: "Urgent", dot: "bg-destructive" },
  { value: "high", label: "High", dot: "bg-warning" },
  { value: "normal", label: "Normal", dot: "bg-chart-2" },
  { value: "low", label: "Low", dot: "bg-muted-foreground" },
] as const;

const allLabels = ["Billing", "Refund", "Bug", "Enterprise"];

const snoozeOptions = [
  { value: "3h", label: "3 hours", until: "until 4:30 PM" },
  { value: "tomorrow", label: "Tomorrow", until: "until Fri 9:00 AM" },
  { value: "monday", label: "Next week", until: "until Mon 9:00 AM" },
];

type Priority = (typeof priorities)[number]["value"];

export default function DropdownMenu15() {
  const [assignee, setAssignee] = React.useState<string>("unassigned");
  const [priority, setPriority] = React.useState<Priority>("high");
  const [labels, setLabels] = React.useState<string[]>(["Billing"]);
  const [state, setState] = React.useState<"open" | "snoozed" | "resolved">("open");
  const [snoozedUntil, setSnoozedUntil] = React.useState("");

  const agent = agents.find((a) => a.id === assignee);
  const currentPriority = priorities.find((p) => p.value === priority) ?? priorities[0];

  const toggleLabel = (label: string, checked: boolean) =>
    setLabels((prev) =>
      checked ? [...prev, label] : prev.filter((item) => item !== label),
    );

  return (
    <section
      aria-labelledby="dropdown-menu-15-title"
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-xs"
    >
      <header className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs text-muted-foreground tabular-nums">SUP-4821 · via email · <span className="whitespace-nowrap">12 min ago</span></p>
          <h3 id="dropdown-menu-15-title" className="text-sm font-medium leading-snug">
            Charged twice for the September invoice
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="shrink-0">
                Triage
                <ChevronDown aria-hidden="true" data-icon="inline-end" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserRound aria-hidden="true" />
                Assign
                <span className="ml-auto max-w-20 truncate text-xs text-muted-foreground">
                  {agent ? agent.name.split(" ")[0] : "Nobody"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Billing team</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={assignee}
                    onValueChange={(value) => setAssignee(value as string)}
                  >
                    {agents.map((a) => (
                      <DropdownMenuRadioItem key={a.id} value={a.id} label={a.name} closeOnClick>
                        <Avatar size="sm">
                          <AvatarFallback className="text-[0.625rem]">{a.initials}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate">{a.name}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {a.load} open
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioItem value="unassigned" closeOnClick>
                      <UserX aria-hidden="true" />
                      Unassigned
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Flag aria-hidden="true" />
                Priority
                <span className="ml-auto text-xs text-muted-foreground">
                  {currentPriority.label}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuRadioGroup
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  {priorities.map((p) => (
                    <DropdownMenuRadioItem key={p.value} value={p.value} closeOnClick>
                      <span aria-hidden="true" className={`size-2 rounded-full ${p.dot}`} />
                      {p.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tag aria-hidden="true" />
                Labels
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {labels.length}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {allLabels.map((label) => (
                  <DropdownMenuCheckboxItem
                    key={label}
                    checked={labels.includes(label)}
                    onCheckedChange={(checked) => toggleLabel(label, checked)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {state === "open" ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlarmClock aria-hidden="true" />
                  Snooze
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {snoozeOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        setState("snoozed");
                        setSnoozedUntil(option.until);
                      }}
                    >
                      {option.label}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {option.until.replace("until ", "")}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem onClick={() => setState("open")}>
                <CircleDot aria-hidden="true" />
                Reopen ticket
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={state === "resolved"}
              onClick={() => setState("resolved")}
            >
              <CheckCircle2 aria-hidden="true" />
              Mark as resolved
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-muted-foreground">
          Hi, my card was charged $249 twice on Sep 14 for invoice INV-20931. Can
          you refund the duplicate? Thanks, Elena
        </p>

        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-xs">
          <dt className="text-muted-foreground">Status</dt>
          <dd aria-live="polite">
            {state === "open" ? (
              <Badge variant="outline">Open</Badge>
            ) : state === "snoozed" ? (
              <Badge variant="secondary">Snoozed {snoozedUntil}</Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
                Resolved
              </Badge>
            )}
          </dd>

          <dt className="text-muted-foreground">Assignee</dt>
          <dd className="flex items-center gap-1.5">
            {agent ? (
              <>
                <Avatar size="sm" className="size-5">
                  <AvatarFallback className="text-[0.5625rem]">{agent.initials}</AvatarFallback>
                </Avatar>
                {agent.name}
              </>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </dd>

          <dt className="text-muted-foreground">Priority</dt>
          <dd className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2 rounded-full ${currentPriority.dot}`} />
            {currentPriority.label}
          </dd>

          <dt className="text-muted-foreground">Labels</dt>
          <dd className="flex flex-wrap gap-1">
            {labels.length > 0 ? (
              labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </dd>
        </dl>
      </div>
    </section>
  );
}
