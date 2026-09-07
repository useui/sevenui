"use client";

import { Button } from "@/registry/base/ui/button";
import { Kbd } from "@/registry/base/ui/kbd";

export default function KbdButton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline">
        Accept <Kbd>⏎</Kbd>
      </Button>
      <Button variant="outline">
        Cancel <Kbd>Esc</Kbd>
      </Button>
    </div>
  );
}
