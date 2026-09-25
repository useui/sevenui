"use client";

import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

const variants = [
  {
    variant: "default",
    use: "Primary state that needs attention",
    label: "Published",
  },
  {
    variant: "secondary",
    use: "Neutral metadata that sits in the background",
    label: "Draft",
  },
  {
    variant: "destructive",
    use: "Errors and blocking problems",
    label: "Payment failed",
  },
  {
    variant: "outline",
    use: "Versions, identifiers, and quiet labels",
    label: "v2.4.1",
  },
  {
    variant: "ghost",
    use: "Low-emphasis counts inside dense rows",
    label: "14 comments",
  },
] as const;

export default function Badge04() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <dl className="divide-y divide-border">
        {variants.map((item) => (
          <div
            key={item.variant}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <dt className="font-mono text-xs text-foreground">
                {item.variant}
              </dt>
              <dd className="mt-0.5 text-xs text-muted-foreground">
                {item.use}
              </dd>
            </div>
            <Badge variant={item.variant}>{item.label}</Badge>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <dt className="font-mono text-xs text-foreground">link</dt>
            <dd className="mt-0.5 text-xs text-muted-foreground">
              A badge that navigates somewhere
            </dd>
          </div>
          <Badge variant="link" render={<a href="#changelog" />}>
            Changelog
            <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
          </Badge>
        </div>
      </dl>
    </div>
  );
}
