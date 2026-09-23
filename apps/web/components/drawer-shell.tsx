"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, type ReactNode } from "react";
import { currentTabForRoute, getSiteTabs } from "../lib/site-tabs";
import { useDrawer } from "./drawer-context";

export function DrawerShell({ primitivesHref, tree }: { primitivesHref: string; tree?: ReactNode }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);

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
        className={`fixed top-16 start-0 z-[35] h-[calc(100dvh-4rem)] w-64 max-w-[80vw] overflow-y-auto border-border border-e bg-background px-5 pt-4 pb-6 transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-[105%] rtl:translate-x-[105%]"
        }`}
        inert={!open}
      >
        <nav aria-label="Sections" className={tree ? "mb-4 border-border border-b pb-4" : undefined}>
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
        {tree}
      </aside>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
    </>
  );
}
