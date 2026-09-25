"use client";

import { CloudIcon, HistoryIcon, ShieldCheckIcon } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const features = [
  {
    icon: CloudIcon,
    title: "2 TB of encrypted storage",
    description:
      "Shared across every workspace member, with no per-file limit.",
  },
  {
    icon: HistoryIcon,
    title: "180-day version history",
    description: "Restore any file to an earlier revision in one click.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Admin audit log",
    description: "Every share, download, and permission change is recorded.",
  },
];

export default function Item02() {
  return (
    <ItemGroup className="w-full max-w-md gap-2">
      {features.map(({ icon: Icon, title, description }) => (
        <Item key={title} role="listitem" variant="muted">
          <ItemMedia
            variant="icon"
            className="size-9 rounded-md border border-border bg-background text-foreground"
          >
            <Icon aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{title}</ItemTitle>
            <ItemDescription className="line-clamp-none">
              {description}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
