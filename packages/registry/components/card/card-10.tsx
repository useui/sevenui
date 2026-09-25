"use client";

import { ArrowUpRight, BookOpen, KeyRound, Webhook } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const guides = [
  {
    href: "#authentication",
    icon: KeyRound,
    title: "Authenticate requests",
    description: "Create scoped API keys and rotate them without downtime.",
  },
  {
    href: "#webhooks",
    icon: Webhook,
    title: "Receive webhooks",
    description: "Verify signatures and retry failed deliveries safely.",
  },
  {
    href: "#quickstart",
    icon: BookOpen,
    title: "Quickstart",
    description: "Send your first event in under five minutes.",
  },
];

export default function Card10() {
  return (
    <nav aria-label="Developer guides" className="w-full max-w-md">
      <ul className="grid gap-3">
        {guides.map((guide) => (
          <li key={guide.href}>
            {/* The whole card is one link: a stretched ::after covers the surface. */}
            <Card
              size="sm"
              className="group/link relative transition-[box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/20 has-focus-visible:ring-2 has-focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
                <span className="row-span-2 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/link:bg-primary group-hover/link:text-primary-foreground">
                  <guide.icon aria-hidden="true" className="size-4" />
                </span>
                <CardTitle>
                  <a
                    href={guide.href}
                    className="outline-none after:absolute after:inset-0 after:rounded-xl"
                  >
                    {guide.title}
                  </a>
                </CardTitle>
                <ArrowUpRight
                  aria-hidden="true"
                  className="col-start-3 row-span-2 row-start-1 size-4 text-muted-foreground transition-transform duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-foreground"
                />
                <CardDescription className="col-start-2 text-xs">
                  {guide.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </nav>
  );
}
