"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/registry/base/ui/item";

export default function Item01() {
  const [requested, setRequested] = React.useState(false);

  return (
    <Item variant="outline" className="w-full max-w-md">
      <ItemContent className="min-w-48">
        <ItemTitle>
          Export workspace data
          {requested ? (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
              Requested
            </span>
          ) : null}
        </ItemTitle>
        <ItemDescription aria-live="polite" className="line-clamp-none">
          {requested
            ? "We're preparing your ZIP and will email a download link when it's ready."
            : "Get a ZIP of every page, file, and comment. The download link expires after 24 hours."}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="ml-auto">
        {requested ? (
          <Button size="sm" variant="ghost" onClick={() => setRequested(false)}>
            Cancel request
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRequested(true)}
          >
            Request export
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}
