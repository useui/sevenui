"use client";

import { BellIcon } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const variants = ["default", "outline", "muted"] as const;

export default function ItemVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {variants.map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemMedia variant="icon">
            <BellIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="capitalize">{variant}</ItemTitle>
            <ItemDescription>
              The {variant} variant of the item component.
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}
