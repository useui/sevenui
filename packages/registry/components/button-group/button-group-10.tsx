"use client";

import {
  ChevronDownIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  RocketIcon,
  ScrollTextIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

type Deployment = {
  id: string;
  branch: string;
  commit: string;
  message: string;
  age: string;
  production: boolean;
};

const initialDeployments: Deployment[] = [
  {
    id: "dpl_7fk2",
    branch: "main",
    commit: "a41c9e2",
    message: "fix(billing): round prorated credits",
    age: "12m ago",
    production: true,
  },
  {
    id: "dpl_6hq8",
    branch: "feat/usage-alerts",
    commit: "3be07d1",
    message: "feat(alerts): email when usage hits 80%",
    age: "1h ago",
    production: false,
  },
  {
    id: "dpl_5mz1",
    branch: "main",
    commit: "9d02f6a",
    message: "chore(deps): bump next to 16.1",
    age: "Yesterday",
    production: false,
  },
];

const newCommits = ["c58e1f0", "e2a94b7", "71d3c0e", "b09f5a2", "4ce8d31"];

export default function ButtonGroup10() {
  const [deployments, setDeployments] = useState(initialDeployments);
  const counter = useRef(0);

  const deploy = (
    source: Pick<Deployment, "branch" | "commit" | "message">,
    production: boolean,
  ) => {
    counter.current += 1;
    const next: Deployment = {
      ...source,
      id: `dpl_new${counter.current}`,
      age: "Just now",
      production,
    };
    setDeployments((list) =>
      [
        next,
        ...list.map((deployment) =>
          production ? { ...deployment, production: false } : deployment,
        ),
      ].slice(0, 5),
    );
  };

  const deployMain = (message: string, production = true) =>
    deploy(
      {
        branch: "main",
        commit: newCommits[counter.current % newCommits.length],
        message,
      },
      production,
    );

  const remove = (id: string) =>
    setDeployments((list) => list.filter((deployment) => deployment.id !== id));

  const promote = (id: string) =>
    setDeployments((list) =>
      list.map((deployment) => ({
        ...deployment,
        production: deployment.id === id,
      })),
    );

  return (
    <div className="flex w-full max-w-lg flex-col rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">Deployments</span>
          <span className="truncate text-xs text-muted-foreground">
            acme-dashboard · Production
          </span>
        </div>
        <ButtonGroup aria-label="Deploy">
          <Button size="sm" onClick={() => deployMain("Deploy main to production")}>
            <RocketIcon data-icon="inline-start" aria-hidden="true" />
            Deploy
          </Button>
          <ButtonGroupSeparator className="bg-primary-foreground/20" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="icon-sm" aria-label="More deploy options">
                  <ChevronDownIcon aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => deployMain("Deploy main without build cache")}
              >
                Deploy without build cache
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deployMain("Preview deploy of main", false)}
              >
                Deploy to preview only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
      <ul className="flex flex-col divide-y">
        {deployments.map((deployment) => (
          <li
            key={deployment.id}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 basis-full flex-col gap-1 sm:basis-0">
              <div className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">
                  {deployment.message}
                </span>
                {deployment.production ? (
                  <Badge variant="secondary" className="shrink-0">
                    Current
                  </Badge>
                ) : null}
              </div>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <GitBranchIcon className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{deployment.branch}</span>
                <span aria-hidden="true">·</span>
                <code className="font-mono">{deployment.commit}</code>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{deployment.age}</span>
              </span>
            </div>
            <ButtonGroup aria-label={`Actions for ${deployment.commit}`}>
              <Button variant="outline" size="icon-sm" aria-label="Visit deployment">
                <ExternalLinkIcon aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="View build logs">
                <ScrollTextIcon aria-hidden="true" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="More actions"
                    >
                      <ChevronDownIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={deployment.production}
                    onClick={() => promote(deployment.id)}
                  >
                    {deployment.production
                      ? "Serving production"
                      : "Promote to production"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deploy(deployment, deployment.production)}
                  >
                    Redeploy
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={deployment.production}
                    onClick={() => remove(deployment.id)}
                  >
                    Delete deployment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          </li>
        ))}
      </ul>
    </div>
  );
}
