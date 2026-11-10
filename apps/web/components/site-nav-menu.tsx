"use client";

import { NavigationMenu } from "@base-ui/react/navigation-menu";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  FileText,
  LayoutGrid,
  LifeBuoy,
  type LucideIcon,
  Map as MapIcon,
  MessageSquarePlus,
  Rows3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { LayerCard, LayerCardFooter, LayerCardHeader, LayerCardPanel, LayerCardTitle } from "@/registry/base/ui/layer-card";
import type { BlocksNav } from "../lib/shell-nav";
import {
  AGENT_LINKS,
  FEATURED_PRIMITIVE,
  type HeaderNav,
  headerSectionFor,
  isUnder,
  type NavEntry,
  RESOURCES,
  type ResourceLink,
} from "../lib/site-nav";

const RESOURCE_ICONS: Record<ResourceLink["icon"], LucideIcon> = {
  roadmap: MapIcon,
  request: MessageSquarePlus,
  support: LifeBuoy,
};

/** Top-level entries: a link and a menu trigger share one footprint, so the row reads as one set. */
const topClass =
  "group/top inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-[10px] px-2.5 font-medium text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:focus-ring data-popup-open:text-foreground data-[current]:text-foreground";

/** A row in a menu column. */
const rowClass =
  "flex h-8 items-center justify-between gap-3 rounded-lg px-2.5 font-medium text-muted-foreground text-sm outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:focus-ring focus-visible:[--focus-gap:-1.5px] data-active:bg-muted data-active:text-foreground";

const countClass = "shrink-0 font-medium text-docs-tertiary text-xs tabular-nums";

/**
 * The header's main navigation on Base UI's NavigationMenu: Docs, a Library menu with the three libraries
 * side by side, a Resources menu, and Pro. One popup follows whichever trigger is open and resizes between
 * the two menus. Blocks come from /blocks-nav.json the first time the Library menu is about to open.
 */
export function SiteNavMenu({ nav }: { nav: HeaderNav }) {
  const pathname = usePathname();
  const section = headerSectionFor(pathname);
  const { blocks, load } = useBlocksNav();

  return (
    <NavigationMenu.Root
      aria-label="Main"
      className="ms-3 hidden lg:block xl:ms-5"
      onValueChange={(value) => {
        if (value === "library") load();
      }}
    >
      <NavigationMenu.List className="flex items-center gap-0.5">
        <TopLink current={section === "docs"} href="/docs">
          Docs
        </TopLink>

        <NavigationMenu.Item value="library">
          <TopTrigger current={section === "library"} onIntent={load}>
            Library
          </TopTrigger>
          <NavigationMenu.Content className="site-nav-content w-[min(57rem,calc(100vw-2rem))] p-2">
            <LibraryPanel blocks={blocks} nav={nav} pathname={pathname} />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="resources">
          <TopTrigger current={section === "resources"}>Resources</TopTrigger>
          <NavigationMenu.Content className="site-nav-content w-[24rem] p-2">
            <ResourcesPanel pathname={pathname} version={nav.version} />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <TopLink current={section === "pro"} href="/pro">
          Pro
        </TopLink>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          className="site-nav-positioner z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
          align="start"
          alignOffset={-8}
          collisionAvoidance={{ side: "none" }}
          collisionPadding={16}
          sideOffset={10}
        >
          <NavigationMenu.Popup className="site-nav-popup relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-[1.25rem] bg-docs-panel shadow-overlay ring-1 ring-foreground/10 outline-none">
            <NavigationMenu.Viewport className="relative size-full overflow-hidden rounded-[inherit]" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TopLink({ children, current, href }: { children: ReactNode; current: boolean; href: string }) {
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link
        aria-current={current ? "page" : undefined}
        className={topClass}
        data-current={current ? "" : undefined}
        render={<Link href={href} />}
      >
        {children}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

function TopTrigger({ children, current, onIntent }: { children: ReactNode; current: boolean; onIntent?: () => void }) {
  return (
    <NavigationMenu.Trigger
      className={topClass}
      data-current={current ? "" : undefined}
      onFocus={onIntent}
      onPointerEnter={onIntent}
    >
      {children}
      <NavigationMenu.Icon className="text-docs-tertiary transition-transform duration-200 group-data-popup-open/top:rotate-180 motion-reduce:transition-none">
        <ChevronDown aria-hidden="true" size={14} strokeWidth={2} />
      </NavigationMenu.Icon>
    </NavigationMenu.Trigger>
  );
}

/** A link inside a menu. It closes the menu on click, so the next page opens without it. */
function MenuLink({
  active,
  children,
  className,
  href,
}: {
  active?: boolean;
  children: ReactNode;
  className: string;
  href: string;
}) {
  return (
    <NavigationMenu.Link
      active={active}
      aria-current={active ? "page" : undefined}
      className={className}
      closeOnClick
      render={<Link href={href} />}
    >
      {children}
    </NavigationMenu.Link>
  );
}

/** A column's heading: an icon tile, the library's name with its count, and one line on what it holds. */
function ColumnHead({
  count,
  description,
  href,
  icon: Icon,
  label,
  pathname,
}: {
  count?: number;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
}) {
  return (
    <MenuLink
      active={pathname === href}
      className="group/head flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:focus-ring focus-visible:[--focus-gap:-1.5px] data-active:bg-muted"
      href={href}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-muted text-foreground transition-[background-color,box-shadow] group-hover/head:bg-docs-panel group-hover/head:shadow-[var(--elevation-raised)] group-focus-visible/head:bg-docs-panel group-data-active/head:bg-docs-panel">
        <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2 font-medium text-foreground text-sm">
          {label}
          {count !== undefined && <span className={countClass}>{count}</span>}
        </span>
        <span className="mt-0.5 block text-muted-foreground text-xs leading-[17px]">{description}</span>
      </span>
    </MenuLink>
  );
}

function Rows({ items, pathname }: { items: NavEntry[]; pathname: string }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.href}>
          <MenuLink active={pathname === item.href} className={rowClass} href={item.href}>
            <span className="truncate">{item.label}</span>
            {item.count !== undefined && <span className={countClass}>{item.count}</span>}
          </MenuLink>
        </li>
      ))}
    </ul>
  );
}

function AllLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <MenuLink
      className="group/all mt-1 flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium text-foreground text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:focus-ring focus-visible:[--focus-gap:-1.5px]"
      href={href}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="text-docs-tertiary transition-transform duration-200 group-hover/all:translate-x-0.5 group-hover/all:text-foreground motion-reduce:transition-none"
        size={14}
      />
    </MenuLink>
  );
}

function LibraryPanel({ blocks, nav, pathname }: { blocks?: BlocksNav; nav: HeaderNav; pathname: string }) {
  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_15rem] gap-1">
      <section aria-label="Primitives" className="flex min-w-0 flex-col">
        <ColumnHead
          count={nav.primitives.count}
          description="Installable units on Base UI, one command each."
          href={nav.primitives.href}
          icon={Boxes}
          label="Primitives"
          pathname={pathname}
        />
        <Rows items={nav.primitives.picks} pathname={pathname} />
        <AllLink href={nav.primitives.href}>All {nav.primitives.count} primitives</AllLink>
      </section>

      <section aria-label="Components" className="flex min-w-0 flex-col">
        <ColumnHead
          count={nav.components.count}
          description="Free, composed examples to copy and go."
          href="/components"
          icon={LayoutGrid}
          label="Components"
          pathname={pathname}
        />
        <Rows items={nav.components.families} pathname={pathname} />
        <AllLink href="/components">All {nav.components.count} components</AllLink>
      </section>

      <section aria-label="Blocks" className="flex min-w-0 flex-col">
        <ColumnHead
          count={blocks?.total}
          description="Full sections and pages, with a Pro license."
          href="/blocks"
          icon={Rows3}
          label="Blocks"
          pathname={pathname}
        />
        {blocks ? (
          <Rows
            items={blocks.branches.map((branch) => ({ label: branch.label, href: branch.href ?? "/blocks", count: branch.count }))}
            pathname={pathname}
          />
        ) : (
          <ul aria-busy="true" aria-label="Loading block groups" className="m-0 list-none p-0">
            {[0, 1, 2, 3].map((index) => (
              <li className="flex h-8 items-center px-2.5" key={index}>
                <span className="h-2.5 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
              </li>
            ))}
          </ul>
        )}
        <AllLink href="/blocks">{blocks ? `All ${blocks.total} blocks` : "All blocks"}</AllLink>
        <AllLink href="/pro">See Pro</AllLink>
      </section>

      <FeatureCard pathname={pathname} />
    </div>
  );
}

/** The newest primitive, drawn with itself: a Layer Card whose panel holds a smaller Layer Card. */
function FeatureCard({ pathname }: { pathname: string }) {
  return (
    <MenuLink
      active={isUnder(pathname, FEATURED_PRIMITIVE.href)}
      className="group/feature flex rounded-[1.05rem] outline-none focus-visible:focus-ring"
      href={FEATURED_PRIMITIVE.href}
    >
      <LayerCard className="w-full transition-[border-color] group-hover/feature:[--layer-card-border-color:var(--hairline-strong)]">
        <LayerCardPanel className="grid h-36 place-items-center overflow-hidden">
          <LayerCard
            aria-hidden="true"
            className="w-44 transition-transform duration-300 group-hover/feature:-translate-y-0.5 motion-reduce:transition-none"
            size="xs"
          >
            <LayerCardHeader>
              <LayerCardTitle className="flex items-center justify-between text-[11px]">
                Revenue
                <span className="font-normal text-docs-tertiary tabular-nums">+12%</span>
              </LayerCardTitle>
            </LayerCardHeader>
            <LayerCardPanel className="grid gap-2">
              <span className="font-medium text-foreground text-sm tabular-nums">$48,210</span>
              <span className="flex h-6 items-end gap-1">
                {[40, 65, 50, 80, 60, 95, 75].map((height) => (
                  <span className="flex-1 rounded-[2px] bg-foreground/70" key={height} style={{ height: `${height}%` }} />
                ))}
              </span>
            </LayerCardPanel>
          </LayerCard>
        </LayerCardPanel>
        <LayerCardFooter className="flex-col items-start gap-1 pt-2.5 pb-2">
          <span className="flex items-center gap-2 font-medium text-foreground text-sm">
            {FEATURED_PRIMITIVE.label}
            <span className="rounded-full bg-muted px-1.5 py-px font-semibold text-[10px] text-foreground uppercase tracking-[0.3px]">
              New
            </span>
          </span>
          <span className="text-muted-foreground text-xs leading-[17px]">{FEATURED_PRIMITIVE.description}</span>
        </LayerCardFooter>
      </LayerCard>
    </MenuLink>
  );
}

function ResourcesPanel({ pathname, version }: { pathname: string; version: string }) {
  return (
    <div className="flex flex-col">
      {RESOURCES.map((resource) => {
        const Icon = RESOURCE_ICONS[resource.icon];
        return (
          <MenuLink
            active={isUnder(pathname, resource.href)}
            className="group/res flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:focus-ring focus-visible:[--focus-gap:-1.5px] data-active:bg-muted"
            href={resource.href}
            key={resource.href}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-muted text-foreground transition-[background-color,box-shadow] group-hover/res:bg-docs-panel group-hover/res:shadow-[var(--elevation-raised)] group-focus-visible/res:bg-docs-panel group-data-active/res:bg-docs-panel">
              <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 font-medium text-foreground text-sm">
                {resource.label}
                {resource.icon === "roadmap" && <span className={countClass}>v{version}</span>}
              </span>
              <span className="mt-0.5 block text-muted-foreground text-xs leading-[17px]">{resource.description}</span>
            </span>
          </MenuLink>
        );
      })}

      <p className="m-0 px-2.5 pt-3 pb-1.5 font-semibold text-docs-tertiary text-xs uppercase tracking-[0.3px]">For agents</p>
      <ul className="m-0 list-none p-0">
        {AGENT_LINKS.map((link) => (
          <li key={link.href}>
            {/* Plain anchors: these are text files served by route handlers, not pages to prefetch. */}
            <NavigationMenu.Link className={rowClass} closeOnClick href={link.href}>
              <span className="inline-flex items-center gap-2.5">
                <FileText aria-hidden="true" className="text-docs-tertiary" size={14} strokeWidth={1.75} />
                <span className="font-mono text-[13px] text-foreground">{link.label}</span>
              </span>
              <span className="truncate text-docs-tertiary text-xs">{link.description}</span>
            </NavigationMenu.Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One fetch of the blocks directory per page load, shared by every caller. */
let blocksRequest: Promise<BlocksNav | undefined> | undefined;

function useBlocksNav() {
  const [blocks, setBlocks] = useState<BlocksNav | undefined>(undefined);

  const load = useCallback(() => {
    if (!blocksRequest) {
      blocksRequest = fetch("/blocks-nav.json")
        .then((response) => (response.ok ? (response.json() as Promise<BlocksNav>) : undefined))
        .catch((error) => {
          console.error("[header] blocks nav:", error);
          blocksRequest = undefined;
          return undefined;
        });
    }
    blocksRequest.then((data) => data && setBlocks(data));
  }, []);

  // Another mount (a client navigation re-rendering the header) picks up a finished request at once.
  useEffect(() => {
    if (blocksRequest) blocksRequest.then((data) => data && setBlocks(data));
  }, []);

  return { blocks, load };
}
