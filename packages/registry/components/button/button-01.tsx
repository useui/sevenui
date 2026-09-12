"use client";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function Button01() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>
        <Spinner />
        Saving changes
      </Button>
      <Button>Save changes</Button>
    </div>
  );
}
