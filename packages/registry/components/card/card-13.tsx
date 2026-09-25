"use client";

import {
  CalendarClock,
  ListChecks,
  MessageSquare,
  Plus,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

type Priority = "high" | "medium" | "low";

const priorities: Record<
  Priority,
  { label: string; icon: typeof SignalHigh }
> = {
  high: { label: "High", icon: SignalHigh },
  medium: { label: "Medium", icon: SignalMedium },
  low: { label: "Low", icon: SignalLow },
};

const issues: {
  id: string;
  title: string;
  labels: string[];
  priority: Priority;
  subtasks: [number, number];
  comments: number;
  due: string;
  overdue: boolean;
  assignees: { name: string; initials: string }[];
}[] = [
  {
    id: "ENG-482",
    title: "Retry failed webhook deliveries with exponential backoff",
    labels: ["Backend", "Webhooks"],
    priority: "high",
    subtasks: [3, 5],
    comments: 7,
    due: "Oct 2",
    overdue: true,
    assignees: [
      { name: "Maya Okafor", initials: "MO" },
      { name: "Daniel Kim", initials: "DK" },
    ],
  },
  {
    id: "ENG-469",
    title: "Show sync status in the workspace sidebar",
    labels: ["Frontend"],
    priority: "medium",
    subtasks: [1, 4],
    comments: 2,
    due: "Oct 9",
    overdue: false,
    assignees: [{ name: "Sofia Reyes", initials: "SR" }],
  },
];

export default function Card13() {
  return (
    <section
      aria-labelledby="card-13-column"
      className="flex w-full max-w-xs flex-col gap-2 rounded-xl bg-muted/50 p-2"
    >
      <div className="flex items-center justify-between gap-2 pl-1.5">
        <h3 id="card-13-column" className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
          In progress
          <span className="font-normal text-muted-foreground tabular-nums">
            {issues.length}
          </span>
        </h3>
        <Button variant="ghost" size="icon-sm" aria-label="Add issue to In progress">
          <Plus aria-hidden="true" />
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {issues.map((issue) => {
          const priority = priorities[issue.priority];
          const [done, total] = issue.subtasks;

          return (
            <li key={issue.id}>
              <Card size="sm" className="gap-2.5 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-pretty">
                    {issue.title}
                  </CardTitle>
                  <CardAction>
                    <span
                      title={`${priority.label} priority`}
                      className="flex size-6 items-center justify-center rounded-md text-muted-foreground"
                    >
                      <priority.icon aria-hidden="true" className="size-4" />
                      <span className="sr-only">{priority.label} priority</span>
                    </span>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-0.5 font-mono text-xs text-muted-foreground">
                      {issue.id}
                    </span>
                    {issue.labels.map((label) => (
                      <Badge key={label} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 tabular-nums">
                        <ListChecks aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">Subtasks</span>
                        {done}/{total}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <MessageSquare aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">Comments</span>
                        {issue.comments}
                      </span>
                      <span
                        className={
                          issue.overdue
                            ? "flex items-center gap-1 font-medium text-destructive"
                            : "flex items-center gap-1"
                        }
                      >
                        <CalendarClock aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">
                          {issue.overdue ? "Overdue, was due" : "Due"}
                        </span>
                        {issue.due}
                      </span>
                    </div>
                    <AvatarGroup
                      className="shrink-0 -space-x-1"
                      role="group"
                      aria-label={`Assigned to ${issue.assignees.map((person) => person.name).join(" and ")}`}
                    >
                      {issue.assignees.map((person) => (
                        <Avatar key={person.initials} size="sm" aria-hidden="true">
                          <AvatarFallback className="group-data-[size=sm]/avatar:text-[0.625rem]">{person.initials}</AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
