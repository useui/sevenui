"use client";

import { ChevronDownIcon, TagIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const releases = [
  {
    version: "v2.4.0",
    date: "Sep 18, 2026",
    latest: true,
    changes: [
      "Scheduled exports now run in your workspace time zone.",
      "Comment threads can be resolved from the inbox.",
      "Fixed a crash when pasting tables with merged cells.",
    ],
  },
  {
    version: "v2.3.2",
    date: "Sep 4, 2026",
    latest: false,
    changes: [
      "Faster search indexing for workspaces over 10,000 pages.",
      "Fixed avatar uploads failing on Safari.",
    ],
  },
];

export default function Item08() {
  return (
    <ItemGroup aria-label="Release history" className="w-full max-w-md gap-2">
      {releases.map((release) => (
        <Collapsible
          key={release.version}
          defaultOpen={release.latest}
          role="listitem"
        >
          <Item variant="outline" className="has-data-open:bg-muted/40">
            <ItemMedia variant="icon" className="text-muted-foreground">
              <TagIcon aria-hidden="true" />
            </ItemMedia>
            <ItemContent className="gap-0.5">
              <ItemTitle>
                {release.version}
                {release.latest ? (
                  <Badge variant="secondary">Latest</Badge>
                ) : null}
              </ItemTitle>
              <ItemDescription className="text-xs">
                Released {release.date} &middot; {release.changes.length}{" "}
                changes
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <CollapsibleTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Toggle ${release.version} changes`}
                    className="group/trigger"
                  />
                }
              >
                <ChevronDownIcon
                  aria-hidden="true"
                  className="transition-transform duration-200 group-data-panel-open/trigger:rotate-180 motion-reduce:transition-none"
                />
              </CollapsibleTrigger>
            </ItemActions>
            <CollapsibleContent className="basis-full">
              <ul className="mt-1 ml-6.5 flex list-disc flex-col gap-1.5 border-t pt-3 pl-4 text-sm text-muted-foreground marker:text-muted-foreground/60">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Item>
        </Collapsible>
      ))}
    </ItemGroup>
  );
}
