"use client";

import { BadgeCheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

export default function ItemDemo() {
  return (
    <Item variant="outline" className="max-w-md">
      <ItemMedia variant="icon">
        <BadgeCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Your profile is verified</ItemTitle>
        <ItemDescription>
          Verification adds a badge next to your name on your public profile.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          View
        </Button>
      </ItemActions>
    </Item>
  );
}
