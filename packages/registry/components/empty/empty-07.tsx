"use client";

import * as React from "react";
import { CheckCircle2Icon, LockIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty07() {
  const [requested, setRequested] = React.useState(false);

  return (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-10">
          <LockIcon aria-hidden="true" />
        </EmptyMedia>
        <Badge variant="outline">View only</Badge>
        <EmptyTitle>No reports in this workspace</EmptyTitle>
        <EmptyDescription id="empty-07-reason">
          You have viewer access to Finance. Editors can create reports and
          share them with you.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" disabled aria-describedby="empty-07-reason">
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            Create report
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={requested}
            onClick={() => setRequested(true)}
          >
            {requested ? "Request sent" : "Request edit access"}
          </Button>
        </div>
        <div aria-live="polite" className="min-h-5">
          {requested ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2Icon aria-hidden="true" className="size-3.5 text-success" />
              Maya Chen, the workspace owner, has been notified.
            </p>
          ) : null}
        </div>
      </EmptyContent>
    </Empty>
  );
}
