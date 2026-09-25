"use client";

import * as React from "react";
import { MessageSquare, Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

type Task = {
  id: string;
  title: string;
  label: string;
  assignee: string;
  comments: number;
};

const initialColumns: { id: string; name: string; tasks: Task[] }[] = [
  {
    id: "backlog",
    name: "Backlog",
    tasks: [
      {
        id: "WEB-212",
        title: "Add annual billing toggle to pricing page",
        label: "Growth",
        assignee: "MC",
        comments: 2,
      },
      {
        id: "WEB-219",
        title: "Audit empty states across the dashboard",
        label: "Design",
        assignee: "PR",
        comments: 0,
      },
      {
        id: "WEB-224",
        title: "Support SCIM provisioning for Okta",
        label: "Enterprise",
        assignee: "DO",
        comments: 5,
      },
      {
        id: "WEB-231",
        title: "Lazy-load chart bundles on the reports view",
        label: "Performance",
        assignee: "LM",
        comments: 1,
      },
      {
        id: "WEB-236",
        title: "Rewrite password reset emails",
        label: "Copy",
        assignee: "SA",
        comments: 3,
      },
    ],
  },
  {
    id: "in-progress",
    name: "In progress",
    tasks: [
      {
        id: "WEB-198",
        title: "Migrate invoices to usage-based line items",
        label: "Billing",
        assignee: "NF",
        comments: 8,
      },
      {
        id: "WEB-205",
        title: "Keyboard navigation for the command menu",
        label: "Accessibility",
        assignee: "HS",
        comments: 4,
      },
      {
        id: "WEB-208",
        title: "Show seat usage on the team settings page",
        label: "Growth",
        assignee: "MC",
        comments: 1,
      },
    ],
  },
  {
    id: "in-review",
    name: "In review",
    tasks: [
      {
        id: "WEB-187",
        title: "Fix invoice PDF margins in Safari",
        label: "Bug",
        assignee: "LM",
        comments: 6,
      },
      {
        id: "WEB-190",
        title: "Dark mode contrast pass on charts",
        label: "Design",
        assignee: "PR",
        comments: 2,
      },
    ],
  },
  {
    id: "done",
    name: "Done",
    tasks: [
      {
        id: "WEB-171",
        title: "Rate-limit the public status API",
        label: "Platform",
        assignee: "DO",
        comments: 3,
      },
      {
        id: "WEB-176",
        title: "Onboarding checklist v2",
        label: "Growth",
        assignee: "SA",
        comments: 11,
      },
      {
        id: "WEB-180",
        title: "Remove legacy v2 reporting endpoints",
        label: "Platform",
        assignee: "NF",
        comments: 0,
      },
      {
        id: "WEB-183",
        title: "Add SAML single sign-on",
        label: "Enterprise",
        assignee: "HS",
        comments: 7,
      },
    ],
  },
];

export default function ScrollArea03() {
  const [columns, setColumns] = React.useState(initialColumns);
  const nextId = React.useRef(240);

  // New tasks land at the top of their column, which scrolls up to show them.
  function addTask(columnId: string, list: HTMLElement | null) {
    const id = `WEB-${nextId.current++}`;
    setColumns((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: [
                {
                  id,
                  title: "Untitled task",
                  label: "New",
                  assignee: "ME",
                  comments: 0,
                },
                ...column.tasks,
              ],
            }
          : column,
      ),
    );
    list
      ?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')
      ?.scrollTo({ top: 0 });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="scroll-area-03-title" className="text-sm font-medium">
          Sprint 42 · Web app
        </h3>
        <span className="text-xs text-muted-foreground">Ends Oct 9</span>
      </div>
      {/* The board scrolls sideways; each column scrolls on its own. */}
      <ScrollArea
        orientation="horizontal"
        role="region"
        aria-labelledby="scroll-area-03-title"
        className="w-full rounded-xl border bg-muted/40"
      >
        <div className="flex w-max gap-3 p-3 pb-4">
          {columns.map((column) => (
            <section
              key={column.id}
              aria-labelledby={`scroll-area-03-${column.id}`}
              className="flex w-60 shrink-0 flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <h4
                  id={`scroll-area-03-${column.id}`}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {column.name}
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {column.tasks.length}
                  </span>
                </h4>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Add task to ${column.name}`}
                  onClick={(event) =>
                    addTask(
                      column.id,
                      event.currentTarget
                        .closest("section")
                        ?.querySelector("ul") ?? null,
                    )
                  }
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
              <ScrollArea
                aria-label={`${column.name} tasks`}
                className="h-72"
              >
                <ul className="flex flex-col gap-2 pr-3">
                  {column.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-xs"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {task.id}
                        </span>
                        <p className="text-sm leading-snug font-medium text-pretty">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary">{task.label}</Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.comments > 0 && (
                            <span className="flex items-center gap-1 tabular-nums">
                              <MessageSquare
                                aria-hidden="true"
                                className="size-3.5"
                              />
                              {task.comments}
                              <span className="sr-only"> comments</span>
                            </span>
                          )}
                          <Avatar size="sm">
                            <AvatarFallback>{task.assignee}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
