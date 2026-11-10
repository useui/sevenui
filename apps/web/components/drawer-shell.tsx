"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, type ReactNode } from "react";
import { currentTabForRoute, getSiteTabs, type SiteTab } from "../lib/site-tabs";
import { useDrawer } from "./drawer-context";

export function DrawerShell({ primitivesHref, tree }: { primitivesHref: string; tree?: ReactNode }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);
  const groups = groupTabs(tabs);

  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
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

  return (
    <>
      <aside
        aria-label="Navigation"
        className={`fixed top-16 start-0 z-[35] h-[calc(100dvh-4rem)] w-72 max-w-[85vw] overflow-y-auto bg-background px-3 pt-2 pb-6 shadow-overlay ring-1 ring-foreground/10 transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-[105%] rtl:translate-x-[105%]"
        }`}
        inert={!open}
      >
        <nav aria-label="Main" className={tree ? "mb-4 pb-4" : undefined}>
          {groups.map((group) => (
            <div className="mb-3" key={group.label ?? group.tabs[0]?.href}>
              {group.label && (
                <p className="m-0 px-2.5 pt-2 pb-1.5 font-semibold text-docs-tertiary text-xs uppercase tracking-[0.3px]">
                  {group.label}
                </p>
              )}
              <ul className="m-0 list-none p-0">
                {group.tabs.map((tab) => (
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
            </div>
          ))}
        </nav>
        {tree}
      </aside>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
    </>
  );
}

/** The header's grouping, for the small-screen menu: Docs, the three libraries, Pro, then the project pages. */
const LIBRARY = new Set(["Primitives", "Components", "Blocks"]);
const RESOURCES = new Set(["Roadmap", "Block Request", "Support"]);

function groupTabs(tabs: SiteTab[]): { label?: string; tabs: SiteTab[] }[] {
  return [
    { tabs: tabs.filter((tab) => tab.label === "Docs" || tab.label === "Pro") },
    { label: "Library", tabs: tabs.filter((tab) => LIBRARY.has(tab.label)) },
    { label: "Resources", tabs: tabs.filter((tab) => RESOURCES.has(tab.label)) },
  ];
}
