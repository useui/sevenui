"use client";

import { BookMarked, GitFork, Scale, Star } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

const topics = [
  "react",
  "design-system",
  "accessibility",
  "tailwindcss",
  "base-ui",
];

const stats = [
  { label: "stars", value: "2.4k", icon: Star },
  { label: "forks", value: "186", icon: GitFork },
];

export default function Badge07() {
  return (
    <article className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <header className="flex flex-wrap items-center gap-2">
        <BookMarked
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <h3 className="min-w-0 truncate text-sm font-semibold">
          <a
            href="#repository"
            className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            northwind/ui-kit
          </a>
        </h3>
        <Badge variant="outline" className="text-muted-foreground">
          Public
        </Badge>
      </header>
      <p className="text-sm text-muted-foreground">
        Accessible React components and design tokens used across every
        Northwind product.
      </p>
      <ul aria-label="Topics" className="flex flex-wrap gap-1.5">
        {topics.map((topic) => (
          <li key={topic}>
            <Badge
              variant="secondary"
              render={<a href={`#topic-${topic}`} />}
              className="text-primary"
            >
              {topic}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-1" />
          TypeScript
        </span>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <span key={stat.label} className="flex items-center gap-1 tabular-nums">
              <Icon aria-hidden="true" className="size-3.5" />
              {stat.value}
              <span className="sr-only"> {stat.label}</span>
            </span>
          );
        })}
        <span className="flex items-center gap-1">
          <Scale aria-hidden="true" className="size-3.5" />
          MIT license
        </span>
        <span>Updated 3 hours ago</span>
      </div>
    </article>
  );
}
