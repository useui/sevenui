"use client";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";
import { LabSection } from "../lab-frame";

export default function SpinnerMatrix() {
  return (
    <div>
      <LabSection title="sizes (muted on its own)">
        <Spinner className="size-3" />
        <Spinner />
        <Spinner className="size-6" />
        <Spinner className="size-8" />
      </LabSection>
      <LabSection title="inside a button or badge (takes the text colour)">
        <Button disabled>
          <Spinner data-icon="inline-start" />
          Saving
        </Button>
        <Button variant="outline" disabled>
          <Spinner data-icon="inline-start" />
          Saving
        </Button>
        <Badge variant="secondary">
          <Spinner data-icon="inline-start" />
          Syncing
        </Badge>
      </LabSection>
    </div>
  );
}
