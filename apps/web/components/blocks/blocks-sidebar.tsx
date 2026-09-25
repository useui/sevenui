import { BlocksNav, type BlocksNavGroup } from "./blocks-nav";

export function BlocksSidebar({ groups }: { groups: BlocksNavGroup[] }) {
  return (
    <div className="hidden lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-border lg:scrollbar-track-transparent lg:border-r lg:border-border lg:px-5 lg:py-8">
      <nav aria-label="Block categories">
        <BlocksNav groups={groups} />
      </nav>
    </div>
  );
}
