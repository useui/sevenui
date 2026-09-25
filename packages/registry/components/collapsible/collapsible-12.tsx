"use client";

import * as React from "react";

import {
  ChevronDownIcon,
  GitPullRequestIcon,
  RocketIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

type Notice = { id: string; title: string; meta: string; time: string };

type Group = {
  id: string;
  source: string;
  icon: typeof RocketIcon;
  notices: Notice[];
};

const initialGroups: Group[] = [
  {
    id: "deployments",
    source: "Deployments",
    icon: RocketIcon,
    notices: [
      {
        id: "d1",
        title: "storefront deployed to production",
        meta: "main · 4f2c9a1 · 48s build",
        time: "2m",
      },
      {
        id: "d2",
        title: "Preview ready for checkout-redesign",
        meta: "feat/checkout · 91be0d3",
        time: "18m",
      },
      {
        id: "d3",
        title: "admin-panel build failed",
        meta: "Type error in orders/table.tsx",
        time: "1h",
      },
      {
        id: "d4",
        title: "docs deployed to production",
        meta: "main · 0c7d2e8 · 31s build",
        time: "3h",
      },
    ],
  },
  {
    id: "reviews",
    source: "Pull requests",
    icon: GitPullRequestIcon,
    notices: [
      {
        id: "r1",
        title: "Ava requested your review on PR 1284",
        meta: "Add saved carts to account page",
        time: "25m",
      },
      {
        id: "r2",
        title: "Your PR 1279 was approved",
        meta: "Fix currency rounding in refunds",
        time: "2h",
      },
    ],
  },
  {
    id: "team",
    source: "Team",
    icon: UserPlusIcon,
    notices: [
      {
        id: "t1",
        title: "Noah Kim joined the Payments team",
        meta: "Invited by Maya Thompson",
        time: "5h",
      },
    ],
  },
];

function NotificationGroup({
  group,
  onClear,
}: {
  group: Group;
  onClear: () => void;
}) {
  const [latest, ...older] = group.notices;
  const Icon = group.icon;

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon aria-hidden="true" className="size-3.5" />
          {group.source}
        </h4>
        <Button
          variant="ghost"
          size="xs"
          onClick={onClear}
          aria-label={`Clear ${group.source} notifications`}
        >
          Clear
        </Button>
      </div>
      <Collapsible className="group/stack relative">
        <div className="relative z-10 flex items-start gap-3 rounded-lg border bg-card p-3 shadow-xs">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">{latest.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {latest.meta}
            </span>
          </div>
          <time className="text-xs text-muted-foreground tabular-nums">
            {latest.time}
          </time>
        </div>
        {older.length > 0 && (
          <>
            <div
              aria-hidden="true"
              className="mx-2 -mt-1.5 h-3 rounded-b-lg border border-t-0 bg-card group-data-open/stack:hidden"
            />
            <CollapsibleContent>
              <ul className="flex flex-col gap-1.5 pt-1.5">
                {older.map((notice) => (
                  <li
                    key={notice.id}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm">{notice.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {notice.meta}
                      </span>
                    </div>
                    <time className="text-xs text-muted-foreground tabular-nums">
                      {notice.time}
                    </time>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
            <CollapsibleTrigger className="group mt-1.5 flex w-full items-center justify-center gap-1 rounded-md py-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
              <span className="group-data-panel-open:hidden">
                {older.length} more from {group.source}
              </span>
              <span className="hidden group-data-panel-open:inline">
                Show less
              </span>
              <ChevronDownIcon
                aria-hidden="true"
                className="size-3.5 transition-transform group-data-panel-open:rotate-180"
              />
            </CollapsibleTrigger>
          </>
        )}
      </Collapsible>
    </li>
  );
}

export default function Collapsible12() {
  const [groups, setGroups] = React.useState(initialGroups);
  const count = groups.reduce((sum, group) => sum + group.notices.length, 0);

  return (
    <section
      aria-labelledby="collapsible-12-title"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-muted/40 p-4"
    >
      <header className="flex items-center justify-between gap-2">
        <h3 id="collapsible-12-title" className="font-semibold">
          Notifications
          <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
            {count}
          </span>
        </h3>
        <Button
          variant="link"
          size="sm"
          className="px-0"
          disabled={groups.length === 0}
          onClick={() => setGroups([])}
        >
          Clear all
        </Button>
      </header>
      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You are all caught up.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <NotificationGroup
              key={group.id}
              group={group}
              onClear={() =>
                setGroups((current) =>
                  current.filter((item) => item.id !== group.id),
                )
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}
