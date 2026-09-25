"use client";

import { WebhookIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty03() {
  return (
    <Empty className="w-full max-w-xl flex-col items-start gap-4 border p-4 text-left sm:flex-row sm:items-center sm:gap-4">
      <EmptyMedia variant="icon" className="mb-0 size-10">
        <WebhookIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyHeader className="max-w-none flex-1 items-start gap-1">
        <EmptyTitle>No webhooks configured</EmptyTitle>
        <EmptyDescription>
          Send order and refund events to your own endpoint in real time.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="w-auto max-w-none items-start">
        <Button size="sm" variant="outline">
          Add endpoint
        </Button>
      </EmptyContent>
    </Empty>
  );
}
