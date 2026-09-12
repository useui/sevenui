"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

export default function Button03() {
  return (
    <div className="flex flex-col items-start gap-4 text-left">
      <div>
        <h3 className="text-lg font-semibold">Ready to get started?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your workspace in minutes, no credit card required.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="lg">Get started</Button>
        <Button variant="ghost" size="lg">
          Learn more
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
