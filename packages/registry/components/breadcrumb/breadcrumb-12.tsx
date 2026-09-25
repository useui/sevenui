"use client";

import { ChevronsUpDown, GitBranch, GitCommitHorizontal } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const teams = ["Northwind Labs", "Personal"];
const projects: Record<string, string[]> = {
  "Northwind Labs": ["storefront", "admin-console", "docs-site"],
  Personal: ["portfolio", "habit-tracker"],
};
const environments = [
  { name: "Production", branch: "main", commit: "a41c9e2", age: "12 min ago" },
  {
    name: "Preview",
    branch: "feat/cart-drawer",
    commit: "7d02bb1",
    age: "3 min ago",
  },
  { name: "Development", branch: "dev", commit: "e9f3310", age: "1 h ago" },
];

const segmentTrigger =
  "inline-flex max-w-40 items-center gap-1 rounded-md px-1.5 py-1 text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-muted";

function Segment({
  label,
  heading,
  value,
  options,
  onChange,
}: {
  label: string;
  heading: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${value}. Switch ${label.toLowerCase()}`}
        className={segmentTrigger}
      >
        <span className="truncate font-medium">{value}</span>
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{heading}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(next as string)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
                closeOnClick
              >
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Breadcrumb12() {
  const [team, setTeam] = React.useState(teams[0]);
  const [project, setProject] = React.useState(projects[teams[0]][0]);
  const [envName, setEnvName] = React.useState(environments[0].name);
  const env = environments.find((e) => e.name === envName) ?? environments[0];

  return (
    <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground">
      <div className="border-b px-3 py-2">
        <Breadcrumb aria-label="Deployment context">
          <BreadcrumbList className="gap-0.5 sm:gap-1">
            <BreadcrumbItem>
              <Segment
                label="Team"
                heading="Teams"
                value={team}
                options={teams}
                onChange={(next) => {
                  setTeam(next);
                  setProject(projects[next][0]);
                }}
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50">
              <span className="text-lg leading-none" aria-hidden="true">
                /
              </span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <Segment
                label="Project"
                heading={`Projects in ${team}`}
                value={project}
                options={projects[team]}
                onChange={setProject}
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50">
              <span className="text-lg leading-none" aria-hidden="true">
                /
              </span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <Segment
                label="Environment"
                heading="Environments"
                value={envName}
                options={environments.map((e) => e.name)}
                onChange={setEnvName}
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50">
              <span className="text-lg leading-none" aria-hidden="true">
                /
              </span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="px-1.5">Deployments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {project}-{env.commit}.northwind.app
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <GitBranch className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{env.branch}</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <GitCommitHorizontal className="size-3.5" aria-hidden="true" />
              {env.commit}
            </span>
            <span>{env.age}</span>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span
            className="size-1.5 rounded-full bg-success"
            aria-hidden="true"
          />
          Ready
        </Badge>
      </div>
    </div>
  );
}
