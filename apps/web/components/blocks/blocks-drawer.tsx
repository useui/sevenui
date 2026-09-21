"use client";

import { DrawerShell } from "../drawer-shell";
import { BlocksNav, type BlocksNavGroup } from "./blocks-nav";

export function BlocksDrawer({
  primitivesHref,
  groups,
}: {
  primitivesHref: string;
  groups: BlocksNavGroup[];
}) {
  return (
    <DrawerShell
      primitivesHref={primitivesHref}
      tree={
        <nav aria-label="Block categories">
          <BlocksNav groups={groups} />
        </nav>
      }
    />
  );
}
