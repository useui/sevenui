"use client";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  GitCommitHorizontalIcon,
  SignalHighIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type IssueStatus = "todo" | "in-progress" | "done";

type Issue = {
  key: string;
  title: string;
  status: IssueStatus;
  priority: string;
  labels: string[];
  assignee: { name: string; initials: string };
  updated: string;
};

const issues: Record<string, Issue> = {
  "ENG-482": {
    key: "ENG-482",
    title: "Webhook retries fire twice after a 502 from the receiver",
    status: "in-progress",
    priority: "High",
    labels: ["webhooks", "bug"],
    assignee: { name: "Priya Raman", initials: "PR" },
    updated: "Updated 2 hours ago",
  },
  "ENG-517": {
    key: "ENG-517",
    title: "Expose retry backoff settings in the dashboard",
    status: "todo",
    priority: "Medium",
    labels: ["webhooks", "settings"],
    assignee: { name: "Marcus Lee", initials: "ML" },
    updated: "Updated yesterday",
  },
  "ENG-455": {
    key: "ENG-455",
    title: "Add idempotency keys to outbound event payloads",
    status: "done",
    priority: "High",
    labels: ["api"],
    assignee: { name: "Priya Raman", initials: "PR" },
    updated: "Closed on Sep 19",
  },
};

const commits = [
  {
    sha: "a91f3c2",
    message: "Guard retry scheduler against duplicate 502 handling",
    issue: "ENG-482",
    author: "Priya Raman",
    time: "2h ago",
  },
  {
    sha: "7d0e1b8",
    message: "Read backoff multiplier from workspace settings",
    issue: "ENG-517",
    author: "Marcus Lee",
    time: "5h ago",
  },
  {
    sha: "3c55a90",
    message: "Attach Idempotency-Key header to every delivery",
    issue: "ENG-455",
    author: "Priya Raman",
    time: "Sep 19",
  },
];

const statusMeta: Record<
  IssueStatus,
  { label: string; icon: typeof CircleDotIcon; className: string }
> = {
  todo: {
    label: "Todo",
    icon: CircleDashedIcon,
    className: "text-muted-foreground",
  },
  "in-progress": {
    label: "In progress",
    icon: CircleDotIcon,
    className: "text-warning",
  },
  done: { label: "Done", icon: CircleCheckIcon, className: "text-success" },
};

function IssueLink({ issue }: { issue: Issue }) {
  const status = statusMeta[issue.status];
  const StatusIcon = status.icon;

  return (
    <HoverCard>
      <HoverCardTrigger
        href={`#issue-${issue.key}`}
        delay={300}
        className="rounded-sm font-mono text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {issue.key}
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="grid gap-2 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{issue.key}</span>
            <span aria-hidden="true">·</span>
            <span>{issue.updated}</span>
          </div>
          <p className="text-sm leading-snug font-medium text-balance">
            {issue.title}
          </p>
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 border-t px-3 py-2.5 text-xs">
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="flex items-center gap-1 font-medium">
              <StatusIcon
                aria-hidden="true"
                className={`size-3.5 ${status.className}`}
              />
              {status.label}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Priority</dt>
            <dd className="flex items-center gap-1 font-medium">
              <SignalHighIcon aria-hidden="true" className="size-3.5" />
              {issue.priority}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Assignee</dt>
            <dd className="flex min-w-0 items-center gap-1 font-medium">
              <Avatar size="sm" className="size-4">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback className="text-[0.5rem]">
                  {issue.assignee.initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {issue.assignee.name.split(" ")[0]}
              </span>
            </dd>
          </div>
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard08() {
  return (
    <section
      aria-labelledby="hover-card-08-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-2 border-b px-4 py-3">
        <h3 id="hover-card-08-title" className="text-sm font-medium">
          Commits on fix/webhook-retries
        </h3>
        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
          3 commits
        </span>
      </header>
      <ol className="divide-y">
        {commits.map((commit) => {
          const issue = issues[commit.issue];
          return (
            <li key={commit.sha} className="flex gap-3 px-4 py-3">
              <GitCommitHorizontalIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="grid min-w-0 flex-1 gap-1">
                <p className="text-sm leading-snug">{commit.message}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {issue && <IssueLink issue={issue} />}
                  <span aria-hidden="true">·</span>
                  <span>{commit.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{commit.time}</span>
                </div>
              </div>
              <code className="hidden shrink-0 self-start rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">
                {commit.sha}
              </code>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
