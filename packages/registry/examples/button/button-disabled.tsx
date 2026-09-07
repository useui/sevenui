"use client";

import { Button } from "@/registry/base/ui/button";

export default function ButtonDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>Default</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  );
}
