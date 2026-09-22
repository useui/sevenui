import type { ComponentType, ReactNode, SVGProps } from "react";
import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { BlocksAnnouncer } from "../../components/blocks/blocks-announcer";
import { BlocksDrawer } from "../../components/blocks/blocks-drawer";
import { BlocksLoadGate } from "../../components/blocks/blocks-load-gate";
import type { BlocksNavGroup } from "../../components/blocks/blocks-nav";
import { BlocksSidebar } from "../../components/blocks/blocks-sidebar";
import { ThemeDock } from "../../components/blocks/theme-dock";
import { loadBlocksTree } from "../../lib/blocks";
import { getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";
import { lucideIcon } from "../../lib/pro-manifest";

export const revalidate = 300;

const GROUP_ICON_CLASS = "size-3.5 text-muted-foreground";

export default async function BlocksLayout({ children }: { children: ReactNode }) {
  const [groups, tree] = await Promise.all([loadBlocksTree(), getNavTree()]);

  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/blocks/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  const navGroups: BlocksNavGroup[] = groups.map((group) => {
    const Icon = group.icon
      ? (lucideIcon(group.icon) as ComponentType<SVGProps<SVGSVGElement>>)
      : null;
    return {
      id: group.id,
      label: group.label,
      itemCount: group.items.length,
      icon: Icon ? <Icon aria-hidden="true" className={GROUP_ICON_CLASS} /> : null,
      categories: group.categories.map((category) => ({
        id: category.id,
        label: category.label,
        itemCount: category.items.length,
      })),
    };
  });

  return (
    <TooltipProvider>
      <BlocksAnnouncer>
        <BlocksLoadGate>
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <BlocksSidebar groups={navGroups} />
            <main className="min-w-0" id="content">
              {children}
              <ThemeDock />
            </main>
          </div>
          <BlocksDrawer groups={navGroups} primitivesHref={primitivesHref} />
        </BlocksLoadGate>
      </BlocksAnnouncer>
    </TooltipProvider>
  );
}
