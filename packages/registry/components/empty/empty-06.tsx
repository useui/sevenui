"use client";

import * as React from "react";
import { CheckIcon, UserPlusIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

const suggestedReviewers = [
  { initials: "PR", name: "Priya Raman" },
  { initials: "MO", name: "Marcus Osei" },
  { initials: "LV", name: "Lena Vogel" },
];

export default function Empty06() {
  const [requested, setRequested] = React.useState(false);

  return (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia>
          <AvatarGroup aria-hidden="true">
            {suggestedReviewers.map((reviewer) => (
              <Avatar
                key={reviewer.initials}
                size="lg"
                className={requested ? undefined : "opacity-60"}
              >
                <AvatarFallback className="text-xs">
                  {reviewer.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount className="border border-dashed border-muted-foreground/40 bg-background">
              {requested ? <CheckIcon /> : <UserPlusIcon />}
            </AvatarGroupCount>
          </AvatarGroup>
        </EmptyMedia>
        <EmptyTitle>
          {requested ? "Review requested" : "No reviewers on this pull request"}
        </EmptyTitle>
        <EmptyDescription>
          {requested
            ? "Priya, Marcus, and Lena were notified. Merging unlocks after one approval."
            : "Based on CODEOWNERS, Priya, Marcus, and Lena usually review changes to billing/."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            size="sm"
            disabled={requested}
            onClick={() => setRequested(true)}
          >
            {requested ? "Requested" : "Request all 3"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRequested(false)}
          >
            {requested ? "Undo request" : "Choose reviewers"}
          </Button>
        </div>
        <p aria-live="polite" className="sr-only">
          {requested ? "Review requested from 3 code owners." : ""}
        </p>
      </EmptyContent>
    </Empty>
  );
}
