"use client";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function ButtonLoading() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled>
        <Spinner />
        Please wait
      </Button>
      <Button variant="outline" disabled>
        <Spinner />
        Saving draft
      </Button>
    </div>
  );
}
