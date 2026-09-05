import { ChevronRightIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

export default function Hero02() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto grid min-h-[480px] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <Badge variant="outline">Changelog — v0.6.0</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Your design system, without the maintenance bill
          </h1>
          <p className="text-lg text-muted-foreground">
            Start from battle-tested source instead of a blank file. Every
            block is plain React and Tailwind — edit anything, ship today.
          </p>
          <div className="flex gap-3">
            <Button size="lg">Browse blocks</Button>
            <Button size="lg" variant="ghost">
              Read the docs
              <ChevronRightIcon aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </Button>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted lg:block">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="border-b border-r border-border/40" />
            ))}
          </div>
          <div className="absolute inset-x-10 bottom-10 rounded-lg border border-border bg-background p-4 shadow-sm">
            <div className="h-2 w-1/3 rounded bg-primary/20" />
            <div className="mt-3 h-2 w-2/3 rounded bg-muted-foreground/20" />
            <div className="mt-2 h-2 w-1/2 rounded bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
