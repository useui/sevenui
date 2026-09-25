"use client";

import * as React from "react";
import {
  ArrowUpDownIcon,
  CommandIcon,
  CornerDownLeftIcon,
  SearchIcon,
  SlashIcon,
} from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const sections = [
  {
    label: "Navigation",
    shortcuts: [
      { icon: SearchIcon, action: "Open search", keys: ["Cmd", "K"] },
      {
        icon: ArrowUpDownIcon,
        action: "Move between results",
        keys: ["Up", "Down"],
      },
      {
        icon: CornerDownLeftIcon,
        action: "Open selected result",
        keys: ["Enter"],
      },
    ],
  },
  {
    label: "Editing",
    shortcuts: [
      { icon: SlashIcon, action: "Insert block", keys: ["/"] },
      { icon: CommandIcon, action: "Duplicate block", keys: ["Cmd", "D"] },
    ],
  },
];

export default function Item04() {
  const id = React.useId();

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-1.5 text-card-foreground">
      {sections.map((section, index) => (
        <div key={section.label}>
          {index > 0 ? <ItemSeparator className="my-1.5" /> : null}
          <p
            id={`${id}-${section.label.toLowerCase()}`}
            className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground"
          >
            {section.label}
          </p>
          <ItemGroup
            aria-labelledby={`${id}-${section.label.toLowerCase()}`}
            className="gap-0"
          >
            {section.shortcuts.map(({ icon: Icon, action, keys }) => (
              <Item key={action} role="listitem" size="xs">
                <ItemMedia variant="icon" className="text-muted-foreground">
                  <Icon aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-normal">{action}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <KbdGroup>
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      ))}
    </div>
  );
}
