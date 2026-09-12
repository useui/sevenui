"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";

const members = [
  { name: "Emma Clark", role: "Design engineer", initials: "EC" },
  { name: "Jordan Lee", role: "Frontend developer", initials: "JL" },
  { name: "Sam Rivera", role: "Product manager", initials: "SR" },
];

export default function ItemGroupDemo() {
  return (
    <ItemGroup className="max-w-md gap-0 overflow-hidden rounded-lg border">
      {members.map((member, index) => (
        <React.Fragment key={member.name}>
          {index > 0 && <ItemSeparator className="my-0" />}
          <Item
            size="sm"
            className="rounded-none"
            render={<a href="#members" aria-label={member.name} />}
          >
            <ItemMedia>
              <Avatar className="size-8">
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{member.name}</ItemTitle>
              <ItemDescription>{member.role}</ItemDescription>
            </ItemContent>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  );
}
