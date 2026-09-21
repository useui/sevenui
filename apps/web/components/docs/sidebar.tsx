"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavGroup, NavNode } from "../../lib/docs/nav";
import { currentTabForRoute, getSiteTabs } from "../../lib/site-tabs";
import { useDrawer } from "../drawer-context";

export function DocsSidebar({ primitivesHref, tree }: { primitivesHref: string; tree: NavNode[] }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);

  const asideRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);

  const [desktop, setDesktop] = useState(true);

  const [revealTick, setRevealTick] = useState(0);
  const onReveal = useCallback(() => setRevealTick((n) => n + 1), []);

  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    setDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setDesktop(event.matches);
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const box = asideRef.current;
    const scope = treeRef.current;
    if (!box || !scope) return;
    let link: HTMLElement | null = null;
    for (const anchor of scope.querySelectorAll<HTMLElement>('a[aria-current="page"]')) {
      if (anchor.getClientRects().length) {
        link = anchor;
        break;
      }
    }
    if (!link) return;
    const boxRect = box.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top >= boxRect.top && linkRect.bottom <= boxRect.bottom) return;
    box.scrollTop += linkRect.top - boxRect.top - (box.clientHeight - linkRect.height) / 2;
  }, [pathname, revealTick]);

  return (
    <>
      <aside
        aria-label="Primary"
        className={`fixed top-16 start-0 z-[35] h-[calc(100dvh-4rem)] w-64 max-w-[80vw] overflow-y-auto border-border border-e bg-background px-5 pt-4 pb-6 transition-transform lg:sticky lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0! lg:scrollbar-thin lg:scrollbar-thumb-border lg:scrollbar-track-transparent lg:bg-transparent lg:px-4 ${
          open ? "translate-x-0" : "-translate-x-[105%]"
        }`}
        inert={!desktop && !open}
        ref={asideRef}
      >
        <div className="mb-4 border-border border-b pb-4 lg:hidden">
          <nav aria-label="Sections">
            <ul className="m-0 list-none p-0">
              {tabs.map((tab) => (
                <li key={tab.href}>
                  <Link
                    aria-current={tab.href === activeTabHref ? "page" : undefined}
                    className="block rounded-[0.65rem] px-2.5 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                    href={tab.href}
                    onClick={closeDrawer}
                  >
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <NavList
          items={tree}
          listRef={treeRef}
          onNavigate={closeDrawer}
          onReveal={onReveal}
          pathname={pathname}
        />
      </aside>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/40 lg:hidden"
          onClick={closeDrawer}
          type="button"
        />
      )}
    </>
  );
}

function isGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

function containsRoute(node: NavNode, route: string): boolean {
  if (!isGroup(node)) return node.href === route;
  return node.href === route || node.children.some((child) => containsRoute(child, route));
}

type RowProps = {
  onNavigate: () => void;
  onReveal: () => void;
  pathname: string;
};

function NavList({
  items,
  listRef,
  onNavigate,
  onReveal,
  pathname,
}: RowProps & { items: NavNode[]; listRef?: React.Ref<HTMLUListElement> }) {
  return (
    <ul className="m-0 list-none space-y-px p-0" ref={listRef}>
      {items.map((item, index) =>
        isGroup(item) ? (
          <NavGroupRow
            group={item}
            key={item.label}
            onNavigate={onNavigate}
            onReveal={onReveal}
            pathname={pathname}
            spacing={index === 0 ? "mt-0" : "mt-0.5"}
          />
        ) : (
          <li key={item.href}>
            <Link
              aria-current={item.href === pathname ? "page" : undefined}
              className="block rounded-[0.65rem] px-2.5 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
              href={item.href}
              onClick={onNavigate}
            >
              <span className="flex items-center gap-2">
                <span className="flex-1 truncate">{item.label}</span>
              </span>
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

function NavGroupRow({
  group,
  onNavigate,
  onReveal,
  pathname,
  spacing,
}: RowProps & { group: NavGroup; spacing: string }) {
  const activeInside = containsRoute(group, pathname);
  const [open, setOpen] = useState(activeInside);

  useEffect(() => {
    if (activeInside) {
      setOpen(true); 
      onReveal();
    }
  }, [activeInside, onReveal]);

  return (
    <li className={spacing}>
      <details
        onToggle={(event) => setOpen(event.currentTarget.open)}
        open={open}
      >
        <summary
          className="flex cursor-pointer list-none items-center gap-1.5 rounded-[0.65rem] px-2.5 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if ((event.target as HTMLElement).closest("a")) event.preventDefault();
          }}
        >
          {group.href ? (
            <Link
              aria-current={group.href === pathname ? "page" : undefined}
              className="-my-1 flex flex-1 items-center gap-1.5 rounded py-1 transition-colors aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              href={group.href}
              onClick={onNavigate}
            >
              <span className="flex-1 truncate">{group.label}</span>
            </Link>
          ) : (
            <span className="flex-1 truncate">{group.label}</span>
          )}
          <span className="shrink-0 text-muted-foreground transition-transform [details[open]>summary_&]:rotate-90">
            <ChevronRight aria-hidden="true" size={13} />
          </span>
        </summary>
        <div className="space-y-0.5 border-border border-l pl-3">
          <NavList
            items={group.children}
            onNavigate={onNavigate}
            onReveal={onReveal}
            pathname={pathname}
          />
        </div>
      </details>
    </li>
  );
}
