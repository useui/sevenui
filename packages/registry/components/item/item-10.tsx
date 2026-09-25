"use client";

import * as React from "react";
import { ArrowDownIcon, ArrowUpIcon, PinOffIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const INITIAL_PROJECTS = [
  {
    id: "checkout",
    name: "Checkout redesign",
    detail: "12 open tasks · Due Oct 3",
    tone: "bg-chart-1",
  },
  {
    id: "mobile",
    name: "Mobile app 3.0",
    detail: "31 open tasks · Due Nov 14",
    tone: "bg-chart-2",
  },
  {
    id: "billing",
    name: "Billing API migration",
    detail: "7 open tasks · Due Oct 20",
    tone: "bg-chart-3",
  },
  {
    id: "docs",
    name: "Help center refresh",
    detail: "4 open tasks · No due date",
    tone: "bg-chart-4",
  },
];

type Project = (typeof INITIAL_PROJECTS)[number];

export default function Item10() {
  const headingId = React.useId();
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [announcement, setAnnouncement] = React.useState("");

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    const project = projects[index];
    const next = [...projects];
    next.splice(index, 1);
    next.splice(target, 0, project);
    setProjects(next);
    setAnnouncement(
      `${project.name} moved to position ${target + 1} of ${next.length}.`,
    );
  }

  function unpin(project: Project) {
    setProjects((prev) => prev.filter((entry) => entry.id !== project.id));
    setAnnouncement(`${project.name} unpinned from the sidebar.`);
  }

  return (
    <section aria-labelledby={headingId} className="w-full max-w-md">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <h3 id={headingId} className="text-sm font-semibold">
            Pinned projects
          </h3>
          <p className="text-sm text-muted-foreground">
            The order here is the order in your sidebar.
          </p>
        </div>
        {projects.length < INITIAL_PROJECTS.length ? (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              setProjects(INITIAL_PROJECTS);
              setAnnouncement("Pinned projects reset.");
            }}
          >
            Reset
          </Button>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing pinned. Pin a project from its menu to keep it one click away.
        </p>
      ) : (
        <ItemGroup
          aria-labelledby={headingId}
          className="gap-0 overflow-hidden rounded-xl border bg-card text-card-foreground"
        >
          {projects.map((project, index) => (
            <Item
              key={project.id}
              role="listitem"
              size="sm"
              className="rounded-none border-b-border pr-2 last:border-b-transparent hover:bg-muted/40"
            >
              <ItemMedia className="size-6 rounded-md bg-muted text-xs font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0.5">
                <ItemTitle className="w-full max-sm:items-start">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full max-sm:mt-1.5 ${project.tone}`}
                  />
                  <span className="min-w-0 sm:truncate">{project.name}</span>
                </ItemTitle>
                <ItemDescription className="pl-4 text-xs sm:truncate">
                  {project.detail}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="gap-0 sm:gap-0.5">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="max-sm:size-7"
                  aria-label={`Move ${project.name} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="max-sm:size-7"
                  aria-label={`Move ${project.name} down`}
                  disabled={index === projects.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownIcon aria-hidden="true" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Unpin ${project.name}`}
                  className="text-muted-foreground hover:text-destructive max-sm:size-7"
                  onClick={() => unpin(project)}
                >
                  <PinOffIcon aria-hidden="true" />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
