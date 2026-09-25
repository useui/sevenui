"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/registry/base/ui/item";

const templates = [
  {
    name: "Sprint retrospective",
    description: "Went well, to improve, and action items with owners.",
    uses: "12.4k",
  },
  {
    name: "Customer interview",
    description: "Screener, question guide, and a synthesis grid.",
    uses: "8.1k",
  },
];

export default function Item05() {
  const [added, setAdded] = React.useState<string[]>([]);

  function toggle(name: string) {
    setAdded((current) =>
      current.includes(name)
        ? current.filter((entry) => entry !== name)
        : [...current, name],
    );
  }

  return (
    <ItemGroup className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
      {templates.map((template) => {
        const isAdded = added.includes(template.name);
        return (
          <Item
            key={template.name}
            role="listitem"
            variant="outline"
            className="items-stretch gap-3 p-2 pb-3"
          >
            <ItemHeader>
              <img
                src="/placeholder.svg"
                alt=""
                className="aspect-video w-full rounded-md bg-muted object-cover"
              />
            </ItemHeader>
            <ItemContent className="px-1">
              <ItemTitle>{template.name}</ItemTitle>
              <ItemDescription>{template.description}</ItemDescription>
            </ItemContent>
            <ItemFooter className="px-1">
              <span className="text-xs text-muted-foreground tabular-nums">
                {template.uses} uses
              </span>
              <Button
                size="sm"
                variant={isAdded ? "secondary" : "outline"}
                aria-pressed={isAdded}
                onClick={() => toggle(template.name)}
              >
                {isAdded ? (
                  <CheckIcon aria-hidden="true" data-icon="inline-start" />
                ) : null}
                {isAdded ? "Added" : "Use template"}
                <span className="sr-only">: {template.name}</span>
              </Button>
            </ItemFooter>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
