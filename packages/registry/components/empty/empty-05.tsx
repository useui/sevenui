"use client";

import { CreditCardIcon, PlusIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty05() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment methods</CardTitle>
        <CardDescription>Used for your Pro plan renewals.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            Add card
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Empty className="gap-2 border bg-muted/30 p-4">
          <EmptyHeader className="gap-1">
            <EmptyMedia variant="icon" className="mb-1 size-7">
              <CreditCardIcon aria-hidden="true" className="size-3.5" />
            </EmptyMedia>
            <EmptyTitle className="text-[0.8rem]">No card on file</EmptyTitle>
            <EmptyDescription className="text-xs/relaxed">
              Your trial ends on October 12. Add a card to keep your projects
              online after that.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
