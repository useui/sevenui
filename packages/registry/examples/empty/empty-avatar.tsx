"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function EmptyAvatar() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Avatar className="size-10">
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>Emma is offline</EmptyTitle>
        <EmptyDescription>
          Messages you send will be delivered when they come back online.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Leave a note
        </Button>
      </EmptyContent>
    </Empty>
  );
}
